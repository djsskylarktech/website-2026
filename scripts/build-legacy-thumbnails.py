"""Build small gallery previews from the committed full-size archive media.

Run after build-legacy-media.py, or whenever a public/legacy photo changes.
Deployment uses the generated files and JSON; it does not need Python.
"""

from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
MANIFEST = ROOT / "components" / "elevate" / "legacy-media.json"


def variant(source: Path, suffix: str, max_edge: int, quality: int) -> Path:
    target = source.with_name(f"{source.stem}-{suffix}.webp")
    with Image.open(source) as original:
        image = ImageOps.exif_transpose(original).convert("RGB")
        image.thumbnail((max_edge, max_edge), Image.Resampling.LANCZOS)
        image.save(target, "WEBP", quality=quality, method=5)
    return target


def main() -> None:
    seasons = json.loads(MANIFEST.read_text(encoding="utf-8"))
    made: dict[str, tuple[str, str]] = {}

    for season in seasons:
        for item in season["media"]:
            source_url = item["poster"] if item["type"] == "video" else item["src"]
            if source_url not in made:
                source = (PUBLIC / source_url.lstrip("/")).resolve()
                if not source.is_relative_to(PUBLIC) or not source.is_file():
                    raise FileNotFoundError(source_url)
                thumb = variant(source, "thumb", 480, 68)
                preview = variant(source, "preview", 960, 72)
                made[source_url] = (f"/{thumb.relative_to(PUBLIC).as_posix()}", f"/{preview.relative_to(PUBLIC).as_posix()}")
            item["thumb"], item["preview"] = made[source_url]

    MANIFEST.write_text(json.dumps(seasons, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Built thumbnail and preview pairs for {len(made)} archive images")


if __name__ == "__main__":
    main()
