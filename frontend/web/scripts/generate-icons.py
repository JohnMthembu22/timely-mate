#!/usr/bin/env python3
"""Regenerate square favicon / PWA / Electron icons from assets/icon.png."""

from __future__ import annotations

import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Install Pillow: pip install Pillow", file=sys.stderr)
    raise SystemExit(1)

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "assets" / "icon.png"
PUBLIC = ROOT / "public"
MASTER_SIZE = 1024


def square_master(src: Image.Image) -> Image.Image:
    w, h = src.size
    if w == h:
        side = w
        cropped = src
    else:
        side = min(w, h)
        left = (w - side) // 2
        top = (h - side) // 2
        cropped = src.crop((left, top, left + side, top + side))
    if side != MASTER_SIZE:
        return cropped.resize((MASTER_SIZE, MASTER_SIZE), Image.Resampling.LANCZOS)
    return cropped


def main() -> None:
    if not SRC.exists():
        print(f"Missing source icon: {SRC}", file=sys.stderr)
        raise SystemExit(1)

    src = Image.open(SRC).convert("RGBA")
    master = square_master(src)
    master.save(SRC)

    sizes = {
        "favicon-16.png": 16,
        "favicon-32.png": 32,
        "apple-touch-icon.png": 180,
        "icon-192.png": 192,
        "icon-512.png": 512,
    }
    for name, size in sizes.items():
        master.resize((size, size), Image.Resampling.LANCZOS).save(PUBLIC / name)

    ico = [master.resize((s, s), Image.Resampling.LANCZOS) for s in (16, 32, 48)]
    ico[0].save(
        PUBLIC / "favicon.ico",
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48)],
        append_images=ico[1:],
    )
    print(f"Generated square icons ({MASTER_SIZE}x{MASTER_SIZE}) in {PUBLIC}")


if __name__ == "__main__":
    main()
