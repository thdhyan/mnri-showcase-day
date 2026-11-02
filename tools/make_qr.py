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
    cards.append((f"Poster {board}", p["title"], p["presenter"], "Scan to rate this poster (1-5)", q.svg_inline(scale=6, border=2)))

fb_url = f"{SITE}feedback.html"
fq = segno.make(fb_url, error="m")
fq.save("qr/questions-and-suggestions.png", scale=12, border=3)
cards.append(("Questions & Suggestions", "Ask the organizers a question or share a suggestion", "", "Scan to open the form", fq.svg_inline(scale=6, border=2)))

body = "".join(
    f'<section class="card"><h2>{html.escape(a)}</h2><h3>{html.escape(b)}</h3><p>{html.escape(c)}</p>{e}<p class="hint">{html.escape(d)}</p></section>'
    for a, b, c, d, e in cards)
open("qr/print.html", "w").write(f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><title>MnRI Showcase QR codes (print)</title>
<style>
body{{font-family:Helvetica,Arial,sans-serif;margin:0}}
.card{{page-break-after:always;break-after:page;height:100vh;box-sizing:border-box;padding:1.2in .8in;text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center}}
.card h2{{font-size:30pt;margin:0 0 .2in;color:#7a0019}} .card h3{{font-size:20pt;margin:0 0 .1in}} .card p{{font-size:15pt;margin:.05in 0 .3in}}
.card svg{{width:4.5in;height:4.5in}} .hint{{font-size:18pt!important;font-weight:700;margin-top:.3in!important}}
</style></head><body>{body}</body></html>
""")
print(len(cards), "cards")
