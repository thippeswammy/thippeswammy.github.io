import os
import json
import urllib.parse
import requests
import tkinter as tk
from tkinter import messagebox, ttk
import threading
from datetime import datetime
import re

# --- Configuration & Constants ---
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN")
META_FILE = ".sync_meta.json"
JS_DATA_FILE = "../web/projects_data.js"
USER_AGENT = "GitHubRepoSync-Engine-v7"

# Color Palette
COLOR_BG = "#FFFFFF"
COLOR_SIDEBAR = "#F8F9FA"
COLOR_TEXT = "#212529"
COLOR_ACCENT = "#0D6EFD"
COLOR_SUCCESS = "#198754"
COLOR_WARNING = "#FFC107"
COLOR_FORK = "#6C757D"
COLOR_PRIVATE = "#6610F2"

# Cluster Mapping
CLUSTER_MAP = {
    'robotics': 'robotics', 'ros2': 'robotics', 'ros': 'robotics', 'slam': 'robotics', 'navigation': 'robotics',
    'computer-vision': 'vision', 'opencv': 'vision', 'image-processing': 'vision',
    'web-development': 'web', 'react': 'web', 'gui': 'web',
    'deep-learning': 'ai', 'machine-learning': 'ai', 'ai': 'ai'
}

# --- Helper Functions ---

def get_headers(etag=None):
    headers = {"User-Agent": USER_AGENT, "Accept": "application/vnd.github.v3+json"}
    if GITHUB_TOKEN: headers["Authorization"] = f"token {GITHUB_TOKEN}"
    if etag: headers["If-None-Match"] = etag
    return headers

def load_meta():
    if os.path.exists(META_FILE):
        try:
            with open(META_FILE, "r") as f: return json.load(f)
        except: return {}
    return {"repos": {}, "selected_repos": [], "last_sync": None}

def save_meta(meta):
    with open(META_FILE, "w") as f: json.dump(meta, f, indent=4)

def handle_error(response, context, log_func=print):
    try: error_msg = response.json().get('message', 'No detail available')
    except: error_msg = response.text[:100]
    log_func(f"ERROR [{context}]: {response.status_code} - {error_msg}")

# --- API & Logic ---

def fetch_repos(username):
    url = "https://api.github.com/user/repos?per_page=100&type=all&sort=pushed" if GITHUB_TOKEN else f"https://api.github.com/users/{username}/repos?per_page=100"
    try:
        response = requests.get(url, headers=get_headers())
        if response.status_code == 200:
            repos = response.json()
            if GITHUB_TOKEN: repos = [r for r in repos if r.get('owner', {}).get('login', '').lower() == username.lower()]
            return repos
        else:
            handle_error(response, "Fetch")
            return []
    except Exception as e:
        print(f"Connection error: {e}")
        return []

def extract_highlights(repo_name):
    readme_paths = [os.path.join(repo_name, f) for f in ['README.md', 'readme.md', 'index.md']]
    highlights = []
    for path in readme_paths:
        if os.path.exists(path):
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    matches = re.findall(r'(?m)^[*-]\s+(.+)', content)
                    if matches:
                        highlights = [m.strip() for m in matches[:4]]
                        break
            except: pass
    return highlights

def generate_portfolio_js(meta_repos, log_callback):
    log_callback("Building portfolio data...")
    projects = []
    for name, data in meta_repos.items():
        info = data.get("info", {})
        if not info: continue
        topics = info.get("topics", [])
        cluster = 'others'
        for t in topics:
            if t in CLUSTER_MAP: cluster = CLUSTER_MAP[t]; break
        highlights = extract_highlights(name)
        if not highlights: highlights = [f"Language: {info.get('language', 'N/A')}", "Synced from GitHub"]
        projects.append({
            "id": name.lower().replace(" ", "-"),
            "cluster": cluster,
            "name": name,
            "lang": info.get("language", "Mixed"),
            "tagline": (info.get("description", "")[:60] + "...") if info.get("description") else f"Project {name}",
            "summary": info.get("description", "No description available."),
            "highlights": highlights,
            "tech": topics[:5] if topics else [info.get("language")] if info.get("language") else ["Code"],
            "github": info.get("html_url", f"https://github.com/thippeswammy/{name}"),
            "isPrivate": info.get("private", False)
        })
    js_content = "export const projectsData = " + json.dumps(projects, indent=2) + ";"
    try:
        os.makedirs(os.path.dirname(JS_DATA_FILE), exist_ok=True)
        with open(JS_DATA_FILE, "w", encoding="utf-8") as f: f.write(js_content)
        log_callback(f"SUCCESS: {len(projects)} projects exported.")
        return True
    except Exception as e:
        log_callback(f"FAILED JS: {e}"); return False

