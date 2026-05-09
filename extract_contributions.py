import sys
from bs4 import BeautifulSoup

with open('github_ref.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f, 'html.parser')

# Find the main container for contributions
# On GitHub profiles, it's usually a div with class "js-yearly-contributions"
contributions = soup.find('div', class_='js-yearly-contributions')
if not contributions:
    print("Could not find js-yearly-contributions")
    sys.exit(1)

# Extract only the HTML we need (removing SVG paths and stuff if needed, but we'll just take it all)
with open('extracted_contributions.html', 'w', encoding='utf-8') as out:
    out.write(str(contributions))
print("Successfully extracted to extracted_contributions.html")
