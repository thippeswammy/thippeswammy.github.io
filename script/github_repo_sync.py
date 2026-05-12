import os
import json
import urllib.parse
import requests
import tkinter as tk
from tkinter import messagebox, ttk
import threading
from datetime import datetime

# --- Configuration & Constants ---
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN")
META_FILE = ".sync_meta.json"
USER_AGENT = "GitHubRepoSync-Advanced-v4"
THEME_COLOR = "#212529"
ACCENT_COLOR = "#0d6efd"
SUCCESS_COLOR = "#198754"
BG_COLOR = "#f8f9fa"

# --- Helper Functions ---

def get_headers(etag=None):
    headers = {
        "User-Agent": USER_AGENT,
        "Accept": "application/vnd.github.v3+json"
    }
    if GITHUB_TOKEN:
        headers["Authorization"] = f"token {GITHUB_TOKEN}"
    if etag:
        headers["If-None-Match"] = etag
    return headers

def load_meta():
    if os.path.exists(META_FILE):
        try:
            with open(META_FILE, "r") as f:
                return json.load(f)
        except:
            return {}
    return {"repos": {}, "selected_repos": [], "last_sync": None}

def save_meta(meta):
    with open(META_FILE, "w") as f:
        json.dump(meta, f, indent=4)

def handle_error(response, context, log_func=print):
    try:
        error_msg = response.json().get('message', 'No detail available')
    except:
        error_msg = response.text[:100]
    
    log_func(f"Error {context}: {response.status_code}")
    log_func(f"Message: {error_msg}")

# --- API Interaction ---

def fetch_repos(username):
    # If authenticated, use /user/repos to get private repos and more info
    if GITHUB_TOKEN:
        url = "https://api.github.com/user/repos?per_page=100&type=all&sort=pushed"
    else:
        url = f"https://api.github.com/users/{username}/repos?per_page=100"
        
    try:
        response = requests.get(url, headers=get_headers())
        if response.status_code == 200:
            repos = response.json()
            # If authenticated, we might get repos where we are only a member, filter for owner
            if GITHUB_TOKEN:
                repos = [r for r in repos if r.get('owner', {}).get('login', '').lower() == username.lower()]
            return repos
        else:
            handle_error(response, f"fetching repos for {username}")
            return []
    except Exception as e:
        print(f"Connection error: {e}")
        return []

def download_md_files(username, repo_obj, meta, progress_callback, log_callback):
    repo_name = repo_obj['name']
    pushed_at = repo_obj['pushed_at']
    repo_meta = meta.get("repos", {}).get(repo_name, {"files": {}, "etag": None, "last_pushed": None})
    
    if repo_meta.get("last_pushed") == pushed_at:
        log_callback(f"Skipping {repo_name} - No changes since last sync.")
        return 0
    
    log_callback(f"Checking {repo_name}...")
    headers = get_headers(repo_meta.get("etag"))
    branch = repo_obj.get('default_branch', 'main')
    
    # Use the owner login from the repo object itself
    owner = repo_obj['owner']['login']
    tree_url = f"https://api.github.com/repos/{owner}/{repo_name}/git/trees/{branch}?recursive=1"
    res = requests.get(tree_url, headers=headers)
    
    if res.status_code == 304:
        log_callback(f"  Unchanged (ETag Match).")
        if repo_name not in meta["repos"]: meta["repos"][repo_name] = repo_meta
        meta["repos"][repo_name]["last_pushed"] = pushed_at
        return 0
        
    if res.status_code != 200:
        handle_error(res, f"fetching tree for {repo_name}", log_callback)
        return 0
    
    new_etag = res.headers.get("ETag")
    tree = res.json().get('tree', [])
    ignored_files = {'setup.md', 'contribution.md', 'contributing.md'}
    md_files = [
        item for item in tree 
        if item['type'] == 'blob' 
        and item['path'].endswith('.md')
        and item['path'].split('/')[-1].lower() not in ignored_files
    ]
    
    count = 0
    skipped = 0
    for item in md_files:
        path = item['path']
        remote_sha = item['sha']
        local_sha = repo_meta.get("files", {}).get(path)
        
        if local_sha == remote_sha:
            skipped += 1
            continue
            
        encoded_path = urllib.parse.quote(path)
        raw_url = f"https://raw.githubusercontent.com/{owner}/{repo_name}/{branch}/{encoded_path}"
        res = requests.get(raw_url, headers=get_headers())
        
        if res.status_code == 200:
            local_path = os.path.join(repo_name, path)
            os.makedirs(os.path.dirname(local_path), exist_ok=True)
            with open(local_path, "w", encoding="utf-8") as f:
                f.write(res.text)
            
            if "repos" not in meta: meta["repos"] = {}
            if repo_name not in meta["repos"]: meta["repos"][repo_name] = {"files": {}, "etag": None}
            meta["repos"][repo_name]["files"][path] = remote_sha
            
            count += 1
            log_callback(f"  Updated: {path}")
        else:
            log_callback(f"  Failed: {path} ({res.status_code})")
        
        progress_callback()
        
    if repo_name not in meta["repos"]: meta["repos"][repo_name] = {"files": {}}
    meta["repos"][repo_name]["etag"] = new_etag
    meta["repos"][repo_name]["last_pushed"] = pushed_at
    
    if skipped > 0:
        log_callback(f"  Skipped {skipped} unchanged files.")
    
    return count