def download_md_files(username, repo_obj, meta, log_callback):
    repo_name = repo_obj['name']
    pushed_at = repo_obj['pushed_at']
    repo_meta = meta.get("repos", {}).get(repo_name, {"files": {}, "etag": None, "last_pushed": None})
    if repo_meta.get("last_pushed") == pushed_at and os.path.exists(repo_name):
        return 0
    log_callback(f"SYNC FILES: {repo_name}...")
    headers = get_headers(repo_meta.get("etag"))
    branch = repo_obj.get('default_branch', 'main')
    owner = repo_obj['owner']['login']
    tree_url = f"https://api.github.com/repos/{owner}/{repo_name}/git/trees/{branch}?recursive=1"
    res = requests.get(tree_url, headers=headers)
    if res.status_code == 304 and os.path.exists(repo_name): return 0
    if res.status_code != 200: handle_error(res, f"Tree {repo_name}", log_callback); return 0
    new_etag = res.headers.get("ETag")
    tree = res.json().get('tree', [])
    md_files = [i for i in tree if i['type'] == 'blob' and i['path'].endswith('.md') and i['path'].split('/')[-1].lower() not in {'setup.md', 'contribution.md', 'contributing.md'}]
    count = 0
    for i in md_files:
        path, remote_sha = i['path'], i['sha']
        if repo_meta.get("files", {}).get(path) == remote_sha: continue
        res = requests.get(f"https://raw.githubusercontent.com/{owner}/{repo_name}/{branch}/{urllib.parse.quote(path)}", headers=get_headers())
        if res.status_code == 200:
            lp = os.path.join(repo_name, path); os.makedirs(os.path.dirname(lp), exist_ok=True)
            with open(lp, "w", encoding="utf-8") as f: f.write(res.text)
            if "repos" not in meta: meta["repos"] = {}
            if repo_name not in meta["repos"]: meta["repos"][repo_name] = {"files": {}}
            meta["repos"][repo_name]["files"][path] = remote_sha
            count += 1
    if repo_name not in meta["repos"]: meta["repos"][repo_name] = {"files": {}}
    meta["repos"][repo_name].update({"etag": new_etag, "last_pushed": pushed_at, "last_sync": datetime.now().strftime("%Y-%m-%d %H:%M")})
    return count

# --- GUI ---

