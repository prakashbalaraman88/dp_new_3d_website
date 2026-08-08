from __future__ import annotations

import argparse
import hashlib
import shutil
import subprocess
from pathlib import Path

from PIL import Image, ImageOps
from pypdf import PdfReader
from reportlab.lib.colors import Color, HexColor
from reportlab.lib.pagesizes import A4, landscape
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas


WORKSPACE = Path(r"D:\Antigravity\dp-website-main-BACKUP-20260401")
PROJECT_ROOT = WORKSPACE / "Projects"
LOGO = WORKSPACE / "public" / "assets" / "images" / "dezignpool-split-ribbon.png"
TEMP_ROOT = WORKSPACE / "tmp" / "pdfs" / "portfolio-assets"
RENDER_ROOT = WORKSPACE / "tmp" / "pdfs" / "portfolio-final"
OUTPUT = WORKSPACE / "output" / "pdf" / "DezignPool_Selected_Residences_2026.pdf"
PUBLIC_OUTPUT = WORKSPACE / "public" / "documents" / "dezignpool-selected-residences-2026.pdf"

PAGE_W, PAGE_H = landscape(A4)

INK = HexColor("#211D1B")
CHARCOAL = HexColor("#0D0D0E")
CREAM = HexColor("#F2ECE2")
PAPER = HexColor("#E8DED1")
LIGHT = HexColor("#FAF7F1")
GOLD = HexColor("#B79A65")
GOLD_DARK = HexColor("#8F7449")
MIST = HexColor("#D5C9BA")

FONT_SERIF = "DPBodoni"
FONT_SERIF_ITALIC = "DPBodoniItalic"
FONT_SANS = "DPGillSans"
FONT_SANS_BOLD = "DPGillSansBold"

CRITICAL_MIN_SIZE = 8.5
CTA_MIN_SIZE = 9.5
DECORATIVE_TEXT_EXEMPTIONS = (
    "page footer",
    "page folio",
    "project number",
    "orbit annotation",
)
TEXT_AUDIT: list[dict[str, object]] = []


def register_fonts() -> None:
    pdfmetrics.registerFont(TTFont(FONT_SERIF, r"C:\Windows\Fonts\BOD_R.TTF"))
    pdfmetrics.registerFont(TTFont(FONT_SERIF_ITALIC, r"C:\Windows\Fonts\BOD_I.TTF"))
    pdfmetrics.registerFont(TTFont(FONT_SANS, r"C:\Windows\Fonts\GIL_____.TTF"))
    pdfmetrics.registerFont(TTFont(FONT_SANS_BOLD, r"C:\Windows\Fonts\GILB____.TTF"))


def file(folder: str, stem: str) -> Path:
    base = PROJECT_ROOT / folder
    for extension in (".jpeg", ".jpg", ".png"):
        candidate = base / f"{stem}{extension}"
        if candidate.exists():
            return candidate
    raise FileNotFoundError(f"Missing project image: {folder}/{stem}")