# --- GUI Application ---

class AdvancedRepoSyncApp:
    def __init__(self, root, username):
        self.root = root
        self.username = username
        self.meta = load_meta()
        self.repos_data = fetch_repos(username)
        self.all_repos = sorted(self.repos_data, key=lambda x: x['name'].lower())
        self.vars = {}
        self.checkbuttons = []
        
        self.setup_ui()
        self.load_preferences()

    def setup_ui(self):
        self.root.title("GitHub Portfolio Sync Engine")
        self.root.geometry("600x850")
        self.root.configure(bg=BG_COLOR)
        
        style = ttk.Style()
        style.configure("TFrame", background=BG_COLOR)
        style.configure("TLabel", background=BG_COLOR, font=("Segoe UI", 10))
        style.configure("Header.TLabel", font=("Segoe UI", 14, "bold"), foreground=THEME_COLOR)
        style.configure("Action.TButton", font=("Segoe UI", 10, "bold"))
        
        # Header
        header_frame = ttk.Frame(self.root, padding=20)
        header_frame.pack(fill="x")
        ttk.Label(header_frame, text="Sync Engine", style="Header.TLabel").pack(side="left")
        
        auth_status = "Authenticated" if GITHUB_TOKEN else "Unauthenticated (Limited)"
        auth_color = SUCCESS_COLOR if GITHUB_TOKEN else "#dc3545"
        self.status_label = tk.Label(header_frame, text=auth_status, fg=auth_color, bg=BG_COLOR, font=("Segoe UI", 9, "italic"))
        self.status_label.pack(side="right")

        # Filters and Search
        controls_frame = ttk.Frame(self.root, padding=(20, 0))
        controls_frame.pack(fill="x")

        # Row 1: Search
        search_row = ttk.Frame(controls_frame)
        search_row.pack(fill="x", pady=(0, 10))
        ttk.Label(search_row, text="Search:").pack(side="left", padx=(0, 5))
        self.search_var = tk.StringVar()
        self.search_var.trace_add("write", self.filter_repos)
        self.search_entry = ttk.Entry(search_row, textvariable=self.search_var)
        self.search_entry.pack(side="left", fill="x", expand=True)

        # Row 2: Type Filters
        filter_row = ttk.Frame(controls_frame)
        filter_row.pack(fill="x", pady=(0, 10))
        ttk.Label(filter_row, text="Filter:").pack(side="left", padx=(0, 5))
        self.type_filter = tk.StringVar(value="all")
        for text, val in [("All", "all"), ("Sources Only", "source"), ("Forks Only", "fork")]:
            ttk.Radiobutton(filter_row, text=text, value=val, variable=self.type_filter, 
                            command=self.filter_repos).pack(side="left", padx=10)

        # Row 3: Bulk Actions
        action_row = ttk.Frame(controls_frame)
        action_row.pack(fill="x")
        ttk.Button(action_row, text="Select All Visible", command=self.select_all).pack(side="left", padx=(0, 5))
        ttk.Button(action_row, text="Clear All", command=self.clear_all).pack(side="left")

        # Repo List
        list_container = ttk.Frame(self.root, padding=20)
        list_container.pack(fill="both", expand=True)
        self.canvas = tk.Canvas(list_container, bg="white", highlightthickness=0)
        self.scrollbar = ttk.Scrollbar(list_container, orient="vertical", command=self.canvas.yview)
        self.scrollable_frame = tk.Frame(self.canvas, bg="white")
        self.scrollable_frame.bind("<Configure>", lambda e: self.canvas.configure(scrollregion=self.canvas.bbox("all")))
        self.canvas_window = self.canvas.create_window((0, 0), window=self.scrollable_frame, anchor="nw")
        self.canvas.configure(yscrollcommand=self.scrollbar.set)
        self.canvas.pack(side="left", fill="both", expand=True)
        self.scrollbar.pack(side="right", fill="y")
        self.canvas.bind_all("<MouseWheel>", lambda e: self.canvas.yview_scroll(int(-1*(e.delta/120)), "units"))
        self.root.bind("<Configure>", self.on_resize)

        self.render_repo_list()

        # Log Area
        log_frame = ttk.Frame(self.root, padding=(20, 10))
        log_frame.pack(fill="both", expand=False)
        ttk.Label(log_frame, text="Activity Log", font=("Segoe UI", 9, "bold")).pack(anchor="w")
        self.log_text = tk.Text(log_frame, height=8, font=("Consolas", 9), bg="#f1f3f5", state="disabled")
        self.log_text.pack(fill="both", expand=True)

        # Progress Bar
        self.progress_var = tk.DoubleVar()
        self.progress = ttk.Progressbar(self.root, variable=self.progress_var, maximum=100)
        self.progress.pack(fill="x", padx=20, pady=(10, 0))

        # Bottom Actions
        bottom_frame = ttk.Frame(self.root, padding=20)
        bottom_frame.pack(fill="x")
        self.sync_btn = tk.Button(bottom_frame, text="START SYNC ENGINE", command=self.start_sync_thread, 
                                 bg=ACCENT_COLOR, fg="white", font=("Segoe UI", 11, "bold"), 
                                 relief="flat", pady=10)
        self.sync_btn.pack(fill="x")

    def on_resize(self, event):
        self.canvas.itemconfig(self.canvas_window, width=max(event.width - 60, 100))

    def render_repo_list(self, *args):
        for cb in self.checkbuttons:
            cb.destroy()
        self.checkbuttons = []

        filter_text = self.search_var.get().lower()
        filter_type = self.type_filter.get()

        for repo_obj in self.all_repos:
            repo_name = repo_obj['name']
            is_fork = repo_obj.get('fork', False)
            is_private = repo_obj.get('private', False)
            
            # Filter logic
            if filter_text not in repo_name.lower(): continue
            if filter_type == "source" and is_fork: continue
            if filter_type == "fork" and not is_fork: continue

            if repo_name not in self.vars:
                self.vars[repo_name] = tk.BooleanVar()
            
            label_text = f"{repo_name} {'(Fork)' if is_fork else ''} {'[Private]' if is_private else ''}"
            cb_color = "#6c757d" if is_fork else THEME_COLOR
            if is_private: cb_color = SUCCESS_COLOR # Highlight private repos in green
            
            cb = tk.Checkbutton(self.scrollable_frame, text=label_text, variable=self.vars[repo_name], 
                               bg="white", font=("Segoe UI", 10), anchor="w", 
                               fg=cb_color, activebackground=BG_COLOR)
            cb.pack(fill="x", padx=10, pady=2)
            self.checkbuttons.append(cb)

    def filter_repos(self, *args):
        self.render_repo_list()

    def select_all(self):
        filter_text = self.search_var.get().lower()
        filter_type = self.type_filter.get()
        for repo_obj in self.all_repos:
            name = repo_obj['name']
            is_fork = repo_obj.get('fork', False)
            if filter_text in name.lower():
                if filter_type == "all" or (filter_type == "source" and not is_fork) or (filter_type == "fork" and is_fork):
                    self.vars[name].set(True)

    def clear_all(self):
        for var in self.vars.values():
            var.set(False)

    def log(self, message):
        self.log_text.config(state="normal")
        self.log_text.insert("end", f"{message}\n")
        self.log_text.see("end")
        self.log_text.config(state="disabled")
        self.root.update_idletasks()

    def load_preferences(self):
        selected = self.meta.get("selected_repos", [])
        for repo in selected:
            if repo in self.vars:
                self.vars[repo].set(True)

    def save_preferences(self):
        selected = [repo for repo, var in self.vars.items() if var.get()]
        self.meta["selected_repos"] = selected
        save_meta(self.meta)

    def start_sync_thread(self):
        selected_names = [repo for repo, var in self.vars.items() if var.get()]
        if not selected_names:
            messagebox.showwarning("No Selection", "Select at least one repository.")
            return
        
        selected_repos = [r for r in self.repos_data if r['name'] in selected_names]
        self.save_preferences()
        self.sync_btn.config(state="disabled", text="SYNCING...")
        self.progress_var.set(0)
        
        thread = threading.Thread(target=self.run_sync, args=(selected_repos,))
        thread.daemon = True
        thread.start()

    def run_sync(self, selected_repos):
        total_repos = len(selected_repos)
        total_files = 0
        self.log(f"--- Starting Sync for {total_repos} repositories ---")
        
        for i, repo_obj in enumerate(selected_repos):
            self.log(f"[{i+1}/{total_repos}] Processing {repo_obj['name']}...")
            files_updated = download_md_files(self.username, repo_obj, self.meta, lambda: None, self.log)
            total_files += files_updated
            self.progress_var.set(((i + 1) / total_repos) * 100)
            
        self.meta["last_sync"] = datetime.utcnow().isoformat()
        save_meta(self.meta)
        self.log(f"--- Sync Complete. {total_files} files updated. ---")
        self.root.after(0, lambda: self.finish_sync(total_files))

    def finish_sync(self, count):
        self.sync_btn.config(state="normal", text="START SYNC ENGINE")
        messagebox.showinfo("Sync Done", f"Process complete. {count} new/updated files downloaded.")

if __name__ == "__main__":
    GITHUB_USER = "thippeswammy"
    root = tk.Tk()
    app = AdvancedRepoSyncApp(root, GITHUB_USER)
    root.mainloop()