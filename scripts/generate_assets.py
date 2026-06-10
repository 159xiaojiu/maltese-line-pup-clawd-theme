"""Generate original Maltese line-pup SVG assets for Clawd on Desk theme."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
ASSETS.mkdir(parents=True, exist_ok=True)

VIEW = '-15 -25 45 45'
STROKE = '#1a1a1a'
WHITE = '#ffffff'
BLUSH = '#ffb8b8'
PINK = '#ff8a8a'

STYLE_BASE = f"""
  <style>
    @keyframes breathe {{
      0%, 100% {{ transform: translateY(0); }}
      50% {{ transform: translateY(-0.4px); }}
    }}
    @keyframes blink {{
      0%, 92%, 100% {{ transform: scaleY(1); }}
      95% {{ transform: scaleY(0.08); }}
    }}
    @keyframes tail-wag {{
      0%, 100% {{ transform: rotate(-6deg); }}
      50% {{ transform: rotate(8deg); }}
    }}
    @keyframes bounce {{
      0%, 100% {{ transform: translateY(0); }}
      50% {{ transform: translateY(-1.2px); }}
    }}
    @keyframes zzz {{
      0%, 100% {{ opacity: 0.3; transform: translateY(0); }}
      50% {{ opacity: 1; transform: translateY(-2px); }}
    }}
    #body-js {{ animation: breathe 3.2s ease-in-out infinite; transform-origin: 7.5px 10px; }}
    #eyes-js {{ animation: blink 4.5s ease-in-out infinite; transform-origin: 7.5px 3px; }}
    .tail {{ animation: tail-wag 2.8s ease-in-out infinite; transform-origin: 12px 12px; }}
    .bounce {{ animation: bounce 1.2s ease-in-out infinite; transform-origin: 7.5px 14px; }}
    .zzz {{ animation: zzz 2s ease-in-out infinite; }}
  </style>
