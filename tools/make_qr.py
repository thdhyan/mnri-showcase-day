"""Generate branded print-ready showcase QR sheets. Requires segno and Chrome."""
import html
import base64
import json
import subprocess
from pathlib import Path

import segno

SITE = "https://thdhyan.github.io/mnri-showcase-day/"
LOGO = base64.b64encode(Path('media/brand/mnri-logo.png').read_bytes()).decode('ascii')
out = Path("qr")
out.mkdir(exist_ok=True)
posters = json.loads(subprocess.run(
    ["node", "-e", "global.window={};require('./poster-data.js');console.log(JSON.stringify(window.MNRI_ASSIGNMENTS_FULL))"],
    capture_output=True, text=True, check=True).stdout)


def qr(url):
    code = segno.make(url, error="m")
    size = code.symbol_size(border=4)[0] * 4
    return code.svg_inline(scale=4, border=4).replace('<svg ', f'<svg viewBox="0 0 {size} {size}" ')


def card(name, subtitle, url, hint):
    return (f'<section class="card"><div class="heading"><div class="logo"><img src="data:image/png;base64,{LOGO}" alt="Minnesota Robotics Institute, University of Minnesota"></div>'
            f'<div class="event">ROBOTICS RESEARCH SHOWCASE</div><h2>{html.escape(name)}</h2>'
            f'<div class="subtitle">{html.escape(subtitle)}</div>{qr(url)}'
            f'<div class="hint">{html.escape(hint)}</div></div></section>')


def document(cards, columns=3):
    per_page = columns * 2 if columns == 3 else 1
    pages = ''.join('<div class="page">' + ''.join(cards[i:i + per_page]) + '</div>'
                    for i in range(0, len(cards), per_page))
    return f'''<!doctype html><html lang="en"><meta charset="utf-8"><title>MnRI Showcase QR codes</title>
<style>
@page {{ size: 11in 8.5in; margin: 0 }}
* {{ box-sizing: border-box }} body {{ margin: 0; font-family: Arial, sans-serif; color: #222 }}
.page {{ width: 11in; height: 8.5in; padding: .30in; display: grid; grid-template-columns: repeat({columns}, 1fr); grid-template-rows: {'repeat(2, 1fr)' if columns == 3 else '1fr'}; gap: .16in; break-after: page }}
.card {{ position: relative; border: {'1px dashed #bbb' if columns == 3 else 'none'}; text-align: center; overflow: hidden }}
.heading {{ position: absolute; inset: 0; }}
.logo {{ position: absolute; top: {'0.04in' if columns == 3 else '0.05in'}; left: 50%; transform: translateX(-50%); width: {'1.65in' if columns == 3 else '2.35in'}; height: {'0.98in' if columns == 3 else '1.42in'}; overflow: hidden }}
.logo img {{ position: absolute; width: 100%; height: auto; left: 0; top: -40% }}
.event {{ position: absolute; top: {'1.01in' if columns == 3 else '1.42in'}; left: 0; width: 100%; color: #7a0019; font-size: {'7pt' if columns == 3 else '11pt'}; letter-spacing: .08em; font-weight: bold }}
h2 {{ position: absolute; top: {'1.19in' if columns == 3 else '1.72in'}; left: 5%; width: 90%; color: #7a0019; font-size: {'13pt' if columns == 3 else '25pt'}; margin: 0; line-height: 1.1 }}
.subtitle {{ position: absolute; top: {'1.45in' if columns == 3 else '2.13in'}; left: 5%; width: 90%; font-size: {'8pt' if columns == 3 else '13pt'}; line-height: 1.1; max-height: .35in; overflow: hidden }}
svg {{ position: absolute; left: 50%; top: {'68%' if columns == 3 else '59%'}; transform: translate(-50%, -50%); width: {'1.75in' if columns == 3 else '3.9in'}; height: {'1.75in' if columns == 3 else '3.9in'} }}
.hint {{ position: absolute; bottom: {'0.12in' if columns == 3 else '0.35in'}; width: 100%; color: #7a0019; font-size: {'9pt' if columns == 3 else '18pt'}; font-weight: bold; letter-spacing: .04em }}
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
    ('feedback-branded', 'Questions & Suggestions', 'Share your feedback with the organizers', SITE + 'feedback.html'),
]:
    make_pdf(name, document([card(title, subtitle, url, 'SCAN TO OPEN')], columns=1))
print(f'Generated {len(cards)} presenter cards and 3 event pages.')
