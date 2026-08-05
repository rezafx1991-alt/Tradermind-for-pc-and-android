import os, subprocess, math
W,H=1280,720
out='artifacts/tradermind-video/frames'
os.makedirs(out,exist_ok=True)
# SVG frame generator: branded ink/coral/copper motion graphics, with dashboard reference and preview asset
for i in range(729):
    t=i/30.0
    scene = 0 if t<4.2 else 1 if t<9.8 else 2 if t<14.5 else 3 if t<19.7 else 4
    p = (t - [0,4.2,9.8,14.5,19.7][scene]) / [4.2,5.6,4.7,5.2,4.6][scene]
    glowx = 800 + int(80*math.sin(t*.6)); glowy=220+int(35*math.cos(t*.7))
    svg=[]
    svg.append(f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
    <defs><radialGradient id="bg" cx="70%" cy="15%"><stop offset="0" stop-color="#26373b"/><stop offset=".46" stop-color="#10191e"/><stop offset="1" stop-color="#0c1418"/></radialGradient>
    <linearGradient id="cor" x1="0" x2="1"><stop stop-color="#df6d55"/><stop offset="1" stop-color="#c95849"/></linearGradient>
    <pattern id="grid" width="110" height="110" patternUnits="userSpaceOnUse"><path d="M110 0H0V110" fill="none" stroke="#d7a55b" stroke-opacity=".11"/></pattern>
    <filter id="blur"><feGaussianBlur stdDeviation="30"/></filter></defs>
    <rect width="1280" height="720" fill="url(#bg)"/><ellipse cx="{glowx}" cy="{glowy}" rx="210" ry="140" fill="#df6d55" opacity=".08" filter="url(#blur)"/>
    <rect width="1280" height="720" fill="url(#grid)" opacity=".45"/>
    <circle cx="-85" cy="440" r="330" fill="none" stroke="#d7a55b" stroke-opacity=".28"/><circle cx="-85" cy="440" r="390" fill="none" stroke="#d7a55b" stroke-opacity=".08"/>
    <text x="1115" y="44" fill="#d7a55b" font-family="DejaVu Sans Mono" font-size="15" letter-spacing="2">TM</text><text x="1150" y="44" fill="#c6bba9" font-family="DejaVu Sans Mono" font-size="11" letter-spacing="2">TRADERMIND OS</text>''')
    if scene==0:
        svg.append(f'''<text x="105" y="145" fill="#d7a55b" font-family="DejaVu Sans Mono" font-size="14" letter-spacing="4">TRADERMIND OS · OFFLINE TRADING JOURNAL</text>
        <text x="105" y="260" fill="#f5ead8" font-family="DejaVu Sans" font-size="94" font-weight="bold">Think in</text><text x="105" y="355" fill="#df6d55" font-family="DejaVu Sans" font-size="94" font-weight="bold">trades.</text>
        <text x="105" y="410" fill="#c6bba9" font-family="DejaVu Sans" font-size="21">A private operating system for the moments</text><text x="105" y="442" fill="#c6bba9" font-family="DejaVu Sans" font-size="21">between the chart and the decision.</text>
        <g transform="translate({825+int(14*math.sin(t))} 330) rotate({-10+int(8*math.sin(t*.4))})"><ellipse rx="170" ry="70" fill="none" stroke="#d7a55b" stroke-opacity=".5"/><ellipse rx="190" ry="52" fill="none" stroke="#d7a55b" stroke-opacity=".35" transform="rotate(55)"/><circle r="66" fill="#df6d55"/><text x="-32" y="15" fill="#10191e" font-family="DejaVu Sans" font-size="36" font-weight="bold">TM</text><circle cx="165" cy="-34" r="7" fill="#d7a55b"/><circle cx="-160" cy="36" r="7" fill="#df6d55"/></g>
        <text x="105" y="665" fill="#c6bba9" font-family="DejaVu Sans Mono" font-size="12" letter-spacing="3">A QUIET EDGE / 01</text>''')
    elif scene==1:
        svg.append('''<text x="92" y="118" fill="#d7a55b" font-family="DejaVu Sans Mono" font-size="14" letter-spacing="3">01 / THE DASHBOARD</text>
        <g transform="translate(92 145)"><rect width="1095" height="470" rx="10" fill="#152228" stroke="#d7a55b" stroke-opacity=".42"/><rect width="190" height="470" rx="10" fill="#111b21"/><text x="28" y="48" fill="#f5ead8" font-family="DejaVu Sans Mono" font-size="15">TraderMind <tspan fill="#df6d55">OS</tspan></text>''')
        for j,label in enumerate(['⌂  داشبورد','↗  معاملات','⌁  تحلیل','▦  ژورنال روزانه','◇  استراتژی‌ها','◷  یادآورها']):
            y=105+j*47; bg='#243239' if j==0 else '#111b21'; svg.append(f'<rect x="16" y="{y-24}" width="158" height="34" rx="4" fill="{bg}"/><text x="32" y="{y}" fill="{("#f5ead8" if j==0 else "#758486")}" font-family="DejaVu Sans" font-size="14">{label}</text>')
        svg.append('''<g transform="translate(230 48)"><text x="0" y="0" fill="#f5ead8" font-family="DejaVu Sans" font-size="20">صبح بخیر، تریدر</text><text x="0" y="54" fill="#d7a55b" font-family="DejaVu Sans" font-size="13">خلاصه عملکرد</text><text x="0" y="95" fill="#f5ead8" font-family="DejaVu Sans" font-size="35" font-weight="bold">+ ۱۲.۴۸٪</text>''')
        for j,h in enumerate([25,38,30,52,45,62,56,75,68,85,76,92]):
            svg.append(f'<rect x="{j*25}" y="{150-h}" width="15" height="{h}" fill="#df6d55" opacity=".85"/>')
        cards=[('معاملات امروز','۰۳','همه چیز ثبت شده است.'),('وضعیت ذهنی','متمرکز','قبل از شروع، مکث کن.')]
        for j,(a,b,c) in enumerate(cards):
            x=430+j*230; svg.append(f'<rect x="{x}" y="48" width="205" height="165" rx="5" fill="#1d2b31" stroke="#f5ead8" stroke-opacity=".12"/><text x="{x+18}" y="80" fill="#859293" font-family="DejaVu Sans" font-size="13">{a}</text><text x="{x+18}" y="132" fill="#d7a55b" font-family="DejaVu Sans" font-size="25" font-weight="bold">{b}</text><text x="{x+18}" y="175" fill="#859293" font-family="DejaVu Sans" font-size="12">{c}</text>')
        svg.append('''<text x="0" y="285" fill="#859293" font-family="DejaVu Sans" font-size="13">منحنی سرمایه</text><path d="M0 388 C65 375 70 340 130 360 S200 315 260 340 S330 278 390 320 S470 267 555 292" fill="none" stroke="#d7a55b" stroke-width="4"/><circle cx="555" cy="292" r="6" fill="#df6d55"/><text x="700" y="420" fill="#d7a55b" font-family="DejaVu Sans Mono" font-size="13">● ذخیره محلی فعال</text></g></g><text x="92" y="665" fill="#c6bba9" font-family="DejaVu Sans Mono" font-size="13">See the pattern before it becomes a habit.</text>''')
    elif scene==2:
        svg.append('''<text x="105" y="140" fill="#d7a55b" font-family="DejaVu Sans Mono" font-size="14" letter-spacing="3">02 / THE JOURNAL</text><text x="105" y="245" fill="#f5ead8" font-family="DejaVu Sans" font-size="60" font-weight="bold">Turn a trade</text><text x="105" y="310" fill="#f5ead8" font-family="DejaVu Sans" font-size="60" font-weight="bold">into <tspan fill="#df6d55">evidence.</tspan></text><text x="105" y="380" fill="#c6bba9" font-family="DejaVu Sans" font-size="19">Capture the setup. Name the risk.</text><text x="105" y="412" fill="#c6bba9" font-family="DejaVu Sans" font-size="19">Write down what the chart can’t.</text>
        <g transform="translate(730 100) rotate(2)"><rect width="410" height="500" fill="#f5ead8"/><text x="28" y="50" fill="#10191e" font-family="DejaVu Sans" font-size="17" font-weight="bold">ثبت معامله جدید</text><text x="285" y="50" fill="#7b766d" font-family="DejaVu Sans Mono" font-size="11">۲۱ مرداد ۱۴۰۴</text>''')
        for y,a,b in [(105,'نماد','EURUSD'),(185,'نوع معامله','خرید'),(265,'ریسک','۰.۷۵٪'),(355,'یادداشت ذهنی','ورود طبق پلن، بدون عجله.')]:
            svg.append(f'<text x="30" y="{y}" fill="#7b766d" font-family="DejaVu Sans Mono" font-size="11">{a}</text><text x="30" y="{y+28}" fill="#10191e" font-family="DejaVu Sans" font-size="18">{b}</text><path d="M30 {y+45} H380" stroke="#c7bbaa"/>')
        svg.append('''<rect x="30" y="420" width="82" height="25" fill="none" stroke="#baad9a"/><text x="43" y="437" fill="#716a5f" font-family="DejaVu Sans Mono" font-size="10">Breakout</text><text x="30" y="480" fill="#69836a" font-family="DejaVu Sans Mono" font-size="11">● آفلاین ذخیره شد</text></g><text x="105" y="665" fill="#c6bba9" font-family="DejaVu Sans Mono" font-size="13">01 — 04</text>''')
    elif scene==3:
        svg.append('''<text x="105" y="135" fill="#d7a55b" font-family="DejaVu Sans Mono" font-size="14" letter-spacing="3">03 / THE REVIEW</text><text x="105" y="250" fill="#f5ead8" font-family="DejaVu Sans" font-size="67" font-weight="bold">Patterns,</text><text x="105" y="320" fill="#df6d55" font-family="DejaVu Sans" font-size="67" font-weight="bold">not guesses.</text><text x="105" y="390" fill="#c6bba9" font-family="DejaVu Sans" font-size="19">Review the story behind every number.</text><text x="105" y="422" fill="#c6bba9" font-family="DejaVu Sans" font-size="19">Find your repeatable edge.</text>
        <circle cx="770" cy="305" r="132" fill="none" stroke="#d7a55b" stroke-opacity=".35" stroke-dasharray="4 9"/><circle cx="770" cy="305" r="92" fill="none" stroke="#df6d55" stroke-width="16" stroke-dasharray="405 175" transform="rotate(-90 770 305)"/><circle cx="770" cy="305" r="57" fill="#1d2830"/><text x="770" y="300" text-anchor="middle" fill="#f5ead8" font-family="DejaVu Sans" font-size="23" font-weight="bold">64.8%</text><text x="770" y="322" text-anchor="middle" fill="#9aa6a6" font-family="DejaVu Sans Mono" font-size="10">WIN RATE</text>''')
        for j,(a,b,c) in enumerate([('best window','London open','+2.8R'),('repeat mistake','closing early','4 times'),('discipline score','7.6 / 10','↑ 12%')]):
            x=570+j*220; svg.append(f'<rect x="{x}" y="540" width="190" height="82" fill="#1d2b31" stroke="#d7a55b" stroke-opacity=".4"/><text x="{x+14}" y="564" fill="#859293" font-family="DejaVu Sans Mono" font-size="10">{a}</text><text x="{x+14}" y="588" fill="#f5ead8" font-family="DejaVu Sans" font-size="14">{b}</text><text x="{x+14}" y="610" fill="#df6d55" font-family="DejaVu Sans Mono" font-size="12">{c}</text>')
    else:
        svg.append('''<text x="105" y="150" fill="#d7a55b" font-family="DejaVu Sans Mono" font-size="14" letter-spacing="3">04 / YOUR EDGE, KEPT PRIVATE</text><text x="105" y="270" fill="#f5ead8" font-family="DejaVu Sans" font-size="78" font-weight="bold">Stay close</text><text x="105" y="350" fill="#f5ead8" font-family="DejaVu Sans" font-size="78" font-weight="bold">to your <tspan fill="#df6d55">process.</tspan></text><text x="105" y="410" fill="#c6bba9" font-family="DejaVu Sans" font-size="20">Offline by design. Ready wherever you trade.</text><circle cx="1050" cy="350" r="205" fill="none" stroke="#d7a55b" stroke-opacity=".35"/><circle cx="1050" cy="350" r="245" fill="none" stroke="#d7a55b" stroke-opacity=".1"/><rect x="105" y="500" width="54" height="54" fill="#df6d55"/><text x="115" y="536" fill="#10191e" font-family="DejaVu Sans" font-size="20" font-weight="bold">TM</text><text x="177" y="525" fill="#f5ead8" font-family="DejaVu Sans" font-size="22" font-weight="bold">TraderMind OS</text><text x="177" y="548" fill="#d7a55b" font-family="DejaVu Sans Mono" font-size="11" letter-spacing="2">TRADING, WITH MEMORY.</text><text x="1050" y="665" text-anchor="middle" fill="#c6bba9" font-family="DejaVu Sans Mono" font-size="13" letter-spacing="3">NO CLOUD. NO NOISE. JUST THE WORK.</text>''')
    svg.append('</svg>')
    path=f'{out}/frame_{i:04d}.svg'
    open(path,'w').write(''.join(svg))
    subprocess.run(['convert',path,f'{out}/frame_{i:04d}.png'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,timeout=10)
    os.unlink(path)
print('frames',len(os.listdir(out)))