"""

# Fluffy maltese body path (sitting pose)
BODY = (
    'M 7.5,1 C 3,1 0,4 0,7.5 0,9 0.5,10.5 1.5,11.5 '
    'L 0.5,13 C -0.5,14.5 0,16.5 1.5,17.5 '
    'C 2,18 2.5,18.5 3,19 L 2,20.5 C 1,21.5 1.5,23 3,23.5 '
    'L 5,24 C 5.5,24.2 6,24.3 6.5,24.3 L 6.8,25.5 C 7,26.2 7.5,26.5 8.2,26.5 '
    'L 8.5,24.3 C 9,24.3 9.5,24.2 10,24 L 12,23.5 C 13.5,23 14,21.5 13,20.5 '
    'L 12,19 C 12.5,18.5 13,18 13.5,17.5 C 15,16.5 15.5,14.5 14.5,13 '
    'L 13.5,11.5 C 14.5,10.5 15,9 15,7.5 15,4 12,1 7.5,1 Z'
)
EAR_L = 'M 2.5,5 C 1,6 0.5,8.5 1.5,10.5 C 2,11.5 3,12 4,11.5 C 3,9.5 3,7 2.5,5 Z'
EAR_R = 'M 12.5,5 C 14,6 14.5,8.5 13.5,10.5 C 13,11.5 12,12 11,11.5 C 12,9.5 12,7 12.5,5 Z'
TAIL = 'M 13.5,16 C 15.5,15 17,16.5 17.5,18.5 C 18,20 17,21.5 15.5,21 C 14.5,20.5 13,19 13.5,16 Z'
BLUSH_L = '<ellipse cx="4.2" cy="8.8" rx="1.3" ry="0.8" fill="{blush}" opacity="0.55"/>'
BLUSH_R = '<ellipse cx="10.8" cy="8.8" rx="1.3" ry="0.8" fill="{blush}" opacity="0.55"/>'
NOSE = '<ellipse cx="7.5" cy="7.2" rx="0.55" ry="0.45" fill="{stroke}"/>'
MOUTH = '<path d="M 7.5,7.8 Q 6.5,8.8 5.5,8.2" fill="none" stroke="{stroke}" stroke-width="0.45" stroke-linecap="round"/>'

EYES_OPEN = (
    '<circle cx="5.5" cy="6.2" r="0.75" fill="{stroke}"/>'
    '<circle cx="9.5" cy="6.2" r="0.75" fill="{stroke}"/>'
    '<circle cx="5.75" cy="5.95" r="0.22" fill="{white}"/>'
    '<circle cx="9.75" cy="5.95" r="0.22" fill="{white}"/>'
)
EYES_CLOSED = (
    '<path d="M 4.8,6.3 Q 5.5,5.9 6.2,6.3" fill="none" stroke="{stroke}" stroke-width="0.55" stroke-linecap="round"/>'
    '<path d="M 8.8,6.3 Q 9.5,5.9 10.2,6.3" fill="none" stroke="{stroke}" stroke-width="0.55" stroke-linecap="round"/>'
)
EYES_HAPPY = (
    '<path d="M 4.8,6.5 Q 5.5,5.7 6.2,6.5" fill="none" stroke="{stroke}" stroke-width="0.6" stroke-linecap="round"/>'
    '<path d="M 8.8,6.5 Q 9.5,5.7 10.2,6.5" fill="none" stroke="{stroke}" stroke-width="0.6" stroke-linecap="round"/>'
)
EYES_ERROR = (
    '<line x1="5" y1="5.8" x2="6" y2="6.7" stroke="{stroke}" stroke-width="0.55" stroke-linecap="round"/>'
    '<line x1="6" y1="5.8" x2="5" y2="6.7" stroke="{stroke}" stroke-width="0.55" stroke-linecap="round"/>'
    '<line x1="9" y1="5.8" x2="10" y2="6.7" stroke="{stroke}" stroke-width="0.55" stroke-linecap="round"/>'
    '<line x1="10" y1="5.8" x2="9" y2="6.7" stroke="{stroke}" stroke-width="0.55" stroke-linecap="round"/>'
)


def fmt(template: str) -> str:
    return template.format(stroke=STROKE, white=WHITE, blush=BLUSH, pink=PINK)


def wrap_idle() -> str:
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="{VIEW}">
{STYLE_BASE}
  <g id="shadow-js" style="transform-origin: 7.5px 15px">
    <ellipse cx="7.5" cy="17" rx="5.5" ry="1.2" fill="rgba(0,0,0,0.12)"/>
  </g>
  <g id="body-js">
    <g class="tail"><path d="{TAIL}" fill="{WHITE}" stroke="{STROKE}" stroke-width="0.9" stroke-linejoin="round"/></g>
    <path d="{BODY}" fill="{WHITE}" stroke="{STROKE}" stroke-width="1.1" stroke-linejoin="round"/>
    <path d="{EAR_L}" fill="{WHITE}" stroke="{STROKE}" stroke-width="0.9" stroke-linejoin="round"/>
    <path d="{EAR_R}" fill="{WHITE}" stroke="{STROKE}" stroke-width="0.9" stroke-linejoin="round"/>
    {fmt(BLUSH_L)}
    {fmt(BLUSH_R)}
    {fmt(NOSE)}
    {fmt(MOUTH)}
  </g>
  <g id="eyes-js">
    {fmt(EYES_OPEN)}
  </g>
</svg>"""


def wrap_state(extra_body: str = "", eyes: str = EYES_OPEN, overlay: str = "", bounce: bool = False) -> str:
    cls = ' class="bounce"' if bounce else ''
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="{VIEW}">
{STYLE_BASE}
  <ellipse cx="7.5" cy="17" rx="5.5" ry="1.2" fill="rgba(0,0,0,0.12)"/>
  <g{cls}>
    <g class="tail"><path d="{TAIL}" fill="{WHITE}" stroke="{STROKE}" stroke-width="0.9" stroke-linejoin="round"/></g>
    <path d="{BODY}" fill="{WHITE}" stroke="{STROKE}" stroke-width="1.1" stroke-linejoin="round"/>
    <path d="{EAR_L}" fill="{WHITE}" stroke="{STROKE}" stroke-width="0.9" stroke-linejoin="round"/>
    <path d="{EAR_R}" fill="{WHITE}" stroke="{STROKE}" stroke-width="0.9" stroke-linejoin="round"/>
    {fmt(BLUSH_L)}
    {fmt(BLUSH_R)}
    {fmt(NOSE)}
    {fmt(MOUTH)}
    {extra_body}
    {fmt(eyes)}
    {overlay}
  </g>
