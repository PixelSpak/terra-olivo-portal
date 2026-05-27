"""
Unified bottle-image processor:
  1. Removes background using birefnet-general (best model for products)
  2. Alpha matting for clean edges (no fringes/artifacts)
  3. Crops to bottle bbox, then scales so bottle = 85% of canvas HEIGHT
     → consistent visual size across all cards
  4. Composites on the olive-50→olive-100 gradient that matches the
     OilImage card placeholder

Usage:
  python3 scripts/process-bottles.py              # all bottles
  python3 scripts/process-bottles.py <slug>...     # specific ones
"""
import sys
import urllib.request
from pathlib import Path
from io import BytesIO
from PIL import Image
from rembg import remove, new_session

ROOT       = Path(__file__).resolve().parent.parent
SRC        = ROOT / "public" / "images"
ORIGINALS  = ROOT / "public" / "images" / "_originals"
ORIGINALS.mkdir(exist_ok=True)

OUT_W, OUT_H        = 600, 800
BOTTLE_HEIGHT_PCT   = 0.85   # bottle = 85% of canvas height
HORIZONTAL_PAD_PCT  = 0.10   # min 10% padding on left/right

# Per-image source URLs and optional pre-crop boxes
# Pre-crop helps when source photos include packaging (BVS box) etc.
SOURCES = {
    "almaoliva-bio": {
        "url": "https://oliveoillovers.com/cdn/shop/files/almaoliva-bion.jpg?v=1766063966",
    },
    "aparthenasa-vavatsinia": {
        "url": "https://aparthenasa.com/cdn/shop/files/VAVATSINIA_250ML.jpg?v=1762281229&width=1946",
    },
    "azeite-organico-bene-blend-de-safra": {
        "url": "https://ecommerce.vtexassets.com/arquivos/ids/156106-800-1080?v=638224319247000000&width=800&height=1080&aspect=true",
    },
    "bio-orto-coratina": {
        "url": "https://feastitaly.com/cdn/shop/files/bio-orto-organic-single-varietal-coratina-extra-virgin-olive-oil-500ml-new-harvest-feast-italy-7706196_2048x2048.png?v=1769845934",
    },
    "bio-orto-peranzana": {
        "url": "https://feastitaly.com/cdn/shop/files/bio-orto-organic-monocultivar-peranzana-extra-virgin-olive-oil-500ml-new-harvest-feast-italy-6969072_2048x2048.png?v=1766576294",
    },
    "bvs-jerusalemoliveoil": {
        "url": "https://www.bestoliveoils.store/cdn/shop/files/IMG_1677-Recovered1-1536x1024.jpg?v=1688011458&width=1946",
        # Tight crop around the bottle only (excludes the gift box on the left)
        "precrop": (0.62, 0.36, 0.97, 0.97),
    },
}

# 9 BVS slugs that share the same source
BVS_SLUGS = [
    "bvs-jerusalemoliveoil-colombia",
    "bvs-jerusalemoliveoil-coratina",
    "bvs-jerusalemoliveoil-heart-notes-blend",
    "bvs-jerusalemoliveoil-koroneiki",
    "bvs-jerusalemoliveoil-picual",
    "bvs-jerusalemoliveoil-sunrise-early-harvest",
    "bvs-jerusalemoliveoil-with-basil",
    "bvs-jerusalemoliveoil-with-chipotle",
    "bvs-jerusalemoliveoil-with-lemon",
]


def download_original(slug, url):
    """Download original to _originals/ (cached)."""
    dst = ORIGINALS / f"{slug}.jpg"
    if dst.exists():
        return dst
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    print(f"  ↓ Downloading original for {slug}...")
    with urllib.request.urlopen(req, timeout=30) as r:
        dst.write_bytes(r.read())
    return dst


def build_gradient(w, h):
    """olive-50 (#f4f6ee) → olive-100 (#e5ead3) vertical gradient."""
    canvas = Image.new("RGB", (w, h))
    px = canvas.load()
    for y in range(h):
        t = y / h
        r = int(244 + (229 - 244) * t)
        g = int(246 + (234 - 246) * t)
        b = int(238 + (211 - 238) * t)
        for x in range(w):
            px[x, y] = (r, g, b)
    return canvas


def process(slug, source_key, session):
    """Process one bottle from its source image."""
    src_info = SOURCES[source_key]
    orig_path = download_original(source_key, src_info["url"])
    img = Image.open(orig_path).convert("RGB")

    # Pre-crop (e.g. BVS: keep only the bottle, not the gift box)
    if "precrop" in src_info:
        l, t, r, b = src_info["precrop"]
        w, h = img.size
        img = img.crop((int(w * l), int(h * t), int(w * r), int(h * b)))

    # AI background removal with alpha matting for clean edges
    buf = BytesIO()
    img.save(buf, "PNG")
    out_bytes = remove(
        buf.getvalue(),
        session=session,
        alpha_matting=True,
        alpha_matting_foreground_threshold=240,
        alpha_matting_background_threshold=20,
        alpha_matting_erode_size=10,
    )
    bottle = Image.open(BytesIO(out_bytes)).convert("RGBA")

    # Crop to the bottle's actual bounding box (kill empty space)
    bbox = bottle.getbbox()
    if bbox:
        bottle = bottle.crop(bbox)

    # Scale so bottle HEIGHT = 85% of canvas height (consistent visual size)
    target_h = int(OUT_H * BOTTLE_HEIGHT_PCT)
    ratio = target_h / bottle.height
    new_w = int(bottle.width * ratio)
    # But never exceed (1 - 2*horizontal_pad) of canvas width
    max_w = int(OUT_W * (1 - 2 * HORIZONTAL_PAD_PCT))
    if new_w > max_w:
        ratio = max_w / bottle.width
        target_h = int(bottle.height * ratio)
        new_w = max_w
    bottle = bottle.resize((new_w, target_h), Image.LANCZOS)

    # Build gradient canvas and paste centered
    canvas = build_gradient(OUT_W, OUT_H)
    x = (OUT_W - bottle.width) // 2
    y = (OUT_H - bottle.height) // 2
    canvas.paste(bottle, (x, y), bottle)  # bottle alpha as mask

    return canvas


def main():
    selected = set(sys.argv[1:])  # empty = all

    # Build the work list: (output_slug, source_key)
    jobs = []
    for slug, _ in SOURCES.items():
        if slug == "bvs-jerusalemoliveoil":
            for bvs_slug in BVS_SLUGS:
                if not selected or bvs_slug in selected:
                    jobs.append((bvs_slug, "bvs-jerusalemoliveoil"))
        else:
            if not selected or slug in selected:
                jobs.append((slug, slug))

    if not jobs:
        print("No matching jobs.")
        return

    print(f"Processing {len(jobs)} bottles with birefnet-general + alpha matting...")
    session = new_session("birefnet-general")

    # Process each unique source once, paste result to all matching slugs
    processed_sources = {}
    for i, (out_slug, src_key) in enumerate(jobs, 1):
        try:
            if src_key not in processed_sources:
                processed_sources[src_key] = process(src_key, src_key, session)
            canvas = processed_sources[src_key]
            out_path = SRC / f"{out_slug}.jpg"
            canvas.save(out_path, "JPEG", quality=90, optimize=True)
            print(f"  ✓ [{i}/{len(jobs)}] {out_slug}")
        except Exception as e:
            print(f"  ✗ [{i}/{len(jobs)}] {out_slug}: {e}")

    print("\n✅ Done.")


if __name__ == "__main__":
    main()
