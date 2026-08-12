#!/usr/bin/env python3
import argparse
import os
import sys
from PIL import Image, ImageDraw, ImageFont

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOADS_DIR = os.path.join(BASE_DIR, "public", "uploads")


def get_font(size: int):
    font_paths = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "/usr/share/fonts/truetype/ubuntu/Ubuntu-B.ttf",
        "/usr/share/fonts/truetype/noto/NotoSans-Bold.ttf",
    ]
    for fp in font_paths:
        if os.path.exists(fp):
            try:
                return ImageFont.truetype(fp, size)
            except Exception:
                pass
    return ImageFont.load_default()


def smart_crop_and_resize(image: Image.Image, target_w=1200, target_h=630) -> Image.Image:
    if image.mode != "RGB":
        image = image.convert("RGB")

    orig_w, orig_h = image.size
    target_aspect = target_w / target_h
    orig_aspect = orig_w / orig_h

    if orig_aspect > target_aspect:
        # Wider than target -> crop width
        crop_w = int(round(orig_h * target_aspect))
        left = (orig_w - crop_w) // 2
        crop_box = (left, 0, left + crop_w, orig_h)
    else:
        # Taller than target -> crop height
        crop_h = int(round(orig_w / target_aspect))
        top = (orig_h - crop_h) // 2
        crop_box = (0, top, orig_w, top + crop_h)

    cropped = image.crop(crop_box)
    return cropped.resize((target_w, target_h), Image.Resampling.LANCZOS)


def add_play_overlay(canvas: Image.Image) -> None:
    overlay = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    cx, cy = 600, 315
    r = 75

    # Semi-transparent dark circle
    draw.ellipse(
        [cx - r, cy - r, cx + r, cy + r],
        fill=(15, 23, 42, 175),
        outline=(255, 255, 255, 50),
        width=2,
    )

    # Crisp white play triangle icon
    tri_left = cx - 18
    tri_right = cx + 30
    tri_top = cy - 30
    tri_bottom = cy + 30
    draw.polygon(
        [(tri_left, tri_top), (tri_left, tri_bottom), (tri_right, cy)],
        fill=(255, 255, 255, 255),
    )

    canvas.alpha_composite(overlay)


def add_shop_now_overlay(canvas: Image.Image) -> None:
    overlay = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    font = get_font(28)
    text = "SHOP NOW 🛒"

    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]

    pad_x, pad_y = 28, 14
    badge_w = tw + pad_x * 2
    badge_h = th + pad_y * 2

    margin_right, margin_bottom = 40, 40
    x1 = 1200 - margin_right - badge_w
    y1 = 630 - margin_bottom - badge_h
    x2 = x1 + badge_w
    y2 = y1 + badge_h

    # Drop shadow
    shadow_offset = 4
    draw.rounded_rectangle(
        [x1 + shadow_offset, y1 + shadow_offset, x2 + shadow_offset, y2 + shadow_offset],
        radius=14,
        fill=(0, 0, 0, 80),
    )

    # Vibrant blue badge background (#2563EB)
    draw.rounded_rectangle(
        [x1, y1, x2, y2],
        radius=14,
        fill=(37, 99, 235, 245),
        outline=(255, 255, 255, 60),
        width=1,
    )

    tx = x1 + pad_x - bbox[0]
    ty = y1 + pad_y - bbox[1]
    draw.text((tx, ty), text, font=font, fill=(255, 255, 255, 255))

    canvas.alpha_composite(overlay)


def add_discount_overlay(canvas: Image.Image) -> None:
    # Red diagonal corner badge ("GIẢM 50%") in top-left corner
    ribbon_w, ribbon_h = 320, 52
    ribbon = Image.new("RGBA", (ribbon_w, ribbon_h), (0, 0, 0, 0))
    r_draw = ImageDraw.Draw(ribbon)

    # Red background
    r_draw.rectangle([0, 0, ribbon_w, ribbon_h], fill=(220, 38, 38, 245))

    font = get_font(26)
    text = "GIẢM 50%"
    bbox = r_draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]

    tx = (ribbon_w - tw) // 2 - bbox[0]
    ty = (ribbon_h - th) // 2 - bbox[1]
    r_draw.text((tx, ty), text, font=font, fill=(255, 255, 255, 255))

    # Rotate ribbon
    rotated = ribbon.rotate(315, expand=True, resample=Image.Resampling.BICUBIC)

    canvas.alpha_composite(rotated, dest=(-65, -65))


def process_image(input_path: str, output_path: str, cta_type: str = "none") -> None:
    os.makedirs(UPLOADS_DIR, exist_ok=True)
    out_dir = os.path.dirname(os.path.abspath(output_path))
    if out_dir:
        os.makedirs(out_dir, exist_ok=True)

    if not os.path.exists(input_path):
        raise FileNotFoundError(f"Input image not found: {input_path}")

    with Image.open(input_path) as img:
        cropped = smart_crop_and_resize(img, 1200, 630)
        canvas = cropped.convert("RGBA")

        if cta_type in ("play", "play_shop"):
            add_play_overlay(canvas)

        if cta_type in ("shop_now", "play_shop"):
            add_shop_now_overlay(canvas)

        if cta_type == "discount_50":
            add_discount_overlay(canvas)

        final_rgb = canvas.convert("RGB")
        final_rgb.save(output_path, "JPEG", quality=92)


def main():
    parser = argparse.ArgumentParser(description="PicLink Ads Image Processor")
    parser.add_argument("input_path", help="Path to input image")
    parser.add_argument("output_path", help="Path to output image")
    parser.add_argument(
        "cta_type",
        nargs="?",
        default="none",
        choices=["none", "play", "shop_now", "discount_50", "play_shop"],
        help="CTA overlay type",
    )

    args = parser.parse_args()
    process_image(args.input_path, args.output_path, args.cta_type)


if __name__ == "__main__":
    main()
