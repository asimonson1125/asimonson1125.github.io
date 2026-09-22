"""
Regenerates the neon star logo SVGs without SVG filters.

iOS WebKit renders SVG filter output (feGaussianBlur) at a capped, low resolution,
which smears the original Inkscape logo's glow into a blocky blob at icon sizes.
This script reproduces that design with no filters at all:

  - star + glow: the original blur chain, computed here with scipy on a symmetric
    rebuild of the star and embedded as a WebP. A glow has no fine detail, so the
    image scales without visible loss.
  - tube halo: nested strokes whose opacities reproduce the original stack of blurs
    around a 3-unit line, stepped finer as the halo fades so its edge never shows.

Outputs (overwritten in place):
  src/static/icons/neonfinal3.svg      header mark, transparent background
  src/static/icons/withBackground.svg  favicon, same mark on a dark disc

Usage (from the repo root):
  pip install -r adhoc/neon-star/requirements.txt
  python -m playwright install chromium
  python adhoc/neon-star/build_neon_star.py

Chromium (via Playwright) is only used to rasterise the star path before blurring.
"""
import base64
import io
from pathlib import Path

import numpy as np
from PIL import Image
from playwright.sync_api import sync_playwright
from scipy.ndimage import gaussian_filter
from scipy.stats import norm

ICONS = Path(__file__).resolve().parents[2] / "src" / "static" / "icons"

# Glow intensity: alpha a becomes 1-(1-a)^K, which brightens without clipping.
# 1.0 reproduces the original Inkscape design exactly.
K = 1.8

# --- geometry, all from the original Inkscape file --------------------------------
VIEWBOX = "0 0 216.75919 216.7592"
LAYER = "translate(-6.8045576,-27.991731)"
STAR_SCALE, STAR_TX, STAR_TY = 1.1617659, 37.635304, 39.028635
STAR_MATRIX = f"matrix({STAR_SCALE},0,0,{STAR_SCALE},{STAR_TX},{STAR_TY})"
STAR_C = (68.084846, 82.277237)          # star centre, star-local units
TUBES_TRANSFORM = "translate(10.7751035,-33.343613)"
TUBE_PATHS = [
    ('translate(-6.0989631,2.1674006)', "M 142.67883,102.44998 H 73.832338 a 10.424106,10.424106 142.5 0 0 -10.068913,7.72615 l -6.688692,24.96254"),
    ('', "M 156.95436,91.412872 H 56.426396 A 10.527561,10.527561 142.5 0 0 46.257553,99.2157 l -11.945382,44.58078"),
    ('rotate(180,105.40367,165.67111)', "M 142.67883,102.44998 H 73.832338 a 10.424106,10.424106 142.5 0 0 -10.068913,7.72615 l -6.688692,24.96254"),
    ('rotate(180,103.61221,167.4007)', "M 156.95436,91.412872 H 56.426396 a 10.496229,10.496229 142.41749 0 0 -10.146361,7.808817 l -13.97988,52.781241"),
]
BACKGROUND = '<circle cx="115.18415" cy="136.37132" r="108.37959" fill="#1a1a1a"/>'

# --- star path ----------------------------------------------------------------------
# The original star's arms had two different edge curves (handles (9.11, 1.29) and
# (7.51, 0.72)), so the points leaned like a pinwheel. Every edge here uses their
# average, mirrored, so all four points and shoulders are identical.
TIP, ARM_W, SHOULDER = 50.0, 3.0, 15.0
HANDLE_ALONG, HANDLE_OUT = (9.1085 + 7.51146) / 2, (1.28778 + 0.71725) / 2


def star_path():
    def rot(p, n):
        x, y = p
        for _ in range(n):
            x, y = y, -x
        return x, y

    def pt(p):
        return f"{p[0] + STAR_C[0]:.4f},{p[1] + STAR_C[1]:.4f}"

    add = lambda p, q: (p[0] + q[0], p[1] + q[1])
    sub = lambda p, q: (p[0] - q[0], p[1] - q[1])
    # one quadrant: left tip -> left arm's lower shoulder -> bottom arm's left shoulder
    tip, lower, bottom = (-TIP, 0), (-SHOULDER, ARM_W), (-ARM_W, SHOULDER)
    h_lower, h_bottom = (HANDLE_ALONG, HANDLE_OUT), (-HANDLE_OUT, -HANDLE_ALONG)
    segs = []
    for n in range(4):
        r = lambda p: rot(p, n)
        segs.append(f"C {pt(r(tip))} {pt(r(sub(lower, h_lower)))} {pt(r(lower))}")
        segs.append(f"C {pt(r(add(lower, h_lower)))} {pt(r(add(bottom, h_bottom)))} {pt(r(bottom))}")
        segs.append(f"C {pt(r(sub(bottom, h_bottom)))} {pt(r((0, TIP)))} {pt(r((0, TIP)))}")
    return f"M {pt((-TIP, 0))} " + " ".join(segs) + " Z"


# --- star + glow texture ------------------------------------------------------------
HALF = 100.0                    # texture covers +-HALF layer units around the star
PX_PER_UNIT = 3.2
N = int(2 * HALF * PX_PER_UNIT)
CX = STAR_SCALE * STAR_C[0] + STAR_TX   # star centre, layer units
CY = STAR_SCALE * STAR_C[1] + STAR_TY


