"""Prepare the supplied Past Team Photos archive for the public gallery."""

from __future__ import annotations

import json
import re
import shutil
import subprocess
import tempfile
from pathlib import Path

import cv2
from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "Past Team Photos"
DEST = ROOT / "public" / "legacy"
MANIFEST = ROOT / "components" / "elevate" / "legacy-media.json"
PHOTO_EXTS = {".jpg", ".jpeg", ".png", ".heic"}


def slug(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")[:42]


def year_label(folder: str) -> str:
    if re.fullmatch(r"\d{2}-\d{2}", folder):
        first, last = folder.split("-")
        return f"20{first}–{last}"
    return folder


def sort_year(folder: str) -> tuple[int, int]:
    if "-" in folder:
        first, last = folder.split("-")
        return (2000 + int(last), 2000 + int(first))
    year = int(folder)
    return (year, year)


def open_photo(path: Path) -> Image.Image:
    if path.suffix.lower() != ".heic":
        return Image.open(path)
    with tempfile.TemporaryDirectory(dir=ROOT) as scratch:
        converted = Path(scratch) / "photo.jpg"
        subprocess.run(["heif-convert", "--quiet", str(path), str(converted)], check=True)
        with Image.open(converted) as image:
            return image.copy()


def save_webp(image: Image.Image, output: Path) -> tuple[int, int]:
    image = ImageOps.exif_transpose(image).convert("RGB")
    image.thumbnail((1920, 1920), Image.Resampling.LANCZOS)
    output.parent.mkdir(parents=True, exist_ok=True)
    image.save(output, "WEBP", quality=80, method=5)
    return image.size


def video_poster(video: Path, output: Path) -> tuple[int, int]:
    capture = cv2.VideoCapture(str(video))
    capture.set(cv2.CAP_PROP_POS_MSEC, 500)
    success, frame = capture.read()
    capture.release()
    if not success:
        raise RuntimeError(f"Could not read a frame from {video}")
    return save_webp(Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)), output)


def video_codec(video: Path) -> str:
    capture = cv2.VideoCapture(str(video))
    code = int(capture.get(cv2.CAP_PROP_FOURCC))
    capture.release()
    return "".join(chr((code >> (8 * i)) & 255) for i in range(4)).lower()


def save_webm(video: Path, output: Path) -> None:
    capture = cv2.VideoCapture(str(video))
    fps = capture.get(cv2.CAP_PROP_FPS) or 30
    width = int(capture.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(capture.get(cv2.CAP_PROP_FRAME_HEIGHT))
    scale = min(1.0, 960 / max(width, height))
    dimensions = (max(2, int(width * scale) // 2 * 2), max(2, int(height * scale) // 2 * 2))
    writer = cv2.VideoWriter(str(output), cv2.VideoWriter_fourcc(*"VP80"), fps / 2, dimensions)
    if not writer.isOpened():
        capture.release()
        raise RuntimeError(f"Could not encode browser-compatible WebM: {video}")
    frame_index = 0
    while True:
        success, frame = capture.read()
        if not success:
            break
        if frame_index % 2 == 0:
            writer.write(cv2.resize(frame, dimensions, interpolation=cv2.INTER_AREA))
        frame_index += 1
    writer.release()
    capture.release()


def main() -> None:
    if not SOURCE.is_dir():
        raise SystemExit(f"Missing archive: {SOURCE}")

    seasons = []
    for folder in sorted((p for p in SOURCE.iterdir() if p.is_dir()), key=lambda p: sort_year(p.name), reverse=True):
        key = slug(folder.name)
        output_dir = DEST / key
        media = []
        posters = {}
        photos = sorted((p for p in folder.iterdir() if p.suffix.lower() in PHOTO_EXTS), key=lambda p: p.name.lower())
        videos = sorted((p for p in folder.iterdir() if p.suffix.lower() == ".mp4"), key=lambda p: p.name.lower())

        for index, path in enumerate(photos, 1):
            name = f"photo-{index:02d}.webp"
            output = output_dir / name
            with open_photo(path) as image:
                width, height = save_webp(image, output)
            url = f"/legacy/{key}/{name}"
            posters[path.stem.lower()] = url
            media.append({"type": "image", "src": url, "width": width, "height": height})

        for index, path in enumerate(videos, 1):
            name = f"film-{index:02d}.mp4"
            output_dir.mkdir(parents=True, exist_ok=True)
            shutil.copy2(path, output_dir / name)
            mp4_url = f"/legacy/{key}/{name}"
            video_url = mp4_url
            fallback = None
            if video_codec(path) in {"hevc", "hvc1", "hev1"}:
                webm_name = f"film-{index:02d}.webm"
                save_webm(path, output_dir / webm_name)
                video_url = f"/legacy/{key}/{webm_name}"
                fallback = mp4_url
            poster = posters.get(path.stem.lower())
            if poster is None:
                poster_name = f"film-{index:02d}-poster.webp"
                video_poster(path, output_dir / poster_name)
                poster = f"/legacy/{key}/{poster_name}"
            item = {"type": "video", "src": video_url, "poster": poster}
            if fallback:
                item["fallback"] = fallback
            media.append(item)

        if media:
            seasons.append({"folder": folder.name, "label": year_label(folder.name), "media": media})

    MANIFEST.write_text(json.dumps(seasons, indent=2) + "\n", encoding="utf-8")
    print(f"Prepared {len(seasons)} seasons, {sum(len(s['media']) for s in seasons)} items in {DEST}")


if __name__ == "__main__":
    main()
