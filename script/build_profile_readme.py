#!/usr/bin/env python3
"""Generate the GitHub profile README (github.com/thippeswammy/thippeswammy) from data/portfolio.json.

The website (index.html + assets/portfolio.js) and the profile README read the same data file,
so a change in data/portfolio.json updates both.

The README is deliberately short (who I am, what I'm looking for, 5 featured projects, stack, links):
a profile is skimmed in seconds, so the full detail lives on the website and every title links there.

Usage:
    python3 script/build_profile_readme.py                 # print to stdout
    python3 script/build_profile_readme.py -o README.md    # write to a file
"""
import argparse
import html
import json
import re
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "portfolio.json"


def md(text, site):
    """Convert the small HTML subset used in portfolio.json to Markdown."""
    def link(m):
        url, label = m.group(1), m.group(2)
        if url.startswith("#"):
            url = site.rstrip("/") + "/" + url
        return f"[{label}]({url})"
    text = re.sub(r'<a href="([^"]+)"[^>]*>(.*?)</a>', link, text)
    text = re.sub(r"</?(b|strong)>", "**", text)
    text = re.sub(r"<[^>]+>", "", text)
    return html.unescape(text)


def anchor(site, id_):
    return f"{site.rstrip('/')}/#{id_}"


def badge(label, message, color, logo="", href=""):
    q = lambda s: quote(s.replace("-", "--").replace("_", "__"), safe="")
    url = f"https://img.shields.io/badge/{q(label)}-{q(message)}-{color}?style=flat-square"
    if logo:
        url += f"&logo={logo}&logoColor=white"
    img = f'<img src="{url}" alt="{html.escape(label)}">'
    return f'<a href="{href}">{img}</a>' if href else img


def stack_badge(s):
    url = f"https://img.shields.io/badge/{quote(s['name'].replace('-', '--'), safe='')}-{s['color']}?style=flat-square"
    if s.get("logo"):
        url += f"&logo={s['logo']}&logoColor=white"
    return f'<img src="{url}" alt="{html.escape(s["name"])}">'


def code_link(p):
    """Best link to the code for a featured project: its GitHub repo, or a lock if private."""
    for l in p.get("links", []):
        if "github.com" in l["url"]:
            return f"[code]({l['url']})"
    return "🔒 private" if p.get("status", {}).get("kind") == "private" else ""


def build(d):
    site, P = d["site"], d["profile"]
    facts = {f["title"]: f["text"] for f in d["facts"]}
    job = d["experience"][0]
    edu = d["education"][0]
    o = []

    # header
    o.append(f'<h1 align="center">Hi, I\'m {P["name"]} 👋</h1>')
    o.append(f'<p align="center"><b>{P["role"]}</b> · {P["eyebrow"]}</p>')
    o.append('<p align="center">\n  ' + "\n  ".join([
        badge("Portfolio", site.replace("https://", "").rstrip("/"), "6366f1", href=site),
        badge("LinkedIn", "Thippeswamy K.S.", "0a66c2", "linkedin", P["linkedin"]),
        badge("Email", P["email"], "06b6d4", "gmail", "mailto:" + P["email"]),
        badge("Resume", "PDF", "a855f7", href=site.rstrip("/") + "/" + P["resume"]),
    ]) + "\n</p>\n")
    o.append(f'<p align="center"><i>{P["headline"]}</i></p>\n')

    # about: five lines, the things a recruiter checks first
    pub = d["publication"]
    o.append("### About me\n")
    o.append(f"- 🔭 **Now:** {job['role']} at {job['org']} ({job['when']})")
    o.append("- 🧠 **Focus:** detection, segmentation, tracking, monocular depth, visual odometry & SLAM on real camera / LiDAR / IMU / GPS data")
    o.append(f"- 🚀 **Ship:** from labeling and training to real-time deployment with PyTorch, TensorRT, C++ and ROS 2")
    o.append(f"- 📄 **Research:** [{pub['title']}]({anchor(site, 'publication')}) · *{pub['venue']}*")
    o.append(f"- 🎓 **Education:** {edu['title']}, {edu['place']}")
    o.append(f"- 🎯 **Looking for:** {P['looking_for']}\n")

    # featured: one table, best work first
    o.append("### ⭐ Featured work\n")
    o.append("| Project | What it does | |")
    o.append("|---|---|---|")
    for part in d["parts"]:
        for p in part["featured"]:
            name = p["title"].split(":")[0]
            o.append(f"| **[{name}]({anchor(site, p['id'])})** | {md(p.get('short') or p['tagline'], site)} | {code_link(p)} |")
    o.append("")

    media = [p for part in d["parts"] for p in part["featured"] if p.get("media")]
    if media:
        o.append('<p align="center">')
        for p in media[:2]:
            m = p["media"]
            o.append(f'  <a href="{anchor(site, p["id"])}"><img src="{m["src"]}" alt="{html.escape(m["alt"])}" width="49%"></a>')
        o.append("</p>\n")

    # stack
    o.append("### 🛠️ Tech stack\n")
    o.append('<p>\n  ' + "\n  ".join(stack_badge(s) for s in d.get("stack", [])) + "\n</p>\n")

    # explore
    links = [f"[{p['nav']} projects]({anchor(site, p['id'])})" for p in d["parts"]]
    links += [f"[More work]({anchor(site, 'more-work')})", f"[Every repository]({site.rstrip('/')}/explorer.html)"]
    o.append("### 🗂️ Explore\n")
    o.append(" · ".join(links) + "\n")

    o.append("<sub>🔒 = private repository, code available on request. "
             f"Generated from the same data as [{site.replace('https://', '').rstrip('/')}]({site}).</sub>\n")
    return "\n".join(o)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("-o", "--output", help="write README here instead of stdout")
    ap.add_argument("--data", default=str(DATA), help="path to portfolio.json")
    a = ap.parse_args()
    text = build(json.loads(Path(a.data).read_text(encoding="utf-8")))
    if a.output:
        Path(a.output).write_text(text, encoding="utf-8")
        print(f"wrote {a.output} ({len(text)} chars)")
    else:
        print(text)


if __name__ == "__main__":
    main()