PROJECTS = [
    {
        "number": "01",
        "title": "After the Rain",
        "community": "Total Environment",
        "category": "Warm modern residence",
        "signature": "TIMBER / PATTERN / AMBER LIGHT",
        "notes": ["WARM TIMBER", "LAYERED LIGHT", "PATTERNED SURFACES"],
        "layout_signature": "layered-threshold-sequence",
        "gallery_kicker": "01 / THRESHOLD TO GARDEN",
        "gallery_heading": "Rooms that open gently into one another.",
        "detail_kicker": "01 / WARMTH IN THE DETAILS",
        "detail_heading": "Timber, pattern and a measured glow.",
        "gallery_labels": ["Indoor courtyard", "Garden bedroom", "Family lounge"],
        "detail_labels": ["Galley kitchen", "TV lounge", "Dressing niche", "Vanity", "Pooja niche"],
        "folder": "Total Environment - After the Rain",
        "images": [
            "after-the-rain-formal-living-room",
            "after-the-rain-indoor-courtyard",
            "after-the-rain-garden-bedroom",
            "after-the-rain-family-lounge",
            "after-the-rain-galley-kitchen",
            "after-the-rain-tv-lounge",
            "after-the-rain-dressing-niche",
            "after-the-rain-vanity-console",
            "after-the-rain-pooja-niche",
        ],
        "focus": [(0.52, 0.5), (0.5, 0.5), (0.58, 0.48), (0.52, 0.5), (0.5, 0.5), (0.5, 0.5), (0.54, 0.5), (0.5, 0.5), (0.5, 0.42)],
    },
    {
        "number": "02",
        "title": "Century Ethos",
        "community": "Century Ethos",
        "category": "Contemporary monochrome",
        "signature": "CONTRAST / WALNUT / WARM LIGHT",
        "notes": ["GRAPHIC CONTRAST", "TAILORED PANELLING", "WALNUT ACCENTS"],
        "layout_signature": "graphic-social-grid",
        "gallery_kicker": "02 / SOCIAL SPACES",
        "gallery_heading": "Contrast gives the rooms their rhythm.",
        "detail_kicker": "02 / QUIET GEOMETRY",
        "detail_heading": "Clean lines, softened at the edges.",
        "gallery_labels": ["Kitchen", "Dining room", "Charcoal bedroom"],
        "detail_labels": ["Staircase", "Neutral bedroom"],
        "folder": "Century Ethos",
        "images": [
            "century-ethos-living-room",
            "century-ethos-kitchen",
            "century-ethos-dining-room",
            "century-ethos-charcoal-bedroom",
            "century-ethos-staircase",
            "century-ethos-neutral-bedroom",
        ],
        "focus": [(0.5, 0.5), (0.46, 0.52), (0.52, 0.5), (0.5, 0.48), (0.45, 0.5), (0.55, 0.5)],
    },
    {
        "number": "03",
        "title": "Kolte Patil",
        "community": "Kolte Patil",
        "category": "Soft tailored living",
        "signature": "STORAGE / NAVY JOINERY / CALM",
        "notes": ["PURPOSE-BUILT STORAGE", "SOFT NEUTRALS", "NAVY JOINERY"],
        "layout_signature": "staggered-joinery-study",
        "gallery_kicker": "03 / MADE FOR DAILY LIFE",
        "gallery_heading": "Useful spaces, resolved with quiet precision.",
        "detail_kicker": "03 / A SOFTER PAUSE",
        "detail_heading": "Bedrooms composed for calm.",
        "gallery_labels": ["Home office", "Kitchen", "Bedroom storage"],
        "detail_labels": ["Panelled bedroom", "Mirrored bedroom"],
        "folder": "Kolte Patil",
        "images": [
            "kolte-patil-living-room",
            "kolte-patil-home-office",
            "kolte-patil-kitchen",
            "kolte-patil-bedroom-wardrobe",
            "kolte-patil-panelled-bedroom",
            "kolte-patil-mirrored-bedroom",
        ],
        "focus": [(0.5, 0.5), (0.5, 0.48), (0.5, 0.52), (0.52, 0.5), (0.5, 0.48), (0.52, 0.5)],
    },
    {
        "number": "04",
        "title": "Prestige Lakeridge",
        "community": "Prestige Lakeridge",
        "category": "Quietly personal residence",
        "signature": "NEUTRALS / PERSONAL ROOMS / DISPLAY LIGHT",
        "notes": ["PERSONALISED ROOMS", "WARM NEUTRALS", "DISPLAY LIGHTING"],
        "layout_signature": "family-room-triptych",
        "gallery_kicker": "04 / A ROOM FOR EACH RITUAL",
        "gallery_heading": "One home, with a character for every room.",
        "detail_kicker": "04 / ARRIVAL AND RITUAL",
        "detail_heading": "A quieter welcome, shaped by light.",
        "gallery_labels": ["Kitchen", "Kids' bedroom", "Primary bedroom"],
        "detail_labels": ["Entry console", "Pooja alcove"],
        "folder": "Prestige Lakeridge",
        "images": [
            "prestige-lakeridge-living-room",
            "prestige-lakeridge-kitchen",
            "prestige-lakeridge-kids-bedroom",
            "prestige-lakeridge-primary-bedroom",
            "prestige-lakeridge-entry-console",
            "prestige-lakeridge-pooja-alcove",
        ],
        "focus": [(0.5, 0.5), (0.48, 0.5), (0.54, 0.5), (0.55, 0.5), (0.45, 0.5), (0.58, 0.46)],
    },
]

for project in PROJECTS:
    project["paths"] = [file(project["folder"], stem) for stem in project["images"]]
    if len(project["paths"]) != len(project["focus"]):
        raise ValueError(f"Focus map mismatch for {project['title']}")


def focus_for(project: dict, index: int) -> tuple[float, float]:
    return project["focus"][index]


def set_alpha(c: canvas.Canvas, fill: float | None = None, stroke: float | None = None) -> None:
    if fill is not None and hasattr(c, "setFillAlpha"):
        c.setFillAlpha(fill)
    if stroke is not None and hasattr(c, "setStrokeAlpha"):
        c.setStrokeAlpha(stroke)


