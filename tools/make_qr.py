"""Generate branded print-ready showcase QR sheets. Requires segno and Chrome."""
import html
import json
import subprocess
from pathlib import Path

import segno

SITE = "https://thdhyan.github.io/mnri-showcase-day/"
out = Path("qr")
out.mkdir(exist_ok=True)
posters = json.loads(subprocess.run(
    ["node", "-e", "global.window={};require('./poster-data.js');console.log(JSON.stringify(window.MNRI_ASSIGNMENTS_FULL))"],
    capture_output=True, text=True, check=True).stdout)


def qr(url):
    return segno.make(url, error="m").svg_inline(scale=4, border=4)


def card(name, subtitle, url, hint):
    return (f'<section class="card"><div class="brand">MnRI <span>MINNESOTA ROBOTICS INSTITUTE</span></div>'
            f'<div class="event">ROBOTICS RESEARCH SHOWCASE</div><h2>{html.escape(name)}</h2>'
            f'<div class="subtitle">{html.escape(subtitle)}</div>{qr(url)}'
            f'<div class="hint">{html.escape(hint)}</div></section>')


def document(cards, columns=3):
    per_page = columns * 2 if columns == 3 else 1
    pages = ''.join('<div class="page">' + ''.join(cards[i:i + per_page]) + '</div>'
                    for i in range(0, len(cards), per_page))
    return f'''<!doctype html><html lang="en"><meta charset="utf-8"><title>MnRI Showcase QR codes</title>
<style>
@page {{ size: 11in 8.5in; margin: 0 }}
* {{ box-sizing: border-box }} body {{ margin: 0; font-family: Arial, sans-serif; color: #222 }}
.page {{ width: 11in; height: 8.5in; padding: .30in; display: grid; grid-template-columns: repeat({columns}, 1fr); grid-template-rows: {'repeat(2, 1fr)' if columns == 3 else '1fr'}; gap: .16in; break-after: page }}
.card {{ border: 1px dashed #999; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; overflow: hidden; padding: .10in }}
.brand {{ color: #7a0019; font-size: 19pt; font-weight: 900; line-height: 1 }} .brand span {{ display: block; font-size: 6.3pt; letter-spacing: .06em; margin-top: 3px }}
.event {{ color: #7a0019; font-size: 7.5pt; letter-spacing: .06em; border-bottom: 3px solid #ffcc33; padding: 5px 0 4px; margin-bottom: 5px; font-weight: bold }}
h2 {{ color: #7a0019; font-size: 14pt; margin: 2px 0 3px; line-height: 1.1 }} .subtitle {{ font-size: 8pt; line-height: 1.15; max-height: .43in; overflow: hidden }}
svg {{ width: {'2.05in' if columns == 3 else '4in'}; height: {'2.05in' if columns == 3 else '4in'}; flex-shrink: 0 }}
.hint {{ font-size: 10pt; font-weight: bold; margin-top: 1px }}
</style><body>{pages}</body></html>'''


def make_pdf(name, content):
    path = (out / (name + '.html')).resolve()
    path.write_text(content, encoding='utf-8')
    subprocess.run(['google-chrome', '--headless', '--no-sandbox', '--disable-gpu', '--user-data-dir=/tmp/mnri-chrome-qr',
                    '--no-pdf-header-footer', '--print-to-pdf=' + str(path.with_suffix('.pdf')),
                    path.as_uri()], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

cards = []
for board, poster in sorted(posters.items(), key=lambda item: item[1]['presenter'].lower()):
    url = f"{SITE}vote.html?p={poster['id']}"
    segno.make(url, error='m').save(out / f"vote_{poster['id']}.png", scale=12, border=4)
    cards.append(card(poster['presenter'], poster['title'], url, 'SCAN TO RATE THIS POSTER'))
make_pdf('presenter-qr-cards', document(cards))
for name, title, subtitle, url in [
    ('website-branded', 'Showcase Website', 'Schedule, posters and event information', SITE),
    ('navigation-branded', 'Event Navigation', 'Find your way around the showcase', SITE + 'navigation.html'),
]:
    make_pdf(name, document([card(title, subtitle, url, 'SCAN TO OPEN')], columns=1))
print(f'Generated {len(cards)} presenter cards and 2 event pages.')
