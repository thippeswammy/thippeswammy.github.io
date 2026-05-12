import os
import requests

token = os.environ.get("GITHUB_TOKEN")
headers = {"User-Agent": "GitHubRepoSync-Script"}
if token:
    headers["Authorization"] = f"token {token}"
    print("Using GITHUB_TOKEN for authentication.")
else:
    print("No GITHUB_TOKEN found. Using unauthenticated requests.")

response = requests.get("https://api.github.com/rate_limit", headers=headers)
if response.status_code == 200:
    data = response.json()
    core = data['resources']['core']
    print(f"Rate Limit: {core['limit']}")
    print(f"Remaining: {core['remaining']}")
    print(f"Reset time: {core['reset']}")
else:
    print(f"Error fetching rate limit: {response.status_code}")
    print(response.text)