def tracked_text(
    c: canvas.Canvas,
    text: str,
    x: float,
    y: float,
    font: str = FONT_SANS,
    size: float = 8,
    color=INK,
    tracking: float = 1.6,
) -> float:
    c.setFont(font, size)
    c.setFillColor(color)
    cursor = x
    for char in text:
        c.drawString(cursor, y, char)
        cursor += pdfmetrics.stringWidth(char, font, size) + tracking
    return cursor


def audited_tracked_text(
    c: canvas.Canvas,
    label: str,
    text: str,
    x: float,
    y: float,
    *,
    role: str = "critical",
    font: str = FONT_SANS,
    size: float = CRITICAL_MIN_SIZE,
    color=INK,
    tracking: float = 1.1,
) -> float:
    TEXT_AUDIT.append({"label": label, "role": role, "size": size})
    return tracked_text(c, text, x, y, font=font, size=size, color=color, tracking=tracking)


def audited_plain_text(
    c: canvas.Canvas,
    label: str,
    text: str,
    x: float,
    y: float,
    *,
    role: str = "critical",
    font: str = FONT_SANS,
    size: float = CRITICAL_MIN_SIZE,
    color=INK,
) -> None:
    TEXT_AUDIT.append({"label": label, "role": role, "size": size})
    c.setFont(font, size)
    c.setFillColor(color)
    c.drawString(x, y, text)


def fitted_size(text: str, font: str, max_size: float, max_width: float, min_size: float = 18) -> float:
    size = max_size
    while size > min_size and pdfmetrics.stringWidth(text, font, size) > max_width:
        size -= 0.5
    return size


def processed_cover(path: Path, width_pt: float, height_pt: float, focus=(0.5, 0.5)) -> Path:
    scale = 2.15
    width_px = max(4, int(round(width_pt * scale)))
    height_px = max(4, int(round(height_pt * scale)))
    key = f"{path.resolve()}|{path.stat().st_mtime_ns}|{width_px}|{height_px}|{focus}".encode()
    digest = hashlib.sha1(key).hexdigest()[:18]
    output = TEMP_ROOT / f"crop-{digest}.jpg"
    if output.exists():
        return output

    with Image.open(path) as source:
        image = ImageOps.exif_transpose(source).convert("RGB")
        src_ratio = image.width / image.height
        target_ratio = width_px / height_px
        if src_ratio > target_ratio:
            crop_width = int(round(image.height * target_ratio))
            max_left = image.width - crop_width
            left = int(round(max_left * focus[0]))
            box = (left, 0, left + crop_width, image.height)
        else:
            crop_height = int(round(image.width / target_ratio))
            max_top = image.height - crop_height
            top = int(round(max_top * focus[1]))
            box = (0, top, image.width, top + crop_height)
        image = image.crop(box).resize((width_px, height_px), Image.Resampling.LANCZOS)
        output.parent.mkdir(parents=True, exist_ok=True)
        image.save(output, "JPEG", quality=88, optimize=True, progressive=True)
    return output


def draw_cover_image(c: canvas.Canvas, path: Path, x: float, y: float, w: float, h: float, focus=(0.5, 0.5)) -> None:
    prepared = processed_cover(path, w, h, focus)
    c.drawImage(str(prepared), x, y, w, h, preserveAspectRatio=False, mask=None)


def draw_logo(c: canvas.Canvas, x: float, y: float, size: float, alpha: float = 1.0) -> None:
    c.saveState()
    set_alpha(c, fill=alpha)
    c.drawImage(str(LOGO), x, y, size, size, preserveAspectRatio=True, mask="auto")
    c.restoreState()


def draw_orbit(c: canvas.Canvas, x: float, y: float, radius: float, color=GOLD, alpha: float = 0.4) -> None:
    c.saveState()
    c.setStrokeColor(color)
    c.setLineWidth(0.7)
    set_alpha(c, stroke=alpha)
    c.circle(x, y, radius, stroke=1, fill=0)
    c.circle(x, y, radius * 0.58, stroke=1, fill=0)
    c.line(x - radius * 1.2, y, x + radius * 1.2, y)
    c.line(x, y - radius * 1.2, x, y + radius * 1.2)
    c.setFillColor(color)
    set_alpha(c, fill=min(1, alpha * 2.2))
    c.circle(x + radius * 0.72, y + radius * 0.69, 3.1, stroke=0, fill=1)
    c.restoreState()


