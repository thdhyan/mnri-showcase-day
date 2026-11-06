"""Make letter-size room welcome signs. Requires segno and Chrome."""
import base64
import html
import subprocess
from pathlib import Path
import segno

root = Path(__file__).resolve().parent.parent
site = 'https://thdhyan.github.io/mnri-showcase-day/'
logo = base64.b64encode((root / 'media/brand/mnri-logo.png').read_bytes()).decode()

def qr(url):
    code = segno.make(url, error='m')
    size = code.symbol_size(border=4)[0] * 4
    return code.svg_inline(scale=4, border=4).replace('<svg ', f'<svg viewBox="0 0 {size} {size}" ')

links = [('WEBSITE', site), ('NAVIGATION', site + 'navigation.html'), ('QUESTIONS & FEEDBACK', site + 'feedback.html')]
signs = [
    ('keller-welcome', 'Keller Hall 3-180', [
        ('9:00–9:10 AM', 'University Leadership’s Welcome'),
        ('9:10–9:20 AM', 'Director’s Welcome'),
        ('9:20–10:20 AM', 'Faculty Lightning Talks · Session I'),
        ('10:30–11:30 AM', 'Faculty Lightning Talks · Session II'),
    ], ''),
    ('me-1130-welcome', 'Mechanical Engineering 1130', [
        ('3:15–4:15 PM', 'Funding Opportunities Roundtable'),
        ('4:30–5:30 PM', 'Industry Roundtable'),
    ], 'For faculty researchers, industry personnel, and PhD students.'),
]
for filename, room, sessions, note in signs:
    rows = ''.join(f'<div class="row"><span>{html.escape(time)}</span><strong>{html.escape(title)}</strong></div>' for time, title in sessions)
    codes = ''.join(f'<div class="qr">{qr(url)}<div>{html.escape(label)}</div></div>' for label, url in links)
    content = f'''<!doctype html><html lang="en"><meta charset="utf-8"><title>Welcome to {html.escape(room)}</title><style>
@page {{ size: letter portrait; margin: 0 }} * {{ box-sizing: border-box }} body {{ margin: 0; font-family: Arial, sans-serif; color: #252525; }}
.page {{ width: 8.5in; height: 11in; padding: .38in .56in; text-align: center; position: relative; }}
.logo {{ width: 2.15in; height: 1.24in; overflow: hidden; position: relative; margin: 0 auto; }} .logo img {{ position: absolute; width: 100%; left: 0; top: -40%; }}
.eyebrow {{ color: #7a0019; font-size: 12pt; font-weight: bold; letter-spacing: .1em; margin-top: .04in; }}
h1 {{ color: #7a0019; font-size: 34pt; line-height: 1; margin: .16in 0 .07in; }} .event {{ font-size: 16pt; font-weight: bold; }}
.date {{ font-size: 12pt; color: #555; margin: .08in 0 .18in; }} .room {{ background: #7a0019; color: white; font-size: 21pt; font-weight: bold; padding: .13in; }}
.section {{ color: #7a0019; font-size: 14pt; font-weight: bold; text-align: left; margin: .23in 0 .08in; border-bottom: 3px solid #ffcc33; padding-bottom: .07in; }}
.row {{ display: grid; grid-template-columns: 1.6in 1fr; align-items: center; text-align: left; font-size: 13pt; padding: .11in .06in; border-bottom: 1px solid #ddd; }} .row span {{ color: #7a0019; font-weight: bold; }}
.note {{ text-align: left; font-size: 10pt; margin: .14in .05in; }}
.bottom {{ position: absolute; left: .56in; right: .56in; bottom: .40in; }} .scan-title {{ font-size: 13pt; font-weight: bold; color: #7a0019; margin-bottom: .05in; }}
.codes {{ display: flex; justify-content: space-around; align-items: start; }} .qr {{ width: 2in; font-size: 9pt; font-weight: bold; color: #7a0019; }} svg {{ width: 1.55in; height: 1.55in; display: block; margin: 0 auto; }}
</style><body><main class="page"><div class="logo"><img src="data:image/png;base64,{logo}" alt="Minnesota Robotics Institute, University of Minnesota"></div>
<div class="eyebrow">MINNESOTA ROBOTICS INSTITUTE</div><h1>Welcome!</h1><div class="event">MnRI Robotics Research Showcase</div><div class="date">Friday, November 6, 2026</div>
<div class="room">{html.escape(room)}</div><div class="section">TODAY IN THIS ROOM</div>{rows}<div class="note">{html.escape(note)}</div>
<div class="bottom"><div class="scan-title">SCAN FOR EVENT INFORMATION</div><div class="codes">{codes}</div></div></main></body></html>'''
    target = root / 'signs' / (filename + '.html')
    target.write_text(content, encoding='utf-8')
    subprocess.run(['google-chrome', '--headless', '--no-sandbox', '--disable-gpu', '--user-data-dir=/tmp/mnri-chrome-qr', '--no-pdf-header-footer', '--print-to-pdf=' + str(target.with_suffix('.pdf')), target.as_uri()], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(target.with_suffix('.pdf'))
