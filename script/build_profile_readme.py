#!/usr/bin/env python3
"""Generate the GitHub profile README (github.com/thippeswammy/thippeswammy) from data/portfolio.json.

The website (index.html + assets/portfolio.js) and the profile README read the same data file,
so a change in data/portfolio.json updates both.

Usage:
    python3 script/build_profile_readme.py                 # print to stdout
    python3 script/build_profile_readme.py -o README.md    # write to a file
"""
import argparse
import html
import json
import re
from pathlib import Path

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


def repo(it):
    lock = " 🔒" if it.get("private") else ""
    return f"[{it['name']}]({it['url']}){lock}" if it.get("url") else f"{it['name']}{lock}"


def feature(p, site):
    out = [f"### [{p['title']}]({anchor(site, p['id'])})"]
    status = p.get("status")
    if status:
        icon = {"private": "🔒", "public": "🌐", "paper": "📄"}.get(status["kind"], "")
        out.append(f"{icon} *{status['label']}*  ")
    out.append(md(p["tagline"], site) + "\n")
    out += [f"- {md(b, site)}" for b in p["bullets"]]
    if p.get("metrics"):
        out.append("\n" + " · ".join(f"**{m['value']}** {m['label']}" for m in p["metrics"]))
    out.append("\n" + " ".join(f"`{t}`" for t in p["tags"]))
    links = [l for l in p.get("links", [])]
    if links:
        out.append("\n" + " · ".join(
            f"[{l['label']}]({anchor(site, l['url'][1:]) if l['url'].startswith('#') else l['url']})" for l in links))
    return "\n".join(out) + "\n"


def group(g, site):
    rows = ["| Repository | What it is |", "|---|---|"]
    for it in g["items"]:
        names = " · ".join([repo(it)] + [repo(a) for a in it.get("also", [])])
        tech = f" <sub>`{it['tech']}`</sub>" if it.get("tech") else ""
        rows.append(f"| {names} | {md(it['desc'], site)}{tech} |")
    return f"<details>\n<summary><b>{g['title']}</b> — {g['desc']}</summary>\n\n" + "\n".join(rows) + "\n\n</details>\n"


def build(d):
    site, P = d["site"], d["profile"]
    o = []
    o.append(f"<h1 align=\"center\">{P['name']}</h1>")
    o.append(f"<p align=\"center\"><b>{P['role']}</b> · {P['eyebrow']}</p>")
    o.append(
        "<p align=\"center\">\n"
        f"  <a href=\"{site}\"><img src=\"https://img.shields.io/badge/Portfolio-thippeswammy.github.io-6366f1?style=flat-square\" alt=\"Portfolio\"></a>\n"
        f"  <a href=\"{P['linkedin']}\"><img src=\"https://img.shields.io/badge/LinkedIn-Thippeswamy%20K.S.-0a66c2?style=flat-square&logo=linkedin\" alt=\"LinkedIn\"></a>\n"
        f"  <a href=\"mailto:{P['email']}\"><img src=\"https://img.shields.io/badge/Email-{P['email'].replace('-', '--').replace('@', '%40')}-06b6d4?style=flat-square&logo=gmail&logoColor=white\" alt=\"Email\"></a>\n"
        f"  <a href=\"{site.rstrip('/')}/{P['resume']}\"><img src=\"https://img.shields.io/badge/Resume-PDF-a855f7?style=flat-square\" alt=\"Resume\"></a>\n"
        "</p>\n")
    o.append(f"> {P['headline']}\n")
    o.append(md(P["summary"], site) + "\n")
    o.append("\n".join(f"- **{f['title']}** — {f['text']}" for f in d["facts"]) + "\n")

    for part in d["parts"]:
        o.append(f"## {part['num']} · [{part['title']}]({anchor(site, part['id'])})\n")
        o.append(f"{md(part['intro'], site)}\n")
        o += [feature(p, site) for p in part["featured"]]
        o += [group(g, site) for g in part["groups"]]

    o.append(f"## [Experience]({anchor(site, 'experience')})\n")
    for j in d["experience"]:
        o.append(f"**{j['role']}** · {j['org']} · *{j['when']}*  ")
        o += [f"- {md(p, site)}" for p in j["points"]]
        if j.get("note"):
            o.append(f"\n<sub>{j['note']}</sub>")
        o.append("")

    pub = d["publication"]
    title = f"[{pub['title']}]({pub['url']})" if pub.get("url") else pub["title"]
    o.append(f"## [Publication]({anchor(site, 'publication')})\n")
    o.append(f"📄 **{title}**  \n{md(pub['authors'], site)} · *{pub['venue']}*\n")
    o.append(f"{pub['abstract']}\n")

    o.append(f"## [Skills]({anchor(site, 'skills')})\n")
    o.append("| Area | Skills |\n|---|---|")
    o += [f"| **{s['title']}** | {', '.join(s['items'])} |" for s in d["skills"]]
    o.append("")

    mw = d["more_work"]
    o.append(f"## [More work]({anchor(site, 'more-work')})\n")
    o.append(f"{mw['intro']}\n")
    o += [group(g, site) for g in mw["groups"]]

    o.append("## Education\n")
    o += [f"- **{e['title']}** — {e['place']} · *{e['when']}*" for e in d["education"]]
    o.append("")
    o.append("---\n")
    o.append(f"<sub>🔒 = private repository, code available on request. "
             f"This README is generated from the same data as [{site.replace('https://', '').rstrip('/')}]({site}).</sub>\n")
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
