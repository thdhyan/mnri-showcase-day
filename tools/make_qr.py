"""Generate per-poster vote QR codes + a questions/suggestions QR code into qr/.
Usage: PYTHONPATH=<dir with segno> python3 tools/make_qr.py
Reads poster-data.js (board -> title/presenter), writes qr/*.png and qr/print.html.
"""
import html, json, re, subprocess
import segno

SITE = "https://thdhyan.github.io/mnri-showcase-day/"
posters = json.loads(subprocess.run(
    ["node", "-e", "global.window={};require('./poster-data.js');console.log(JSON.stringify(window.MNRI_ASSIGNMENTS))"],
    capture_output=True, text=True, check=True).stdout)

def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")[:40]

cards = []
for board in sorted(posters):
    p = posters[board]
    url = f"{SITE}vote.html?poster={board}"
    q = segno.make(url, error="m")
    q.save(f"qr/vote_{board}_{slug(p['presenter'])}.png", scale=12, border=3)
    cards.append((f"Poster {board}", p["title"], p["presenter"], "Scan to rate this poster (1-5)", q.svg_inline(scale=4, border=2)))

def card(a, b, c, d, svg):
    who = f"<p>{html.escape(c)}</p>" if c else ""
    return f'<section class="card"><h2>{html.escape(a)}</h2><h3>{html.escape(b)}</h3>{who}{svg}<p class="hint">{html.escape(d)}</p></section>'

general = []
for name, fname, label, hint, url in [
    ("Main voting page", "vote-main", "Pick a poster and rate it", "Scan to vote", f"{SITE}vote.html"),
    ("Showcase Day website", "website", "Schedule, navigation and poster map", "Scan to open the website", SITE),
    ("Questions & Suggestions", "questions-and-suggestions", "Ask the organizers a question or share a suggestion", "Scan to open the form", f"{SITE}feedback.html"),
]:
    q = segno.make(url, error="m")
    q.save(f"qr/{fname}.png", scale=12, border=3)
    general.append(card(name, label, "", hint, q.svg_inline(scale=4, border=2)))

# Landscape letter, 3 columns x 2 rows = 6 per page; general codes get their own last page.
def pages(cells):
    return "".join('<div class="page">' + "".join(cells[i:i + 6]) + "</div>" for i in range(0, len(cells), 6))

body = pages([card(*c) for c in cards]) + pages(general)
open("qr/print.html", "w").write(f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><title>MnRI Showcase QR codes (print)</title>
<style>
@page{{size:11in 8.5in;margin:0}}
body{{font-family:Helvetica,Arial,sans-serif;margin:0}}
.page{{width:11in;height:8.5in;box-sizing:border-box;padding:.35in;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(2,1fr);gap:.2in;break-after:page;page-break-after:always}}
.card{{border:1px dashed #999;box-sizing:border-box;padding:.15in;text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden}}
.card h2{{font-size:15pt;margin:0 0 .06in;color:#7a0019}} .card h3{{font-size:10pt;margin:0 0 .04in;line-height:1.2}} .card p{{font-size:9pt;margin:0 0 .08in}}
.card svg{{width:2.2in;height:2.2in}} .card .hint{{font-size:11pt;font-weight:700;margin:.08in 0 0}}
</style></head><body>{body}</body></html>
""")
print(len(cards), "poster cards,", len(general), "general")