def palette_for(paths: list[Path], count: int = 5) -> list[tuple[int, int, int]]:
    swatches: list[tuple[int, int, int]] = []
    for path in paths[:3]:
        with Image.open(path) as source:
            image = ImageOps.exif_transpose(source).convert("RGB")
            image.thumbnail((220, 220))
            quantized = image.quantize(colors=8, method=Image.Quantize.MEDIANCUT)
            palette = quantized.getpalette() or []
            counts = sorted(quantized.getcolors() or [], reverse=True)
            for _, index in counts:
                rgb = tuple(palette[index * 3:index * 3 + 3])
                if len(rgb) != 3:
                    continue
                if max(rgb) < 30 or min(rgb) > 242:
                    continue
                if all(sum((rgb[i] - existing[i]) ** 2 for i in range(3)) > 38 ** 2 for existing in swatches):
                    swatches.append(rgb)
    if len(swatches) < count:
        fallbacks = [(183, 154, 101), (242, 236, 226), (103, 88, 73), (58, 54, 50), (211, 198, 179)]
        swatches.extend(color for color in fallbacks if color not in swatches)
    return sorted(swatches[:count], key=lambda rgb: sum(rgb))


def draw_palette(c: canvas.Canvas, colors: list[tuple[int, int, int]], x: float, y: float, radius: float = 8, gap: float = 7, label: str = "palette") -> None:
    audited_tracked_text(c, f"{label} label", "MATERIAL PALETTE", x, y + 22, size=8.5, color=GOLD_DARK, tracking=1.0)
    for index, rgb in enumerate(colors):
        c.setFillColor(Color(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255))
        c.circle(x + radius + index * (radius * 2 + gap), y, radius, stroke=0, fill=1)


def page_footer(c: canvas.Canvas, page: int, label: str, light: bool = False) -> None:
    color = LIGHT if light else INK
    c.saveState()
    set_alpha(c, fill=0.58, stroke=0.35)
    c.setStrokeColor(color)
    c.setLineWidth(0.35)
    c.line(36, 24, PAGE_W - 36, 24)
    tracked_text(c, "DEZIGNPOOL / SELECTED RESIDENCES", 36, 10, size=5.5, color=color, tracking=1.05)
    c.setFont(FONT_SANS, 6.2)
    c.setFillColor(color)
    c.drawCentredString(PAGE_W / 2, 10, label.upper())
    c.drawRightString(PAGE_W - 36, 10, f"{page:02d}")
    c.restoreState()


def cover_page(c: canvas.Canvas) -> None:
    c.setFillColor(CREAM)
    c.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)
    image_x = 314
    draw_cover_image(c, PROJECTS[0]["paths"][0], image_x, 0, PAGE_W - image_x, PAGE_H, focus=(0.54, 0.5))
    c.saveState()
    c.setFillColor(CHARCOAL)
    set_alpha(c, fill=0.18)
    c.rect(image_x, 0, PAGE_W - image_x, PAGE_H, stroke=0, fill=1)
    c.restoreState()

    draw_logo(c, 42, PAGE_H - 94, 48)
    audited_tracked_text(c, "cover brand", "DEZIGNPOOL", 103, PAGE_H - 67, size=9.5, color=INK, tracking=1.8)
    audited_tracked_text(c, "cover city", "BANGALORE", 103, PAGE_H - 84, size=8.5, color=GOLD_DARK, tracking=1.35)

    audited_tracked_text(c, "cover edition", "PORTFOLIO / 2026", 42, 330, size=8.5, color=GOLD_DARK, tracking=1.6)
    c.setFillColor(INK)
    c.setFont(FONT_SERIF, 42)
    c.drawString(42, 266, "Selected")
    c.setFont(FONT_SERIF_ITALIC, 43)
    c.setFillColor(GOLD_DARK)
    c.drawString(42, 216, "residences.")
    c.setStrokeColor(GOLD)
    c.setLineWidth(1)
    c.line(42, 188, 262, 188)
    audited_tracked_text(c, "cover promise", "REAL HOMES / REAL DETAIL", 42, 164, size=8.5, color=INK, tracking=1.05)

    draw_orbit(c, 735, 118, 72, color=LIGHT, alpha=0.45)
    c.saveState()
    c.setFillColor(CHARCOAL)
    set_alpha(c, fill=0.72)
    c.rect(image_x, 0, PAGE_W - image_x, 50, stroke=0, fill=1)
    c.restoreState()
    audited_tracked_text(c, "cover disciplines", "INTERIORS / ARCHITECTURE / EVERYDAY RITUALS", image_x + 26, 18, size=8.5, color=LIGHT, tracking=1.05)
    c.showPage()


