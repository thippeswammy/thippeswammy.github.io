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
USER_AGENT = "GitHubRepoSync-Engine-v6"

# Premium Color Palette
COLOR_BG = "#FFFFFF"
COLOR_SIDEBAR = "#F8F9FA"
COLOR_TEXT = "#212529"
COLOR_ACCENT = "#0D6EFD"
COLOR_SUCCESS = "#198754"
COLOR_WARNING = "#FFC107"
COLOR_FORK = "#6C757D"
COLOR_PRIVATE = "#6610F2"
COLOR_BORDER = "#DEE2E6"

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
    log_func(f"ERROR [{context}]: {response.status_code} - {error_msg}")

# --- API Interaction ---

def fetch_repos(username):
    if GITHUB_TOKEN:
        url = "https://api.github.com/user/repos?per_page=100&type=all&sort=pushed"
    else:
        url = f"https://api.github.com/users/{username}/repos?per_page=100"
        
    try:
        response = requests.get(url, headers=get_headers())
        if response.status_code == 200:
            repos = response.json()
            if GITHUB_TOKEN:
                repos = [r for r in repos if r.get('owner', {}).get('login', '').lower() == username.lower()]
            return repos
        else:
            handle_error(response, f"Fetch Repos")
            return []
    except Exception as e:
        print(f"Connection error: {e}")
        return []

def download_md_files(username, repo_obj, meta, log_callback):
    repo_name = repo_obj['name']
    pushed_at = repo_obj['pushed_at']
    repo_meta = meta.get("repos", {}).get(repo_name, {"files": {}, "etag": None, "last_pushed": None})
    
    # Check if folder exists
    folder_exists = os.path.exists(repo_name)
    
    # Logic: Skip if metadata matches AND folder exists
    if repo_meta.get("last_pushed") == pushed_at and folder_exists:
        log_callback(f"SKIP: {repo_name} (Up to date & Folder present)")
        return 0
    
    log_callback(f"SYNC: {repo_name}...")
    headers = get_headers(repo_meta.get("etag"))
    branch = repo_obj.get('default_branch', 'main')
    owner = repo_obj['owner']['login']
    
    tree_url = f"https://api.github.com/repos/{owner}/{repo_name}/git/trees/{branch}?recursive=1"
    res = requests.get(tree_url, headers=headers)
    
    if res.status_code == 304 and folder_exists:
        log_callback(f"  NO CHANGE: {repo_name}")
        if repo_name not in meta["repos"]: meta["repos"][repo_name] = repo_meta
        meta["repos"][repo_name]["last_pushed"] = pushed_at
        return 0
        
    if res.status_code != 200:
        handle_error(res, f"Tree {repo_name}", log_callback)
        return 0
    
    new_etag = res.headers.get("ETag")
    tree = res.json().get('tree', [])
    ignored_files = {'setup.md', 'contribution.md', 'contributing.md'}
    md_files = [item for item in tree if item['type'] == 'blob' and item['path'].endswith('.md') and item['path'].split('/')[-1].lower() not in ignored_files]
    
    count = 0
    for item in md_files:
        path = item['path']
        remote_sha = item['sha']
        local_sha = repo_meta.get("files", {}).get(path)
        
        if local_sha == remote_sha: continue
            
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
            log_callback(f"  PULL: {path}")
            
    if repo_name not in meta["repos"]: meta["repos"][repo_name] = {"files": {}}
    meta["repos"][repo_name]["etag"] = new_etag
    meta["repos"][repo_name]["last_pushed"] = pushed_at
    meta["repos"][repo_name]["last_sync"] = datetime.now().strftime("%Y-%m-%d %H:%M")
    return count

# --- GUI Application ---

