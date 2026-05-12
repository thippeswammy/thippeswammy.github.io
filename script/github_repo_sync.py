import os
import json
import urllib.parse
import requests
import tkinter as tk
from tkinter import messagebox, ttk
import threading
import time

# --- Configuration & Constants ---
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN")
META_FILE = ".sync_meta.json"
USER_AGENT = "GitHubRepoSync-Advanced-v2"
THEME_COLOR = "#212529"
ACCENT_COLOR = "#0d6efd"
SUCCESS_COLOR = "#198754"
BG_COLOR = "#f8f9fa"

# --- Helper Functions ---

def get_headers():
    headers = {
        "User-Agent": USER_AGENT,
        "Accept": "application/vnd.github.v3+json"
    }
    if GITHUB_TOKEN:
        headers["Authorization"] = f"token {GITHUB_TOKEN}"
    return headers

def load_meta():
    if os.path.exists(META_FILE):
        try:
            with open(META_FILE, "r") as f:
                return json.load(f)
        except:
            return {}
    return {}

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
    url = f"https://api.github.com/users/{username}/repos?per_page=100"
    try:
        response = requests.get(url, headers=get_headers())
        if response.status_code == 200:
            return response.json()
        else:
            handle_error(response, f"fetching repos for {username}")
            return []
    except Exception as e:
        print(f"Connection error: {e}")
        return []

def download_md_files(username, repo_name, meta, progress_callback, log_callback):
    headers = get_headers()
    repo_meta = meta.get("repos", {}).get(repo_name, {"files": {}})
    
    log_callback(f"Checking {repo_name}...")
    
    # 1. Get default branch
    url = f"https://api.github.com/repos/{username}/{repo_name}"
    res = requests.get(url, headers=headers)
    if res.status_code != 200:
        handle_error(res, f"fetching {repo_name} info", log_callback)
        return 0
    
    branch = res.json().get('default_branch', 'main')
    
    # 2. Get recursive tree
    tree_url = f"https://api.github.com/repos/{username}/{repo_name}/git/trees/{branch}?recursive=1"
    res = requests.get(tree_url, headers=headers)
    if res.status_code != 200:
        handle_error(res, f"fetching tree for {repo_name}", log_callback)
        return 0
    
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
            
        # Download
        encoded_path = urllib.parse.quote(path)
        raw_url = f"https://raw.githubusercontent.com/{username}/{repo_name}/{branch}/{encoded_path}"
        res = requests.get(raw_url, headers=headers)
        
        if res.status_code == 200:
            local_path = os.path.join(repo_name, path)
            os.makedirs(os.path.dirname(local_path), exist_ok=True)
            with open(local_path, "w", encoding="utf-8") as f:
                f.write(res.text)
            
            # Update meta
            if "repos" not in meta: meta["repos"] = {}
            if repo_name not in meta["repos"]: meta["repos"][repo_name] = {"files": {}}
            meta["repos"][repo_name]["files"][path] = remote_sha
            
            count += 1
            log_callback(f"  Updated: {path}")
        else:
            log_callback(f"  Failed: {path} ({res.status_code})")
        
        progress_callback()
        
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
        self.all_repos = sorted([r['name'] for r in self.repos_data])
        self.vars = {}
        self.checkbuttons = []
        
        self.setup_ui()
        self.load_preferences()

    def setup_ui(self):
        self.root.title("GitHub Portfolio Sync Engine")
        self.root.geometry("600x750")
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

        # Search and Bulk Action
        search_frame = ttk.Frame(self.root, padding=(20, 0))
        search_frame.pack(fill="x")
        
        ttk.Label(search_frame, text="Search:").pack(side="left", padx=(0, 5))
        self.search_var = tk.StringVar()
        self.search_var.trace_add("write", self.filter_repos)
        self.search_entry = ttk.Entry(search_frame, textvariable=self.search_var)
        self.search_entry.pack(side="left", fill="x", expand=True)
        
        ttk.Button(search_frame, text="Select All", command=self.select_all).pack(side="left", padx=5)
        ttk.Button(search_frame, text="Clear", command=self.clear_all).pack(side="left")

        # Repo List with Scrollbar
        list_container = ttk.Frame(self.root, padding=20)
        list_container.pack(fill="both", expand=True)
        
        self.canvas = tk.Canvas(list_container, bg="white", highlightthickness=0)
        self.scrollbar = ttk.Scrollbar(list_container, orient="vertical", command=self.canvas.yview)
        self.scrollable_frame = tk.Frame(self.canvas, bg="white")

        self.scrollable_frame.bind(
            "<Configure>",
            lambda e: self.canvas.configure(scrollregion=self.canvas.bbox("all"))
        )

        self.canvas_window = self.canvas.create_window((0, 0), window=self.scrollable_frame, anchor="nw")
        self.canvas.configure(yscrollcommand=self.scrollbar.set)
        
        # Mouse wheel support
        self.canvas.bind_all("<MouseWheel>", lambda e: self.canvas.yview_scroll(int(-1*(e.delta/120)), "units"))

        self.canvas.pack(side="left", fill="both", expand=True)
        self.scrollbar.pack(side="right", fill="y")
        
        self.root.bind("<Configure>", self.on_resize)

        # Populate Repos
        self.render_repo_list()

        # Log Area
        log_frame = ttk.Frame(self.root, padding=(20, 10))
        log_frame.pack(fill="both", expand=False, height=150)
        
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
        self.canvas.itemconfig(self.canvas_window, width=event.width - 60)

    def render_repo_list(self, filter_text=""):
        for cb in self.checkbuttons:
            cb.destroy()
        self.checkbuttons = []

        for repo in self.all_repos:
            if filter_text.lower() in repo.lower():
                if repo not in self.vars:
                    self.vars[repo] = tk.BooleanVar()
                
                cb = tk.Checkbutton(self.scrollable_frame, text=repo, variable=self.vars[repo], 
                                   bg="white", font=("Segoe UI", 10), anchor="w", 
                                   activebackground=BG_COLOR)
                cb.pack(fill="x", padx=10, pady=2)
                self.checkbuttons.append(cb)

    def filter_repos(self, *args):
        self.render_repo_list(self.search_var.get())

    def select_all(self):
        for repo in self.all_repos:
            if self.search_var.get().lower() in repo.lower():
                self.vars[repo].set(True)

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
        selected = [repo for repo, var in self.vars.items() if var.get()]
        if not selected:
            messagebox.showwarning("No Selection", "Select at least one repository.")
            return
        
        self.save_preferences()
        self.sync_btn.config(state="disabled", text="SYNCING...")
        self.progress_var.set(0)
        
        thread = threading.Thread(target=self.run_sync, args=(selected,))
        thread.daemon = True
        thread.start()

    def run_sync(self, selected):
        total_repos = len(selected)
        success_count = 0
        total_files = 0
        
        self.log(f"--- Starting Sync for {total_repos} repositories ---")
        
        for i, repo in enumerate(selected):
            self.log(f"[{i+1}/{total_repos}] Processing {repo}...")
            
            def update_progress():
                pass # Individual file progress could be added here
                
            files_updated = download_md_files(self.username, repo, self.meta, update_progress, self.log)
            total_files += files_updated
            
            # Update overall progress
            self.progress_var.set(((i + 1) / total_repos) * 100)
            
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