def render_star(path_d):
    """Rasterise the star (original fill gradient + orange edge) as premultiplied RGBA."""
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{N}" height="{N}" viewBox="{CX - HALF} {CY - HALF} {2 * HALF} {2 * HALF}">
<defs><radialGradient id="f" cx="{STAR_C[0]}" cy="{STAR_C[1]}" r="51.629848" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffc919"/><stop offset="1" stop-color="#d2ae2d"/></radialGradient></defs>
<path transform="{STAR_MATRIX}" fill="url(#f)" stroke="#ff9c00" stroke-width="0.860759" stroke-linejoin="round" d="{path_d}"/></svg>'''
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": N, "height": N})
        page.set_content(f'<body style="margin:0">{svg}</body>')
        png = page.screenshot(omit_background=True)
        browser.close()
    img = np.asarray(Image.open(io.BytesIO(png)).convert("RGBA")).astype(float) / 255
    img[..., :3] *= img[..., 3:]
    return img


def blur(img, sigma):
    return np.stack([gaussian_filter(img[..., c], sigma * PX_PER_UNIT) for c in range(4)], -1)


def over(top, bottom):
    return top + bottom * (1 - top[..., 3:])


def star_texture(path_d):
    star = render_star(path_d)
    core = blur(star, 1.368)       # original filter10 (0.5) + filter5 (1.07), in layer units
    mid = 0.7 * blur(core, 9.294)  # original use6: opacity 0.7, filter6
    wide = blur(mid, 10.041)       # original use7: filter8 on top of use6
    glow = over(mid, wide)
    if K != 1.0:
        a = glow[..., 3:]
        glow = glow * np.divide(1 - (1 - a) ** K, a, out=np.zeros_like(a), where=a > 1e-6)
    out = over(core, glow)
    rgb = np.divide(out[..., :3], out[..., 3:], out=np.zeros_like(out[..., :3]), where=out[..., 3:] > 1e-6)
    rgba = (np.concatenate([rgb, out[..., 3:]], -1).clip(0, 1) * 255 + 0.5).astype("uint8")
    buf = io.BytesIO()
    Image.fromarray(rgba).save(buf, "WEBP", quality=92, method=6)
    return base64.b64encode(buf.getvalue()).decode()


# --- tube halo ----------------------------------------------------------------------
def tube_halo():
    sigmas = [13.071903, 4.7058852, 1.1764713]   # original filter30, filter29, filter9

    def alpha(d):
        """Original halo alpha at distance d from the centre of a 3-unit line."""
        a = 0.75 * (1 - np.prod([1 - (norm.cdf((d + 1.5) / s) - norm.cdf((d - 1.5) / s)) for s in sigmas]))
        return 1 - (1 - a) ** K

    def radius_at(v, lo=1.5, hi=100.0):
        for _ in range(60):
            m = (lo + hi) / 2
            lo, hi = (m, hi) if alpha(m) > v else (lo, m)
        return lo

    # Alpha levels per band: ~0.025 steps where bright, ~0.008 in the tail. Every step
    # must stay large enough to survive 8-bit compositing, or the halo goes missing.
    a0 = alpha(1.5)
    levels = list(np.linspace(a0, 0.08, max(6, int(np.ceil((a0 - 0.08) / 0.025))), endpoint=False))
    levels += list(np.linspace(0.08, 0.008, 10))
    bands = [(a + b) / 2 for a, b in zip(levels, levels[1:] + [0.0])] + [0.0]
    uses = []
    for k in range(len(bands) - 1):
        r = radius_at((bands[k] + bands[k + 1]) / 2)
        o = 1 - (1 - bands[k]) / (1 - bands[k + 1])
        uses.append(f'<use xlink:href="#tubePaths" stroke-width="{2 * r:.3f}" stroke-opacity="{o:.4f}"/>')
    return "".join(reversed(uses))


# --- assembly -----------------------------------------------------------------------
def build_svg(texture_b64, halo, background=""):
    tubes = "\n".join(
        '      <path' + (f' transform="{t}"' if t else '') + f' d="{d}"/>' for t, d in TUBE_PATHS)
    return f'''<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="{VIEWBOX}" width="64" height="64">
  <!--
    Generated by adhoc/neon-star/build_neon_star.py; edit that, not this file.
    No SVG filters: iOS WebKit renders filter output at a capped low resolution,
    which smears the glow at icon sizes. The star and its glow are the original blur
    chain computed offline and embedded as a WebP; the tube halo is nested strokes.
  -->
  <defs>
    <g id="tubePaths">
{tubes}
    </g>
  </defs>
  <g transform="{LAYER}">
    {background}
    <image x="{CX - HALF:.3f}" y="{CY - HALF:.3f}" width="{2 * HALF}" height="{2 * HALF}" preserveAspectRatio="none" xlink:href="data:image/webp;base64,{texture_b64}"/>
    <g transform="{TUBES_TRANSFORM}" fill="none" stroke="#ededed" stroke-linecap="round" stroke-linejoin="round">
      {halo}
      <use xlink:href="#tubePaths" stroke-width="3"/>
    </g>
  </g>
</svg>
'''


def main():
    texture = star_texture(star_path())
    halo = tube_halo()
    for name, bg in [("neonfinal3.svg", ""), ("withBackground.svg", BACKGROUND)]:
        out = ICONS / name
        out.write_text(build_svg(texture, halo, bg), encoding="utf-8")
        print(f"wrote {out} ({out.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