def index_page(c: canvas.Canvas, page: int) -> None:
    c.setFillColor(PAPER)
    c.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)
    draw_logo(c, PAGE_W - 88, PAGE_H - 92, 48, alpha=0.9)
    audited_tracked_text(c, "collection label", "THE COLLECTION", 36, PAGE_H - 48, size=8.5, color=GOLD_DARK, tracking=1.6)
    c.setFillColor(INK)
    c.setFont(FONT_SERIF, 31)
    c.drawString(36, PAGE_H - 97, "Four homes, one point of view.")
    c.setFont(FONT_SERIF_ITALIC, 17)
    c.setFillColor(GOLD_DARK)
    c.drawString(38, PAGE_H - 124, "Light, material and the rituals of living.")

    start_x = 36
    gap = 12
    card_w = (PAGE_W - 72 - gap * 3) / 4
    card_y = 80
    card_h = 300
    for index, project in enumerate(PROJECTS):
        x = start_x + index * (card_w + gap)
        draw_cover_image(c, project["paths"][0], x, card_y, card_w, card_h, focus=focus_for(project, 0))
        c.saveState()
        c.setFillColor(CHARCOAL)
        set_alpha(c, fill=0.55)
        c.rect(x, card_y, card_w, 60, stroke=0, fill=1)
        c.restoreState()
        tracked_text(c, project["number"], x + 12, card_y + 40, size=6.5, color=GOLD, tracking=1.0)
        size = fitted_size(project["title"], FONT_SERIF, 16, card_w - 24, 11)
        c.setFont(FONT_SERIF, size)
        c.setFillColor(LIGHT)
        c.drawString(x + 12, card_y + 18, project["title"])

    c.setStrokeColor(GOLD)
    c.setLineWidth(0.6)
    timeline_y = 54
    c.line(36, timeline_y, PAGE_W - 36, timeline_y)
    for index in range(4):
        x = 36 + index * ((PAGE_W - 72) / 3)
        c.setFillColor(GOLD)
        c.circle(x, timeline_y, 3, stroke=0, fill=1)
    page_footer(c, page, "Collection index")
    c.showPage()