</svg>"""


FILES = {
    "maltese-idle-follow.svg": wrap_idle(),
    "maltese-thinking.svg": wrap_state(
        overlay=(
            '<text x="7.5" y="-6" text-anchor="middle" font-size="4" fill="#888" font-family="sans-serif">?</text>'
            '<circle cx="11" cy="-2" r="1.8" fill="#f5f5f5" stroke="#bbb" stroke-width="0.4"/>'
            '<circle cx="11" cy="-2" r="1.1" fill="none" stroke="#999" stroke-width="0.35"/>'
        )
    ),
    "maltese-working.svg": wrap_state(
        extra_body=(
            '<rect x="1" y="20" width="13" height="2.2" rx="0.6" fill="#e8e8e8" stroke="#bbb" stroke-width="0.35"/>'
            '<rect x="2.5" y="20.4" width="1.8" height="1.4" rx="0.2" fill="#ccc"/>'
            '<rect x="5" y="20.4" width="1.8" height="1.4" rx="0.2" fill="#ccc"/>'
            '<rect x="7.5" y="20.4" width="1.8" height="1.4" rx="0.2" fill="#ccc"/>'
            '<rect x="10" y="20.4" width="1.8" height="1.4" rx="0.2" fill="#ccc"/>'
            '<path d="M 3.5,18.5 L 3.5,20.2" stroke="#1a1a1a" stroke-width="0.5" stroke-linecap="round"/>'
            '<path d="M 11.5,18.5 L 11.5,20.2" stroke="#1a1a1a" stroke-width="0.5" stroke-linecap="round"/>'
        ),
        bounce=True,
    ),
    "maltese-error.svg": wrap_state(
        eyes=EYES_ERROR,
        overlay=(
            '<path d="M 12,-4 L 13,-1 L 16,-1 L 13.5,1 L 14.5,4 L 12,2.5 L 9.5,4 L 10.5,1 L 8,-1 L 11,-1 Z" '
            f'fill="{PINK}" stroke="{STROKE}" stroke-width="0.35"/>'
            '<text x="7.5" y="-8" text-anchor="middle" font-size="2.8" fill="#e55" font-family="sans-serif">!</text>'
        ),
    ),
    "maltese-happy.svg": wrap_state(
        eyes=EYES_HAPPY,
        overlay=(
            f'<path d="M 7.5,8.2 Q 7.5,9.2 6.8,9.5" fill="none" stroke="{STROKE}" stroke-width="0.4" stroke-linecap="round"/>'
            '<path d="M 2,-2 L 2.8,-5 M 4,-1 L 5.5,-4" stroke="#ffd54f" stroke-width="0.5" stroke-linecap="round"/>'
            '<path d="M 13,-2 L 12.2,-5 M 11,-1 L 9.5,-4" stroke="#ffd54f" stroke-width="0.5" stroke-linecap="round"/>'
        ),
        bounce=True,
    ),
    "maltese-notification.svg": wrap_state(
        overlay=(
            '<circle cx="13" cy="-1" r="2.2" fill="#ff6b6b" stroke="#fff" stroke-width="0.4"/>'
            '<text x="13" y="0" text-anchor="middle" font-size="2.8" fill="#fff" font-family="sans-serif">1</text>'
        ),
        bounce=True,
    ),
    "maltese-sleeping.svg": wrap_state(
        eyes=EYES_CLOSED,
        overlay=(
            '<text class="zzz" x="11" y="-4" font-size="2.5" fill="#99a" font-family="sans-serif">z</text>'
            '<text class="zzz" x="13" y="-7" font-size="3" fill="#889" font-family="sans-serif" style="animation-delay:0.6s">Z</text>'
            '<text class="zzz" x="15" y="-10" font-size="3.5" fill="#778" font-family="sans-serif" style="animation-delay:1.2s">Z</text>'
        ),
    ),
    "maltese-waking.svg": wrap_state(
        eyes=EYES_OPEN,
        overlay=(
            '<path d="M 5,2 L 5,-2 M 10,2 L 10,-2" stroke="#ffd54f" stroke-width="0.5" stroke-linecap="round"/>'
        ),
        bounce=True,
    ),
}

for name, content in FILES.items():
    (ASSETS / name).write_text(content, encoding="utf-8")
    print(f"Wrote {name}")

print(f"Done: {len(FILES)} assets in {ASSETS}")