class RepoSyncGUI:
    def __init__(self, root, username):
        self.root = root
        self.username = username
        self.meta = load_meta()
        self.repos_data = []
        self.vars = {}
        self.repo_frames = []
        
        self.setup_styles()
        self.setup_ui()
        
        threading.Thread(target=self.initial_load, daemon=True).start()

    def setup_styles(self):
        self.style = ttk.Style()
        if 'clam' in self.style.theme_names(): self.style.theme_use('clam')
        self.style.configure("TFrame", background=COLOR_BG)
        self.style.configure("Sidebar.TFrame", background=COLOR_SIDEBAR)
        self.style.configure("TLabel", background=COLOR_BG, font=("Segoe UI", 10))
        self.style.configure("Small.TLabel", font=("Segoe UI", 9))
        self.style.configure("Header.TLabel", font=("Segoe UI", 14, "bold"), foreground=COLOR_TEXT)

    def setup_ui(self):
        self.root.title("GitHub Sync Engine Pro")
        self.root.geometry("800x850")
        self.root.configure(bg=COLOR_BG)

        main_container = ttk.Frame(self.root)
        main_container.pack(fill="both", expand=True)

        self.sidebar = ttk.Frame(main_container, style="Sidebar.TFrame", padding=20)
        self.sidebar.pack(side="left", fill="both", expand=False)
        self.sidebar.configure(width=250)
        self.sidebar.pack_propagate(False)

        self.content = ttk.Frame(main_container, padding=10)
        self.content.pack(side="right", fill="both", expand=True)

        # Sidebar
        ttk.Label(self.sidebar, text="ENGINE STATUS", style="Header.TLabel", background=COLOR_SIDEBAR).pack(anchor="w", pady=(0, 10))
        self.auth_label = ttk.Label(self.sidebar, text="Checking...", background=COLOR_SIDEBAR)
        self.auth_label.pack(anchor="w", pady=(0, 20))

        ttk.Label(self.sidebar, text="SEARCH", style="Small.TLabel", foreground=COLOR_FORK, background=COLOR_SIDEBAR).pack(anchor="w")
        self.search_var = tk.StringVar()
        self.search_var.trace_add("write", lambda *a: self.refresh_list())
        ttk.Entry(self.sidebar, textvariable=self.search_var).pack(fill="x", pady=(0, 20))

        ttk.Label(self.sidebar, text="TYPE FILTER", style="Small.TLabel", foreground=COLOR_FORK, background=COLOR_SIDEBAR).pack(anchor="w")
        self.type_filter = tk.StringVar(value="all")
        for text, val in [("All Repos", "all"), ("Sources Only", "source"), ("Forks Only", "fork")]:
            ttk.Radiobutton(self.sidebar, text=text, value=val, variable=self.type_filter, command=self.refresh_list).pack(anchor="w", pady=2)

        ttk.Separator(self.sidebar, orient="horizontal").pack(fill="x", pady=20)
        ttk.Button(self.sidebar, text="Select All Visible", command=self.select_all).pack(fill="x", pady=2)
        ttk.Button(self.sidebar, text="Clear All", command=self.clear_all).pack(fill="x", pady=2)

        # Content
        ttk.Label(self.content, text="REPOSITORIES", style="Header.TLabel").pack(anchor="w", pady=(0, 10))
        list_frame = ttk.Frame(self.content)
        list_frame.pack(fill="both", expand=True)
        self.canvas = tk.Canvas(list_frame, bg="white", highlightthickness=0)
        self.scrollbar = ttk.Scrollbar(list_frame, orient="vertical", command=self.canvas.yview)
        self.scrollable_frame = tk.Frame(self.canvas, bg="white")
        self.scrollable_frame.bind("<Configure>", lambda e: self.canvas.configure(scrollregion=self.canvas.bbox("all")))
        self.canvas_window = self.canvas.create_window((0, 0), window=self.scrollable_frame, anchor="nw")
        self.canvas.configure(yscrollcommand=self.scrollbar.set)
        self.canvas.pack(side="left", fill="both", expand=True)
        self.scrollbar.pack(side="right", fill="y")
        self.canvas.bind_all("<MouseWheel>", self.on_mousewheel)
        self.root.bind("<Configure>", self.on_resize)

        # Footer
        footer = ttk.Frame(self.root, padding=10, style="Sidebar.TFrame")
        footer.pack(side="bottom", fill="x")
        self.progress_var = tk.DoubleVar()
        ttk.Progressbar(footer, variable=self.progress_var, maximum=100).pack(fill="x", pady=(0, 10))
        self.log_text = tk.Text(footer, height=6, font=("Consolas", 9), bg="#1E1E1E", fg="#D4D4D4", borderwidth=0, padx=10, pady=10)
        self.log_text.pack(fill="x", expand=True)
        self.sync_btn = tk.Button(footer, text="START SYNC ENGINE", command=self.start_sync, bg=COLOR_ACCENT, fg="white", font=("Segoe UI", 11, "bold"), relief="flat", pady=10)
        self.sync_btn.pack(fill="x", pady=(10, 0))

    def on_mousewheel(self, event):
        self.canvas.yview_scroll(int(-1*(event.delta/120)), "units")

    def on_resize(self, event):
        self.canvas.itemconfig(self.canvas_window, width=self.canvas.winfo_width())

    def initial_load(self):
        self.repos_data = fetch_repos(self.username)
        self.root.after(0, self.on_data_loaded)

    def on_data_loaded(self):
        status = "Authenticated" if GITHUB_TOKEN else "Public Only"
        self.auth_label.config(text=f"STATUS: {status}", foreground=COLOR_SUCCESS if GITHUB_TOKEN else COLOR_FORK)
        for repo in self.repos_data:
            self.vars[repo['name']] = tk.BooleanVar(value=repo['name'] in self.meta.get("selected_repos", []))
        self.refresh_list()

    def refresh_list(self):
        for frame in self.repo_frames: frame.destroy()
        self.repo_frames = []
        query = self.search_var.get().lower()
        f_type = self.type_filter.get()
        sorted_repos = sorted(self.repos_data, key=lambda x: x['name'].lower())
        
        for repo in sorted_repos:
            name = repo['name']
            if (query and query not in name.lower()) or (f_type == "source" and repo['fork']) or (f_type == "fork" and not repo['fork']): continue

            frame = tk.Frame(self.scrollable_frame, bg="white", padx=10, pady=5)
            frame.pack(fill="x", expand=True)
            self.repo_frames.append(frame)

            # Metadata Display
            repo_meta = self.meta.get("repos", {}).get(name, {})
            last_sync = repo_meta.get("last_sync", "Never")
            folder_exists = os.path.exists(name)
            
            status_text = ""
            status_color = COLOR_TEXT
            if folder_exists:
                if repo_meta.get("last_pushed") == repo['pushed_at']:
                    status_text = " [Synced]"
                    status_color = COLOR_SUCCESS
                else:
                    status_text = " [Update Available]"
                    status_color = COLOR_WARNING
            else:
                status_text = " [New]"
                status_color = COLOR_ACCENT

            # Label Construction
            is_fork = repo.get('fork', False)
            is_private = repo.get('private', False)
            tag = f"{' (Fork)' if is_fork else ''}{' [Private]' if is_private else ''}"
            
            cb = tk.Checkbutton(frame, text=f"{name}{tag}", variable=self.vars[name], bg="white", font=("Segoe UI", 10, "bold"), fg=COLOR_PRIVATE if is_private else COLOR_TEXT, anchor="w")
            cb.pack(side="left")
            
            info_label = tk.Label(frame, text=f"{status_text} | Last: {last_sync}", bg="white", font=("Segoe UI", 8), fg=status_color)
            info_label.pack(side="right")

    def log(self, msg, type=None):
        self.log_text.insert("end", f"> {msg}\n", type)
        self.log_text.see("end")
        self.root.update_idletasks()

    def select_all(self):
        query = self.search_var.get().lower()
        f_type = self.type_filter.get()
        for repo in self.repos_data:
            name = repo['name']
            if (not query or query in name.lower()) and (f_type == "all" or (f_type == "source" and not repo['fork']) or (f_type == "fork" and repo['fork'])):
                self.vars[name].set(True)

    def clear_all(self):
        for v in self.vars.values(): v.set(False)

    def start_sync(self):
        selected_names = [name for name, var in self.vars.items() if var.get()]
        if not selected_names:
            messagebox.showwarning("No Selection", "Please select repositories.")
            return
        self.meta["selected_repos"] = selected_names
        save_meta(self.meta)
        self.sync_btn.config(state="disabled", text="SYNCING...")
        selected_repos = [r for r in self.repos_data if r['name'] in selected_names]
        threading.Thread(target=self.run_engine, args=(selected_repos,), daemon=True).start()

    def run_engine(self, repos):
        total = len(repos)
        updated = 0
        for i, repo in enumerate(repos):
            try:
                count = download_md_files(self.username, repo, self.meta, self.log)
                updated += count
            except Exception as e:
                self.log(f"FAILED {repo['name']}: {e}")
            self.progress_var.set(((i + 1) / total) * 100)
        save_meta(self.meta)
        self.root.after(0, self.on_sync_finished, updated)

    def on_sync_finished(self, count):
        self.sync_btn.config(state="normal", text="START SYNC ENGINE")
        self.refresh_list()
        messagebox.showinfo("Sync Done", f"Updated {count} files.")

if __name__ == "__main__":
    GITHUB_USER = "thippeswammy"
    root = tk.Tk()
    try: root.tk.call('tk', 'scaling', 1.5)
    except: pass
    app = RepoSyncGUI(root, GITHUB_USER)
    root.mainloop()