def chapter_opener(c: canvas.Canvas, project: dict, page: int, reverse: bool) -> None:
    panel_w = 304
    image_w = PAGE_W - panel_w
    if reverse:
        draw_cover_image(c, project["paths"][0], 0, 0, image_w, PAGE_H, focus=focus_for(project, 0))
        c.setFillColor(CHARCOAL)
        c.rect(image_w, 0, panel_w, PAGE_H, stroke=0, fill=1)
        panel_x = image_w
        text_color = LIGHT
        muted_color = MIST
        logo_x = panel_x + 36
    else:
        c.setFillColor(CREAM)
        c.rect(0, 0, panel_w, PAGE_H, stroke=0, fill=1)
        draw_cover_image(c, project["paths"][0], panel_w, 0, image_w, PAGE_H, focus=focus_for(project, 0))
        panel_x = 0
        text_color = INK
        muted_color = GOLD_DARK
        logo_x = 36

    draw_logo(c, logo_x, PAGE_H - 82, 38, alpha=0.95)
    c.saveState()
    c.setFillColor(GOLD)
    set_alpha(c, fill=0.16)
    c.setFont(FONT_SERIF, 112)
    c.drawString(panel_x + 30, 350, project["number"])
    c.restoreState()

    audited_tracked_text(c, f"{project['title']} category", project["category"].upper(), panel_x + 36, 319, size=8.5, color=muted_color, tracking=1.05)
    title_size = fitted_size(project["title"], FONT_SERIF, 35, panel_w - 72, 23)
    c.setFont(FONT_SERIF, title_size)
    c.setFillColor(text_color)
    title_words = project["title"].split()
    if pdfmetrics.stringWidth(project["title"], FONT_SERIF, title_size) <= panel_w - 72:
        c.drawString(panel_x + 36, 267, project["title"])
        title_bottom = 267
    else:
        split = max(1, len(title_words) // 2)
        c.drawString(panel_x + 36, 278, " ".join(title_words[:split]))
        c.drawString(panel_x + 36, 239, " ".join(title_words[split:]))
        title_bottom = 239

    if project["community"] != project["title"]:
        c.setFont(FONT_SERIF_ITALIC, 14)
        c.setFillColor(GOLD)
        c.drawString(panel_x + 37, title_bottom - 27, project["community"])

    c.setStrokeColor(GOLD)
    c.setLineWidth(0.8)
    c.line(panel_x + 36, 160, panel_x + panel_w - 36, 160)
    audited_tracked_text(c, f"{project['title']} signature", project["signature"], panel_x + 36, 136, size=8.5, color=muted_color, tracking=0.55)
    audited_tracked_text(c, f"{project['title']} photo count", f"{len(project['paths']):02d} PHOTOGRAPHS", panel_x + 36, 108, size=8.5, color=muted_color, tracking=0.85)

    draw_orbit(c, panel_x + panel_w - 55, 74, 24, color=GOLD, alpha=0.45)
    page_footer(c, page, project["title"], light=reverse)
    c.showPage()


def draw_spread_header(c: canvas.Canvas, project: dict, *, detail: bool = False) -> None:
    kicker_key = "detail_kicker" if detail else "gallery_kicker"
    heading_key = "detail_heading" if detail else "gallery_heading"
    dark = detail
    kicker_color = GOLD if dark else GOLD_DARK
    heading_color = LIGHT if dark else INK
    audited_tracked_text(
        c,
        f"{project['title']} {'detail' if detail else 'gallery'} kicker",
        project[kicker_key],
        36,
        PAGE_H - 38,
        size=8.5,
        color=kicker_color,
        tracking=1.05,
    )
    heading_size = fitted_size(project[heading_key], FONT_SERIF_ITALIC, 25, 545, 19)
    audited_plain_text(
        c,
        f"{project['title']} {'detail' if detail else 'gallery'} heading",
        project[heading_key],
        36,
        PAGE_H - 75,
        font=FONT_SERIF_ITALIC,
        size=heading_size,
        color=heading_color,
    )
    c.setStrokeColor(GOLD)
    c.setLineWidth(0.7)
    c.line(36, PAGE_H - 91, PAGE_W - 36, PAGE_H - 91)


def draw_image_panel(
    c: canvas.Canvas,
    project: dict,
    image_index: int,
    label: str,
    x: float,
    y: float,
    w: float,
    h: float,
) -> None:
    draw_cover_image(c, project["paths"][image_index], x, y, w, h, focus=focus_for(project, image_index))
    c.saveState()
    c.setFillColor(CHARCOAL)
    set_alpha(c, fill=0.62)
    c.rect(x, y, w, 27, stroke=0, fill=1)
    c.restoreState()
    audited_tracked_text(
        c,
        f"{project['title']} image label {image_index}",
        label.upper(),
        x + 10,
        y + 9,
        size=8.5,
        color=LIGHT,
        tracking=0.65,
    )


def gallery_plate(c: canvas.Canvas, project: dict, page: int) -> None:
    c.setFillColor(CREAM)
    c.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)
    draw_spread_header(c, project)
    draw_palette(
        c,
        palette_for(project["paths"]),
        PAGE_W - 204,
        PAGE_H - 62,
        radius=7.5,
        gap=5,
        label=project["title"],
    )

    labels = project["gallery_labels"]
    number = project["number"]
    if number == "01":
        draw_image_panel(c, project, 1, labels[0], 36, 72, 258, 404)
        draw_image_panel(c, project, 2, labels[1], 310, 284, 495, 192)
        draw_image_panel(c, project, 3, labels[2], 310, 72, 495, 196)
    elif number == "02":
        draw_image_panel(c, project, 2, labels[1], 36, 286, 769, 190)
        draw_image_panel(c, project, 1, labels[0], 36, 72, 300, 198)
        draw_image_panel(c, project, 3, labels[2], 352, 72, 453, 198)
    elif number == "03":
        draw_image_panel(c, project, 1, labels[0], 36, 124, 232, 352)
        draw_image_panel(c, project, 2, labels[1], 284, 72, 270, 360)
        draw_image_panel(c, project, 3, labels[2], 570, 150, 235, 326)
    else:
        gap = 12
        width = (PAGE_W - 72 - gap * 2) / 3
        for index, label in enumerate(labels):
            draw_image_panel(c, project, index + 1, label, 36 + index * (width + gap), 72, width, 404)

    page_footer(c, page, project["layout_signature"])
    c.showPage()


def finale_plate(c: canvas.Canvas, project: dict, page: int) -> None:
    c.setFillColor(CHARCOAL)
    c.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)
    draw_spread_header(c, project, detail=True)

    labels = project["detail_labels"]
    number = project["number"]
    if number == "01":
        gap = 9
        widths = [146, 146, 145, 146, 150]
        x = 36
        for offset, (width, label) in enumerate(zip(widths, labels)):
            draw_image_panel(c, project, offset + 4, label, x, 88, width, 372)
            x += width + gap
    elif number == "02":
        draw_image_panel(c, project, 4, labels[0], 36, 88, 304, 372)
        draw_image_panel(c, project, 5, labels[1], 356, 88, 449, 372)
    elif number == "03":
        draw_image_panel(c, project, 4, labels[0], 36, 88, 376, 372)
        draw_image_panel(c, project, 5, labels[1], 428, 88, 377, 372)
    else:
        draw_image_panel(c, project, 4, labels[0], 36, 88, 328, 372)
        draw_image_panel(c, project, 5, labels[1], 380, 88, 425, 372)

    notes = "   /   ".join(project["notes"])
    audited_tracked_text(
        c,
        f"{project['title']} material notes",
        notes,
        36,
        58,
        size=8.5,
        color=MIST,
        tracking=0.45,
    )
    page_footer(c, page, project["detail_heading"], light=True)
    c.showPage()


