#!/usr/bin/env python3
"""
Generates the exact GAMAT Student Share Card OpenGraph thumbnails:
- public/images/og-share-card.png (1200x630, landscape OG for Twitter/Facebook)
- public/images/og-share-card-square.png (800x800, square for WhatsApp/Telegram)
Matches the real card design 1:1:
- Red website gradient
- Student profile avatar with white ring & verified checkmark
- Student Name ("Toe Doe")
- Enrolled in: Forex Foundations (no pills)
- "Join Me at" + GAMAT Candlestick Logo + GAMAT Fx ACADEMY
- QR Code in white card
- INVITE CODE:  GMT-TOE411 (no pills)
- gamatfxacademy.com
- Watermark footer
"""

import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def create_gradient(width, height, c_top, c_mid, c_btm):
    base = Image.new("RGBA", (width, height), (0, 0, 0, 255))
    draw = ImageDraw.Draw(base)
    for y in range(height):
        t = y / max(1, height - 1)
        if t < 0.45:
            factor = t / 0.45
            r = int(c_top[0] + (c_mid[0] - c_top[0]) * factor)
            g = int(c_top[1] + (c_mid[1] - c_top[1]) * factor)
            b = int(c_top[2] + (c_mid[2] - c_top[2]) * factor)
        else:
            factor = (t - 0.45) / 0.55
            r = int(c_mid[0] + (c_btm[0] - c_mid[0]) * factor)
            g = int(c_mid[1] + (c_btm[1] - c_mid[1]) * factor)
            b = int(c_mid[2] + (c_btm[2] - c_mid[2]) * factor)
        draw.line([(0, y), (width, y)], fill=(r, g, b, 255))
    return base

def add_radial_glow(img, cx, cy, radius, color):
    glow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    steps = 40
    for i in range(steps, 0, -1):
        r = int(radius * (i / steps))
        alpha = int(color[3] * (1.0 - (i / steps)))
        glow_draw.ellipse(
            [(cx - r, cy - r), (cx + r, cy + r)],
            fill=(color[0], color[1], color[2], alpha)
        )
    return Image.alpha_composite(img, glow)

