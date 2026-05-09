import requests
import tkinter as tk
from tkinter import messagebox, ttk

def fetch_repos(username):
    """Fetches all public repositories for a given GitHub user."""
    url = f"https://api.github.com/users/{username}/repos?per_page=100"
    response = requests.get(url)
    if response.status_code == 200:
        return [repo['name'] for repo in response.json()]
    else:
        print(f"Error fetching repos: {response.status_code}")
        return []

def download_readme(username, repo_name):
    """Downloads the README.md from the main or master branch."""
    branches = ['main', 'master']
    for branch in branches:
        url = f"https://raw.githubusercontent.com/{username}/{repo_name}/{branch}/README.md"
        res = requests.get(url)
        if res.status_code == 200:
            with open(f"{repo_name}.md", "w", encoding="utf-8") as f:
                f.write(res.text)
            return True
    return False

class RepoSelectorApp:
    def __init__(self, root, username):
        self.root = root
        self.username = username
        self.root.title(f"GitHub Repo Downloader - {username}")
        self.root.geometry("400x500")

        self.repos = fetch_repos(username)
        self.vars = {}

        # UI Elements
        tk.Label(root, text=f"Select Repositories to Download:", font=("Arial", 12, "bold")).pack(pady=10)

        # Scrollable Frame
        container = ttk.Frame(root)
        container.pack(fill="both", expand=True, padx=10)
        
        canvas = tk.Canvas(container)
        scrollbar = ttk.Scrollbar(container, orient="vertical", command=canvas.yview)
        self.scrollable_frame = ttk.Frame(canvas)

        self.scrollable_frame.bind(
            "<Configure>",
            lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
        )

        canvas.create_window((0, 0), window=self.scrollable_frame, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)

        canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")

        # Create Checkbuttons
        for repo in self.repos:
            var = tk.BooleanVar()
            self.vars[repo] = var
            cb = tk.Checkbutton(self.scrollable_frame, text=repo, variable=var, font=("Arial", 10))
            cb.pack(anchor="w")

        # Download Button
        self.btn = tk.Button(root, text="Download Selected READMEs", command=self.start_download, bg="#28a745", fg="white", font=("Arial", 10, "bold"))
        self.btn.pack(pady=20)

    def start_download(self):
        selected = [repo for repo, var in self.vars.items() if var.get()]
        if not selected:
            messagebox.showwarning("No Selection", "Please select at least one repository.")
            return

        success_count = 0
        for repo in selected:
            if download_readme(self.username, repo):
                success_count += 1
        
        messagebox.showinfo("Done", f"Successfully downloaded {success_count} README(s).")

if __name__ == "__main__":
    # Update this with your GitHub username
    GITHUB_USER = "thippeswammy"
    
    root = tk.Tk()
    app = RepoSelectorApp(root, GITHUB_USER)
    root.mainloop()