def closing_page(c: canvas.Canvas, page: int) -> None:
    c.setFillColor(CHARCOAL)
    c.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)
    strip_y = PAGE_H - 152
    strip_h = 118
    gap = 8
    card_w = (PAGE_W - 72 - gap * 3) / 4
    for index, project in enumerate(PROJECTS):
        x = 36 + index * (card_w + gap)
        draw_cover_image(c, project["paths"][0], x, strip_y, card_w, strip_h, focus=focus_for(project, 0))

    draw_logo(c, 60, 234, 82)
    audited_tracked_text(c, "closing brand", "DEZIGNPOOL / BANGALORE", 60, 204, size=8.5, color=GOLD, tracking=1.1)

    c.setFillColor(LIGHT)
    c.setFont(FONT_SERIF, 38)
    c.drawString(220, 291, "Let's make room for")
    c.setFont(FONT_SERIF_ITALIC, 40)
    c.setFillColor(GOLD)
    c.drawString(220, 245, "something unforgettable.")
    c.setStrokeColor(GOLD)
    c.setLineWidth(0.8)
    c.line(220, 216, PAGE_W - 56, 216)

    contact_x = 220
    audited_tracked_text(c, "closing address", "GOODU, NO 1, GREENVALLEY / MYLASANDRA / BANGALORE 560100", contact_x, 177, size=9.5, color=MIST, tracking=0.45)
    audited_tracked_text(c, "closing phone", "+91 78924 34663", contact_x, 147, role="cta", size=10.5, color=LIGHT, tracking=0.8)
    audited_tracked_text(c, "closing email", "INFO@DEZIGNPOOL.COM", contact_x + 190, 147, role="cta", size=10.5, color=LIGHT, tracking=0.75)
    c.setStrokeColor(GOLD)
    c.setLineWidth(0.8)
    c.roundRect(contact_x, 102, 220, 31, 15.5, stroke=1, fill=0)
    audited_tracked_text(c, "closing website", "VISIT DEZIGNPOOL.COM", contact_x + 18, 112, role="cta", size=10.5, color=GOLD, tracking=0.85)
    c.linkURL("https://www.dezignpool.com/", (contact_x, 102, contact_x + 220, 133), relative=0)

    draw_orbit(c, PAGE_W - 83, 92, 42, color=GOLD, alpha=0.5)
    page_footer(c, page, "DezignPool", light=True)
    c.showPage()


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def find_pdftoppm() -> Path:
    discovered = shutil.which("pdftoppm")
    if discovered:
        candidate = Path(discovered)
        if candidate.suffix.lower() == ".exe":
            return candidate
    bundled = (
        Path.home()
        / ".cache"
        / "codex-runtimes"
        / "codex-primary-runtime"
        / "dependencies"
        / "native"
        / "poppler"
        / "Library"
        / "bin"
        / "pdftoppm.exe"
    )
    if bundled.exists():
        return bundled
    raise FileNotFoundError("pdftoppm was not found; Poppler is required for --verify")


def verify_design_contract() -> None:
    critical = [entry for entry in TEXT_AUDIT if entry["role"] == "critical"]
    cta = [entry for entry in TEXT_AUDIT if entry["role"] == "cta"]
    if not critical or not cta:
        raise AssertionError("Text audit did not capture both critical and CTA declarations")
    undersized_critical = [entry for entry in critical if float(entry["size"]) < CRITICAL_MIN_SIZE]
    undersized_cta = [entry for entry in cta if float(entry["size"]) < CTA_MIN_SIZE]
    if undersized_critical:
        raise AssertionError(f"Critical text below {CRITICAL_MIN_SIZE} pt: {undersized_critical}")
    if undersized_cta:
        raise AssertionError(f"CTA text below {CTA_MIN_SIZE} pt: {undersized_cta}")

    headings = [project["gallery_heading"] for project in PROJECTS] + [project["detail_heading"] for project in PROJECTS]
    if len(set(headings)) != len(headings):
        raise AssertionError("Project editorial headings must be pairwise distinct")
    signatures = [project["layout_signature"] for project in PROJECTS]
    if len(set(signatures)) != len(PROJECTS):
        raise AssertionError("Each project must declare a distinct spread-layout signature")