def draw_candlestick_tile(draw, x, y, size):
    # White rounded tile
    draw.rounded_rectangle([x, y, x + size, y + size], radius=size//4, fill=(255, 255, 255, 255))
    scale = size / 32.0
    c_red = (176, 42, 55, 255)
    c_sub = (176, 42, 55, 160)

    # Floor line
    draw.line([x + 4 * scale, y + 26 * scale, x + 28 * scale, y + 26 * scale], fill=(176, 42, 55, 90), width=max(1, int(1*scale)))

    # Bearish candle (left)
    draw.line([x + 8.5 * scale, y + 7 * scale, x + 8.5 * scale, y + 24 * scale], fill=c_sub, width=max(1, int(1.4*scale)))
    draw.rounded_rectangle([x + 6.2 * scale, y + 10 * scale, x + 10.8 * scale, y + 20 * scale], radius=1, fill=c_sub)

    # Bullish candle (centre)
    draw.line([x + 16 * scale, y + 5 * scale, x + 16 * scale, y + 24 * scale], fill=c_red, width=max(1, int(1.6*scale)))
    draw.rounded_rectangle([x + 13.4 * scale, y + 9 * scale, x + 18.6 * scale, y + 21 * scale], radius=1, fill=c_red)

    # Bullish candle (right)
    draw.line([x + 23.5 * scale, y + 9 * scale, x + 23.5 * scale, y + 24 * scale], fill=c_sub, width=max(1, int(1.4*scale)))
    draw.rounded_rectangle([x + 21.2 * scale, y + 13 * scale, x + 25.8 * scale, y + 21 * scale], radius=1, fill=c_sub)

def render_exact_card(card_w, card_h):
    """Renders the exact student enrollment card at card_w x card_h."""
    card = create_gradient(card_w, card_h, (131, 20, 31), (165, 34, 48), (78, 9, 17))
    card = add_radial_glow(card, card_w // 2, int(card_h * 0.15), int(card_w * 0.45), (255, 255, 255, 45))
    card = add_radial_glow(card, card_w // 2, int(card_h * 0.9), int(card_w * 0.5), (0, 0, 0, 90))

    draw = ImageDraw.Draw(card)

    # Perimeter borders
    draw.rounded_rectangle([16, 16, card_w - 16, card_h - 16], radius=28, outline=(255, 255, 255, 50), width=2)
    draw.rounded_rectangle([20, 20, card_w - 20, card_h - 20], radius=24, outline=(255, 255, 255, 20), width=1)

    # Fonts
    bold_font_path = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
    sans_font_path = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
    reg_font_path = "/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf"

    font_name = ImageFont.truetype(bold_font_path, int(card_h * 0.046))
    font_course = ImageFont.truetype(bold_font_path, int(card_h * 0.026))
    font_join = ImageFont.truetype(bold_font_path, int(card_h * 0.023))
    font_gamat = ImageFont.truetype(bold_font_path, int(card_h * 0.038))
    font_academy = ImageFont.truetype(bold_font_path, int(card_h * 0.016))
    font_sub = ImageFont.truetype(sans_font_path, int(card_h * 0.020))
    font_invite = ImageFont.truetype(bold_font_path, int(card_h * 0.023))
    font_code = ImageFont.truetype(bold_font_path, int(card_h * 0.033))
    font_domain = ImageFont.truetype(bold_font_path, int(card_h * 0.024))
    font_foot = ImageFont.truetype(sans_font_path, int(card_h * 0.016))

    # 1. Avatar (Top Center)
    avatar_r = int(card_h * 0.080)
    avatar_cx = card_w // 2
    avatar_cy = int(card_h * 0.135)

    # Load cropped avatar if available
    try:
        sample_src = Image.open("/home/antigravity/GAMAT-Enrollment-Invite-GMT-TOE411.png")
        avatar_crop = sample_src.crop((384 - 60, 210 - 60, 384 + 60, 210 + 60))
        avatar_crop = avatar_crop.resize((avatar_r * 2, avatar_r * 2), Image.Resampling.LANCZOS)
        # Circular mask
        mask = Image.new("L", (avatar_r * 2, avatar_r * 2), 0)
        mask_draw = ImageDraw.Draw(mask)
        mask_draw.ellipse([0, 0, avatar_r * 2, avatar_r * 2], fill=255)
        card.paste(avatar_crop, (avatar_cx - avatar_r, avatar_cy - avatar_r), mask)
    except Exception as e:
        draw.ellipse([avatar_cx - avatar_r, avatar_cy - avatar_r, avatar_cx + avatar_r, avatar_cy + avatar_r], fill=(220, 53, 69, 255))
        draw.text((avatar_cx, avatar_cy), "TD", font=font_name, fill=(255, 255, 255, 255), anchor="mm")

    # Avatar ring
    draw.ellipse([avatar_cx - avatar_r - 3, avatar_cy - avatar_r - 3, avatar_cx + avatar_r + 3, avatar_cy + avatar_r + 3], outline=(255, 255, 255, 245), width=4)

    # Active Checkmark Badge overlay
    badge_r = int(avatar_r * 0.28)
    badge_cx = int(avatar_cx + avatar_r * 0.72)
    badge_cy = int(avatar_cy + avatar_r * 0.72)
    draw.ellipse([badge_cx - badge_r, badge_cy - badge_r, badge_cx + badge_r, badge_cy + badge_r], fill=(2, 132, 199, 255), outline=(131, 20, 31, 255), width=2)
    font_check = ImageFont.truetype(bold_font_path, int(badge_r * 1.3))
    draw.text((badge_cx, badge_cy - 1), "✓", font=font_check, fill=(255, 255, 255, 255), anchor="mm")

    # 2. Student Name
    name_y = int(card_h * 0.245)
    draw.text((avatar_cx, name_y), "Toe Doe", font=font_name, fill=(255, 255, 255, 255), anchor="mm")

    # 3. Enrolled Course (NO PILL LAYER)
    course_y = int(card_h * 0.288)
    draw.text((avatar_cx, course_y), "Enrolled in: Forex Foundations", font=font_course, fill=(254, 205, 211, 255), anchor="mm")

    # 4. Tapering Divider
    div_y = int(card_h * 0.325)
    div_w = int(card_w * 0.60)
    for x in range(div_w):
        t = x / div_w
        # triangle opacity
        alpha = int(90 * (1.0 - abs(t - 0.5) * 2))
        px = (card_w - div_w) // 2 + x
        draw.point((px, div_y), fill=(255, 255, 255, alpha))

    # 5. "Join Me at"
    join_y = int(card_h * 0.360)
    draw.text((avatar_cx, join_y), "JOIN ME AT", font=font_join, fill=(255, 255, 255, 230), anchor="mm")

    # 6. Actual GAMAT Candlestick Logo Tile + Wordmark
    tile_size = int(card_h * 0.052)
    gap = int(card_w * 0.025)

    gamat_bbox = draw.textbbox((0, 0), "GAMAT ", font=font_gamat)
    fx_bbox = draw.textbbox((0, 0), "Fx", font=font_gamat)
    wordmark_w = (gamat_bbox[2] - gamat_bbox[0]) + (fx_bbox[2] - fx_bbox[0])
    total_logo_w = tile_size + gap + wordmark_w
    logo_x = (card_w - total_logo_w) // 2
    logo_y = int(card_h * 0.388)

    draw_candlestick_tile(draw, logo_x, logo_y, tile_size)

    # Wordmark text
    text_x = logo_x + tile_size + gap
    draw.text((text_x, logo_y + tile_size * 0.32), "GAMAT", font=font_gamat, fill=(255, 255, 255, 255), anchor="lm")
    fx_x = text_x + (gamat_bbox[2] - gamat_bbox[0])
    draw.text((fx_x, logo_y + tile_size * 0.32), "Fx", font=font_gamat, fill=(254, 205, 211, 255), anchor="lm")

    # ACADEMY tracked
    acad_str = "A C A D E M Y"
    draw.text((text_x + 1, logo_y + tile_size * 0.82), acad_str, font=font_academy, fill=(255, 255, 255, 210), anchor="lm")

    # 7. Subtitle
    sub_y = int(card_h * 0.470)
    draw.text((avatar_cx, sub_y), "Scan the QR code below to connect with my cohort & learn together", font=font_sub, fill=(255, 255, 255, 215), anchor="mm")

    # 8. QR Code Container
    qr_card_size = int(card_h * 0.320)
    qr_card_x = (card_w - qr_card_size) // 2
    qr_card_y = int(card_h * 0.505)

    draw.rounded_rectangle(
        [qr_card_x, qr_card_y, qr_card_x + qr_card_size, qr_card_y + qr_card_size],
        radius=int(qr_card_size * 0.09),
        fill=(255, 255, 255, 255),
        outline=(255, 255, 255, 120),
        width=2
    )

    # Paste QR
    try:
        sample_src = Image.open("/home/antigravity/GAMAT-Enrollment-Invite-GMT-TOE411.png")
        qr_crop = sample_src.crop((384 - 118, 524, 384 + 118, 760))
        qr_pad = int(qr_card_size * 0.10)
        inner_size = qr_card_size - qr_pad * 2
        qr_resized = qr_crop.resize((inner_size, inner_size), Image.Resampling.LANCZOS)
        card.paste(qr_resized, (qr_card_x + qr_pad, qr_card_y + qr_pad))
    except Exception as e:
        print("QR paste error:", e)

    # 9. Invite Code (NO PILL LAYER)
    code_y = int(card_h * 0.865)
    label_text = "INVITE CODE:  "
    code_text = "GMT-TOE411"
    l_box = draw.textbbox((0, 0), label_text, font=font_invite)
    c_box = draw.textbbox((0, 0), code_text, font=font_code)
    l_w = l_box[2] - l_box[0]
    c_w = c_box[2] - c_box[0]
    tot_code_w = l_w + c_w
    s_x = (card_w - tot_code_w) // 2

    draw.text((s_x, code_y), label_text, font=font_invite, fill=(255, 255, 255, 205), anchor="lm")
    draw.text((s_x + l_w, code_y), code_text, font=font_code, fill=(255, 255, 255, 255), anchor="lm")

    # 10. Official Domain
    domain_y = int(card_h * 0.915)
    draw.text((avatar_cx, domain_y), "gamatfxacademy.com", font=font_domain, fill=(254, 215, 170, 255), anchor="mm")

    # 11. Watermark Footer
    foot_y = int(card_h * 0.960)
    draw.text((avatar_cx, foot_y), "GAMAT Fx Academy • Official Student Share Card", font=font_foot, fill=(255, 255, 255, 130), anchor="mm")

    return card

def main():
    print("Generating Square Thumbnail (800x800)...")
    # In square 800x800, card fills canvas with elegant padding
    square_card = render_exact_card(760, 760)
    square_bg = create_gradient(800, 800, (110, 16, 25), (145, 28, 40), (60, 7, 13))
    square_bg.paste(square_card, (20, 20), square_card)
    square_bg.save("public/images/og-share-card-square.png", "PNG", optimize=True)
    print("Saved public/images/og-share-card-square.png")

    print("Generating Landscape 1200x630 Thumbnail...")
    # In 1200x630 landscape: The exact card is centered on a website ambient red backdrop
    # Card dimensions: 480x610 (proportional to 1080x1380), centered at (360, 10)
    card_h = 610
    card_w = int(card_h * (760 / 960))  # approx 482 px
    inner_card = render_exact_card(card_w, card_h)

    # Ambient landscape background
    land_bg = create_gradient(1200, 630, (95, 14, 22), (135, 24, 35), (48, 6, 11))
    land_bg = add_radial_glow(land_bg, 600, 315, 450, (255, 255, 255, 30))
    land_bg = add_radial_glow(land_bg, 200, 150, 300, (220, 53, 69, 50))
    land_bg = add_radial_glow(land_bg, 1000, 500, 350, (0, 0, 0, 90))

    # Center card at (1200 - card_w) // 2 = ~359
    card_x = (1200 - card_w) // 2
    card_y = 10
    land_bg.paste(inner_card, (card_x, card_y), inner_card)

    land_bg.save("public/images/og-share-card.png", "PNG", optimize=True)
    print("Saved public/images/og-share-card.png")

if __name__ == "__main__":
    main()