class RepoSyncGUI:
    def __init__(self, root, username):
        self.root = root
        self.username = username
        self.meta = load_meta()
        self.repos_data = []
        self.vars = {}
        self.repo_frames = []
        self.setup_ui()
        threading.Thread(target=self.initial_load, daemon=True).start()

    def setup_ui(self):
        self.root.title("GitHub Sync & Portfolio Engine")
        self.root.geometry("850x920")
        self.root.configure(bg=COLOR_BG)
        main = ttk.Frame(self.root); main.pack(fill="both", expand=True)
        self.sidebar = ttk.Frame(main, padding=20); self.sidebar.pack(side="left", fill="both", expand=False); self.sidebar.configure(width=280); self.sidebar.pack_propagate(False)
        self.content = ttk.Frame(main, padding=10); self.content.pack(side="right", fill="both", expand=True)

        # Sidebar
        ttk.Label(self.sidebar, text="SYNC ENGINE", font=("Segoe UI", 12, "bold")).pack(anchor="w", pady=(0, 10))
        self.auth_label = ttk.Label(self.sidebar, text="Checking Status...")
        self.auth_label.pack(anchor="w", pady=(0, 20))

        ttk.Label(self.sidebar, text="SEARCH", font=("Segoe UI", 8, "bold"), foreground=COLOR_FORK).pack(anchor="w")
        self.search_var = tk.StringVar(); self.search_var.trace_add("write", lambda *a: self.refresh_list())
        ttk.Entry(self.sidebar, textvariable=self.search_var).pack(fill="x", pady=(0, 20))

        ttk.Label(self.sidebar, text="FILTERS", font=("Segoe UI", 8, "bold"), foreground=COLOR_FORK).pack(anchor="w")
        self.type_filter = tk.StringVar(value="all")
        for t, v in [("All Repos", "all"), ("Sources Only", "source"), ("Forks Only", "fork")]:
            ttk.Radiobutton(self.sidebar, text=t, value=v, variable=self.type_filter, command=self.refresh_list).pack(anchor="w", pady=2)

        ttk.Separator(self.sidebar, orient="horizontal").pack(fill="x", pady=20)
        
        # Metadata Only Option
        ttk.Label(self.sidebar, text="OPTIONS", font=("Segoe UI", 8, "bold"), foreground=COLOR_FORK).pack(anchor="w")
        self.meta_only_var = tk.BooleanVar(value=False)
        tk.Checkbutton(self.sidebar, text="Metadata Only (Fast)", variable=self.meta_only_var, bg=COLOR_SIDEBAR, font=("Segoe UI", 9)).pack(anchor="w", pady=5)
        
        ttk.Button(self.sidebar, text="Select All Visible", command=self.select_all).pack(fill="x", pady=2)
        ttk.Button(self.sidebar, text="Clear Selections", command=self.clear_all).pack(fill="x", pady=2)

        ttk.Separator(self.sidebar, orient="horizontal").pack(fill="x", pady=20)
        
        # Portfolio Action
        ttk.Label(self.sidebar, text="AUTOMATION", font=("Segoe UI", 8, "bold"), foreground=COLOR_FORK).pack(anchor="w")
        self.build_btn = tk.Button(self.sidebar, text="BUILD PORTFOLIO DATA", command=self.build_portfolio, bg=COLOR_PRIVATE, fg="white", font=("Segoe UI", 9, "bold"), relief="flat", pady=8)
        self.build_btn.pack(fill="x", pady=10)

        # Content
        ttk.Label(self.content, text="REPOSITORIES", font=("Segoe UI", 12, "bold")).pack(anchor="w", pady=(0, 10))
        list_f = ttk.Frame(self.content); list_f.pack(fill="both", expand=True)
        self.canvas = tk.Canvas(list_f, bg="white", highlightthickness=0); self.scrollbar = ttk.Scrollbar(list_f, orient="vertical", command=self.canvas.yview); self.scroll_f = tk.Frame(self.canvas, bg="white")
        self.scroll_f.bind("<Configure>", lambda e: self.canvas.configure(scrollregion=self.canvas.bbox("all")))
        self.canvas_win = self.canvas.create_window((0, 0), window=self.scroll_f, anchor="nw"); self.canvas.configure(yscrollcommand=self.scrollbar.set); self.canvas.pack(side="left", fill="both", expand=True); self.scrollbar.pack(side="right", fill="y")
        self.canvas.bind_all("<MouseWheel>", lambda e: self.canvas.yview_scroll(int(-1*(e.delta/120)), "units"))
        self.root.bind("<Configure>", lambda e: self.canvas.itemconfig(self.canvas_win, width=self.canvas.winfo_width()))

        # Footer
        footer = ttk.Frame(self.root, padding=10); footer.pack(side="bottom", fill="x")
        self.prog_var = tk.DoubleVar()
        ttk.Progressbar(footer, variable=self.prog_var, maximum=100).pack(fill="x", pady=(0, 5))
        self.log_box = tk.Text(footer, height=6, font=("Consolas", 9), bg="#1E1E1E", fg="#D4D4D4", borderwidth=0, padx=10, pady=10)
        self.log_box.pack(fill="x", expand=True)
        self.sync_btn = tk.Button(footer, text="START SYNC ENGINE", command=self.start_sync, bg=COLOR_ACCENT, fg="white", font=("Segoe UI", 11, "bold"), relief="flat", pady=12)
        self.sync_btn.pack(fill="x", pady=(10, 0))

    def initial_load(self): self.repos_data = fetch_repos(self.username); self.root.after(0, self.on_loaded)
    def on_loaded(self):
        self.auth_label.config(text="Status: Authenticated" if GITHUB_TOKEN else "Status: Public Only", foreground=COLOR_SUCCESS if GITHUB_TOKEN else COLOR_FORK)
        for r in self.repos_data: self.vars[r['name']] = tk.BooleanVar(value=r['name'] in self.meta.get("selected_repos", []))
        self.refresh_list()

    def refresh_list(self):
        for f in self.repo_frames: f.destroy()
        self.repo_frames = []
        q, ft = self.search_var.get().lower(), self.type_filter.get()
        for r in sorted(self.repos_data, key=lambda x: x['name'].lower()):
            name = r['name']
            if (q and q not in name.lower()) or (ft == "source" and r['fork']) or (ft == "fork" and not r['fork']): continue
            f = tk.Frame(self.scroll_f, bg="white", padx=10, pady=5); f.pack(fill="x")
            self.repo_frames.append(f)
            repo_meta = self.meta.get("repos", {}).get(name, {})
            folder_exists = os.path.exists(name)
            st_text, st_col = ("[Synced]", COLOR_SUCCESS) if (folder_exists and repo_meta.get("last_pushed") == r['pushed_at']) else ("[Update]", COLOR_WARNING) if folder_exists else ("[New]", COLOR_ACCENT)
            tag = f"{' (Fork)' if r['fork'] else ''}{' [Private]' if r['private'] else ''}"
            cb = tk.Checkbutton(f, text=f"{name}{tag}", variable=self.vars[name], bg="white", font=("Segoe UI", 9, "bold"), fg=COLOR_PRIVATE if r['private'] else COLOR_TEXT, anchor="w")
            cb.pack(side="left")
            tk.Label(f, text=f"{st_text} | {repo_meta.get('last_sync', 'Never')}", bg="white", font=("Segoe UI", 7), fg=st_col).pack(side="right")

    def log(self, m): self.log_box.insert("end", f"> {m}\n"); self.log_box.see("end"); self.root.update_idletasks()
    def select_all(self):
        q, ft = self.search_var.get().lower(), self.type_filter.get()
        for r in self.repos_data:
            n = r['name']
            if (not q or q in n.lower()) and (ft == "all" or (ft == "source" and not r['fork']) or (ft == "fork" and r['fork'])): self.vars[n].set(True)

    def clear_all(self):
        for v in self.vars.values(): v.set(False)

    def build_portfolio(self):
        if not self.meta.get("repos"): return messagebox.showwarning("No Data", "Sync at least one repository first.")
        threading.Thread(target=lambda: generate_portfolio_js(self.meta["repos"], self.log), daemon=True).start()

    def start_sync(self):
        sel_names = [n for n, v in self.vars.items() if v.get()]
        if not sel_names: return messagebox.showwarning("No Selection", "Select repositories.")
        self.meta["selected_repos"] = sel_names; save_meta(self.meta)
        self.sync_btn.config(state="disabled", text="SYNCING...")
        sel_repos = [r for r in self.repos_data if r['name'] in sel_names]
        threading.Thread(target=self.run_engine, args=(sel_repos,), daemon=True).start()

    def run_engine(self, repos):
        total, updated, meta_only = len(repos), 0, self.meta_only_var.get()
        for i, r in enumerate(repos):
            name = r['name']
            if name not in self.meta["repos"]: self.meta["repos"][name] = {"files": {}}
            self.meta["repos"][name]["info"] = {"description": r.get("description"), "language": r.get("language"), "topics": r.get("topics", []), "html_url": r.get("html_url"), "private": r.get("private", False)}
            if not meta_only:
                try: updated += download_md_files(self.username, r, self.meta, self.log)
                except Exception as e: self.log(f"FAILED {name}: {e}")
            else: self.log(f"META SYNC: {name}")
            self.prog_var.set(((i + 1) / total) * 100)
        self.meta["last_sync"] = datetime.now().strftime("%Y-%m-%d %H:%M"); save_meta(self.meta)
        self.root.after(0, self.on_sync_done, updated)

    def on_sync_done(self, count):
        self.sync_btn.config(state="normal", text="START SYNC ENGINE"); self.refresh_list()
        messagebox.showinfo("Done", f"Updated {count} files (Metadata refreshed).")

if __name__ == "__main__":
    GITHUB_USER = "thippeswammy"
    root = tk.Tk()
    try: root.tk.call('tk', 'scaling', 1.5)
    except: pass
    app = RepoSyncGUI(root, GITHUB_USER)
    root.mainloop()