def render_for_verification() -> list[Path]:
    resolved_render = RENDER_ROOT.resolve()
    resolved_workspace = WORKSPACE.resolve()
    if not resolved_render.is_relative_to(resolved_workspace):
        raise AssertionError(f"Unsafe render directory: {resolved_render}")
    RENDER_ROOT.mkdir(parents=True, exist_ok=True)
    for existing in RENDER_ROOT.glob("page-*.png"):
        existing.unlink()
    subprocess.run(
        [str(find_pdftoppm()), "-png", "-r", "120", str(OUTPUT), str(RENDER_ROOT / "page")],
        check=True,
        capture_output=True,
        text=True,
    )
    renders = sorted(RENDER_ROOT.glob("page-*.png"))
    if len(renders) != 15:
        raise AssertionError(f"Expected 15 rendered pages, found {len(renders)}")
    empty = [path.name for path in renders if path.stat().st_size < 20_000]
    if empty:
        raise AssertionError(f"Suspiciously small rendered pages: {empty}")
    return renders


def verify() -> None:
    verify_design_contract()
    reader = PdfReader(str(OUTPUT))
    if len(reader.pages) != 15:
        raise AssertionError(f"Expected 15 PDF pages, found {len(reader.pages)}")
    for index, pdf_page in enumerate(reader.pages, start=1):
        width = float(pdf_page.mediabox.width)
        height = float(pdf_page.mediabox.height)
        if abs(width - PAGE_W) > 0.5 or abs(height - PAGE_H) > 0.5 or width <= height:
            raise AssertionError(f"Page {index} is not A4 landscape: {width} x {height}")
        contents = pdf_page.get_contents()
        if contents is None or len(contents.get_data()) < 200:
            raise AssertionError(f"Page {index} has no meaningful content stream")
    title = (reader.metadata.title or "") if reader.metadata else ""
    if title != "DezignPool - Selected Residences 2026":
        raise AssertionError(f"Unexpected PDF title metadata: {title!r}")
    if sha256(OUTPUT) != sha256(PUBLIC_OUTPUT):
        raise AssertionError("Generated and public portfolio PDFs are not byte-identical")
    renders = render_for_verification()
    print("portfolio verification: OK")
    print(f"- pages: {len(reader.pages)} A4 landscape")
    print(f"- critical text minimum: {min(float(entry['size']) for entry in TEXT_AUDIT if entry['role'] == 'critical'):.1f} pt")
    print(f"- CTA text minimum: {min(float(entry['size']) for entry in TEXT_AUDIT if entry['role'] == 'cta'):.1f} pt")
    print(f"- distinct editorial headings: {len(set([project['gallery_heading'] for project in PROJECTS] + [project['detail_heading'] for project in PROJECTS]))}")
    print(f"- distinct spread signatures: {len(set(project['layout_signature'] for project in PROJECTS))}")
    print(f"- public checksum: {sha256(PUBLIC_OUTPUT)}")
    print(f"- rendered QA pages: {len(renders)}")
    print(f"- decorative exemptions: {', '.join(DECORATIVE_TEXT_EXEMPTIONS)}")


def build(run_verification: bool = False) -> None:
    TEXT_AUDIT.clear()
    TEMP_ROOT.mkdir(parents=True, exist_ok=True)
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    PUBLIC_OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    register_fonts()

    c = canvas.Canvas(str(OUTPUT), pagesize=(PAGE_W, PAGE_H), pageCompression=1)
    c.setTitle("DezignPool - Selected Residences 2026")
    c.setAuthor("DezignPool")
    c.setSubject("Interior design and architecture portfolio")
    c.setCreator("DezignPool / Codex")

    cover_page(c)
    page = 2
    index_page(c, page)
    page += 1
    for index, project in enumerate(PROJECTS):
        chapter_opener(c, project, page, reverse=index % 2 == 1)
        page += 1
        gallery_plate(c, project, page)
        page += 1
        finale_plate(c, project, page)
        page += 1
    closing_page(c, page)
    c.save()
    shutil.copyfile(OUTPUT, PUBLIC_OUTPUT)
    print(OUTPUT)
    print(PUBLIC_OUTPUT)
    if run_verification:
        verify()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate the DezignPool Selected Residences portfolio")
    parser.add_argument("--verify", action="store_true", help="verify design contracts, PDF structure, checksums, and rendered pages")
    arguments = parser.parse_args()
    build(run_verification=arguments.verify)
