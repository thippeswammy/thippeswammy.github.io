import json
import re

def parse_js_array(content, var_name):
    # This is a very rough parser for the JS structure
    pattern = rf'window\.{var_name}\s*=\s*\[(.*?)\];'
    match = re.search(pattern, content, re.DOTALL)
    if not match:
        return []
    
    # We can't use json.loads because it's JS, not JSON (single quotes, no quotes on keys, etc.)
    # I'll just extract the objects as strings for now
    items = []
    # Find all { ... } blocks
    item_pattern = r'\{.*?\}'
    items = re.findall(item_pattern, match.group(1), re.DOTALL)
    return items

def extract_field(item_str, field):
    # Extract a field like tagline: '...' or tagline: "..."
    match = re.search(rf"{field}\s*:\s*['\"](.*?)['\"]", item_str)
    if match:
        return match.group(1)
    return None

def extract_highlights(item_str):
    # Extract highlights: [...]
    match = re.search(r"highlights\s*:\s*\[(.*?)\]", item_str, re.DOTALL)
    if match:
        return match.group(1)
    return None

def get_github_url(item_str):
    return extract_field(item_str, 'github')

# Read the files
with open('/home/thippe/workspaces/NonProjects/thippeswammy.github.io/web/projects_data.js', 'r') as f:
    web_content = f.read()

# I need the "old" root content. I'll check if I can find it in the prompt's diff.
# Since I can't "read" the prompt's diff as a file, I'll have to manually reconstruct the merge based on what I saw.

# Actually, I can use the current root/projects_data.js (which I just wrote) and "undo" the deletion of projects.
# But wait, I have the user's manual edit diff for the root file in the prompt.
# I'll use that to get the list of "lost" projects.

print("Merging projects...")
# I'll do this manually in the next step to be sure.
