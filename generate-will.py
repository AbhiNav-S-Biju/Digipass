#!/usr/bin/env python3
"""
DIGIPASS Digital Will PDF Generator
Generates professional 2-page Digital Will and Estate Declaration PDF
using ReportLab library
"""

import sys
import json
from datetime import datetime
from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm, pt
from reportlab.pdfgen import canvas
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT, TA_JUSTIFY

# ════════════════════════════════════════════════════════════════════════════════
# COLOR SYSTEM
# ════════════════════════════════════════════════════════════════════════════════

COLORS = {
    'FOREST': colors.HexColor('#1b3a2d'),
    'FOREST_MID': colors.HexColor('#2d5a42'),
    'FOREST_LIGHT': colors.HexColor('#3d7a5a'),
    'SAGE': colors.HexColor('#8cbf9c'),
    'CREAM': colors.HexColor('#f5ead8'),
    'CREAM_LIGHT': colors.HexColor('#fdf6ec'),
    'SAND': colors.HexColor('#e8d9c0'),
    'SAND_DEEP': colors.HexColor('#d4c4a0'),
    'TEXT_DARK': colors.HexColor('#1a2e22'),
    'TEXT_BODY': colors.HexColor('#2c3a2e'),
    'TEXT_MID': colors.HexColor('#5a7260'),
    'TEXT_LIGHT': colors.HexColor('#8a9e90'),
    'WHITE': colors.HexColor('#ffffff'),
    'GREEN': colors.HexColor('#3d7a5a'),
    'AMBER': colors.HexColor('#7a5a00'),
    'RULE': colors.HexColor('#d4c4a0'),
    'RULE_DARK': colors.HexColor('#c4b090'),
}

# ════════════════════════════════════════════════════════════════════════════════
# PAGE SETUP
# ════════════════════════════════════════════════════════════════════════════════

PAGE_WIDTH, PAGE_HEIGHT = A4
ML = 20 * mm
MR = PAGE_WIDTH - 20 * mm
CW = MR - ML

# ════════════════════════════════════════════════════════════════════════════════
# UTILITY FUNCTIONS
# ════════════════════════════════════════════════════════════════════════════════

def number_to_words(n):
    """Convert number to English words for year"""
    ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
    teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 
             'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
    tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
    
    if n < 10:
        return ones[n]
    elif n < 20:
        return teens[n - 10]
    elif n < 100:
        return tens[n // 10] + ('' if n % 10 == 0 else ' ' + ones[n % 10])
    elif n < 1000:
        return ones[n // 100] + ' Hundred' + ('' if n % 100 == 0 else ' ' + number_to_words(n % 100))
    elif n < 1000000:
        return number_to_words(n // 1000) + ' Thousand' + ('' if n % 1000 == 0 else ' ' + number_to_words(n % 1000))
    return str(n)

def roman_numeral(n):
    """Convert integer to Roman numeral"""
    val = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1]
    syms = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I']
    roman_num = ''
    i = 0
    while n > 0:
        for _ in range(n // val[i]):
            roman_num += syms[i]
            n -= val[i]
        i += 1
    return roman_num

def draw_vault_icon(c, x, y, size=28, on_dark=True):
    """Draw DIGIPASS vault icon"""
    stroke_color = COLORS['CREAM_LIGHT'] if on_dark else COLORS['FOREST']
    dot_color = COLORS['SAGE']
    bg_color = COLORS['FOREST_MID'] if on_dark else COLORS['SAND']

    # Rounded square background
    c.setFillColor(bg_color)
    c.roundRect(x, y - size, size, size, size * 0.2, fill=1, stroke=0)

    # Vault rectangle body
    vx = x + size * 0.23
    vy = y - size * 0.27
    vw = size * 0.54
    vh = size * 0.35
    c.setStrokeColor(stroke_color)
    c.setLineWidth(1.5)
    c.roundRect(vx, vy - vh, vw, vh, 3, fill=0, stroke=1)

    # Horizontal divider
    c.setLineWidth(1)
    c.line(vx, vy - vh * 0.45, vx + vw, vy - vh * 0.45)

    # Green squares inside vault
    c.setFillColor(dot_color)
    c.rect(vx + vw * 0.1, vy - vh * 0.9, vw * 0.25, vh * 0.35, fill=1, stroke=0)
    c.setFillAlpha(0.45)
    c.rect(vx + vw * 0.45, vy - vh * 0.9, vw * 0.25, vh * 0.35, fill=1, stroke=0)
    c.setFillAlpha(1)

    # Key pin
    kx = x + size * 0.65
    ky = y - size * 0.1
    c.setFillColor(stroke_color)
    c.circle(kx, ky, size * 0.07, fill=1, stroke=0)
    c.setStrokeColor(stroke_color)
    c.setLineWidth(1.5)
    c.line(kx, ky - size * 0.07, kx, vy)

def draw_header_page1(c, user_data):
    """Draw header band for Page 1"""
    # Full-width FOREST background
    c.setFillColor(COLORS['FOREST'])
    c.rect(0, PAGE_HEIGHT - 56 * mm, PAGE_WIDTH, 56 * mm, fill=1, stroke=0)
    
    # Decorative circle top-right
    circle_radius = 46 * mm
    c.setFillColor(COLORS['FOREST_MID'])
    c.circle(PAGE_WIDTH, PAGE_HEIGHT, circle_radius, fill=1, stroke=0)
    
    c.setFillColor(COLORS['FOREST'])
    c.circle(PAGE_WIDTH, PAGE_HEIGHT, 26 * mm, fill=1, stroke=0)
    
    # SAGE accent line at bottom
    c.setStrokeColor(COLORS['SAGE'])
    c.setLineWidth(0.7)
    c.line(0, PAGE_HEIGHT - 56 * mm, PAGE_WIDTH, PAGE_HEIGHT - 56 * mm)
    
    # Vault icon
    draw_vault_icon(c, ML, PAGE_HEIGHT - 8 * mm, size=28, on_dark=True)
    
    # Wordmark and tagline
    c.setFont("Helvetica-Bold", 16)
    c.setFillColor(COLORS['CREAM_LIGHT'])
    c.drawString(ML + 36 * mm, PAGE_HEIGHT - 11 * mm, "Digipass")
    
    c.setFont("Helvetica", 7)
    c.setFillColor(COLORS['SAGE'])
    c.drawString(ML + 37 * mm, PAGE_HEIGHT - 15 * mm, "DIGITAL  ESTATE")
    
    # Thin rule
    c.setStrokeColor(COLORS['FOREST_LIGHT'])
    c.setLineWidth(0.4)
    c.line(ML + 36 * mm, PAGE_HEIGHT - 17 * mm, ML + 100 * mm, PAGE_HEIGHT - 17 * mm)
    
    # Main title
    c.setFont("Helvetica-Bold", 20)
    c.setFillColor(COLORS['WHITE'])
    c.drawString(ML, PAGE_HEIGHT - 28 * mm, "DIGITAL WILL & ESTATE DECLARATION")
    
    # Subtitle
    c.setFont("Helvetica-Bold", 9.5)
    c.setFillColor(COLORS['SAGE'])
    c.drawString(ML, PAGE_HEIGHT - 36 * mm, "A STRUCTURED RECORD OF DIGITAL ASSETS AND EXECUTOR ASSIGNMENTS")
    
    # Document meta right-aligned
    now = datetime.now()
    instrument_no = f"DW-{now.strftime('%Y%m%d')}-U{user_data['id']}"
    
    c.setFont("Helvetica", 7)
    c.drawString(MR - 100 * mm, PAGE_HEIGHT - 44 * mm, f"INSTRUMENT NO.  {instrument_no}")
    c.drawString(MR - 100 * mm, PAGE_HEIGHT - 49.5 * mm, f"GENERATED: {now.strftime('%d %B %Y')}  ·  CONFIDENTIAL")

def draw_header_page2(c, user_data):
    """Draw header band for Page 2"""
    # Full-width FOREST background (shorter)
    c.setFillColor(COLORS['FOREST'])
    c.rect(0, PAGE_HEIGHT - 38 * mm, PAGE_WIDTH, 38 * mm, fill=1, stroke=0)
    
    # SAGE accent line
    c.setStrokeColor(COLORS['SAGE'])
    c.setLineWidth(0.7)
    c.line(0, PAGE_HEIGHT - 38 * mm, PAGE_WIDTH, PAGE_HEIGHT - 38 * mm)
    
    # Vault icon and wordmark
    draw_vault_icon(c, ML, PAGE_HEIGHT - 8 * mm, size=28, on_dark=True)
    
    c.setFont("Helvetica-Bold", 16)
    c.setFillColor(COLORS['CREAM_LIGHT'])
    c.drawString(ML + 36 * mm, PAGE_HEIGHT - 11 * mm, "Digipass")
    
    c.setFont("Helvetica", 7)
    c.setFillColor(COLORS['SAGE'])
    c.drawString(ML + 37 * mm, PAGE_HEIGHT - 15 * mm, "DIGITAL  ESTATE")
    
    # Page 2 title
    c.setFont("Helvetica-Bold", 16)
    c.setFillColor(COLORS['WHITE'])
    c.drawString(ML, PAGE_HEIGHT - 26 * mm, "SIGNATURE AND EXECUTION PAGE")
    
    # Right-aligned meta
    now = datetime.now()
    instrument_no = f"DW-{now.strftime('%Y%m%d')}-U{user_data['id']}"
    
    c.setFont("Helvetica", 7)
    c.setFillColor(COLORS['SAGE'])
    c.drawRightString(MR, PAGE_HEIGHT - 26 * mm, f"Instrument No. {instrument_no}")
    c.drawRightString(MR, PAGE_HEIGHT - 31 * mm, f"Digital Will and Estate Declaration of {user_data['full_name'].upper()}")

def draw_footer(c, page_num, user_data):
    """Draw footer on all pages"""
    now = datetime.now()
    instrument_no = f"DW-{now.strftime('%Y%m%d')}-U{user_data['id']}"
    
    # FOREST footer band
    c.setFillColor(COLORS['FOREST'])
    c.rect(0, 0, PAGE_WIDTH, 11 * mm, fill=1, stroke=0)
    
    # SAGE line above footer
    c.setStrokeColor(COLORS['SAGE'])
    c.setLineWidth(0.6)
    c.line(0, 11 * mm, PAGE_WIDTH, 11 * mm)
    
    # Footer text
    c.setFont("Helvetica", 7)
    c.setFillColor(COLORS['SAGE'])
    
    # Left
    c.drawString(ML, 4 * mm, "Generated by DIGIPASS  ·  digipass.app")
    
    # Center
    center_text = f"DIGITAL WILL AND ESTATE DECLARATION  —  {user_data['full_name'].upper()}"
    c.drawCentredString(PAGE_WIDTH / 2, 4 * mm, center_text)
    
    # Right
    c.drawRightString(MR, 4 * mm, f"Instrument No. {instrument_no}  ·  Page {page_num} of 2")

def draw_preamble(c, y, user_data):
    """Draw preamble box"""
    box_height = 32 * mm
    box_y = y - box_height
    
    # Drop shadow
    c.setFillColor(colors.HexColor('#d4c4a0'))
    c.roundRect(ML + 0.6 * mm, box_y - 0.6 * mm, CW, box_height, 2, fill=1, stroke=0)
    
    # Main card
    c.setFillColor(COLORS['CREAM_LIGHT'])
    c.setStrokeColor(COLORS['SAND_DEEP'])
    c.setLineWidth(0.5)
    c.roundRect(ML, box_y, CW, box_height, 2, fill=1, stroke=1)
    
    # Left strip
    c.setFillColor(COLORS['FOREST'])
    c.rect(ML, box_y, 5 * mm, box_height, fill=1, stroke=0)
    
    # Rounded corner patch for left strip
    c.setFillColor(COLORS['CREAM_LIGHT'])
    c.roundRect(ML, box_y + box_height - 2 * mm, 5 * mm, 2 * mm, 1.5, fill=1, stroke=0)
    
    # Preamble text
    preamble_text = (
        f"KNOW ALL PERSONS BY THESE PRESENTS: I, {user_data['full_name'].upper()}, "
        f"User Identification Number #{user_data['id']}, registered with DIGIPASS Digital Estate Platform, "
        f"being of sound mind and memory, and not acting under duress, menace, fraud, or undue influence "
        f"of any person whatsoever, do hereby make, publish, and declare this my Digital Will and Estate Declaration, "
        f"hereby revoking all former digital wills and testamentary dispositions of digital property heretofore "
        f"made by me in this platform."
    )
    
    c.setFont("Helvetica", 8.5)
    c.setFillColor(COLORS['TEXT_MID'])
    
    # Simple text drawing (justified manually)
    x_start = ML + 8 * mm
    y_text = box_y + box_height - 4 * mm
    max_width = CW - 10 * mm
    
    words = preamble_text.split()
    line = ""
    for word in words:
        test_line = line + word + " " if line else word + " "
        c.setFont("Helvetica", 8.5)
        if c.stringWidth(test_line, "Helvetica", 8.5) > max_width:
            c.drawString(x_start, y_text, line.strip())
            y_text -= 5 * mm
            line = word + " "
        else:
            line = test_line
    if line:
        c.drawString(x_start, y_text, line.strip())
    
    return box_y - 5 * mm

def draw_article_heading(c, y, article_label, title_text):
    """Draw article heading with label, dot, and title"""
    # Article label
    c.setFont("Helvetica-Bold", 7)
    c.setFillColor(COLORS['FOREST'])
    c.drawString(ML, y, article_label)
    
    # SAGE dot
    c.setFillColor(COLORS['SAGE'])
    label_width = c.stringWidth(article_label, "Helvetica-Bold", 7)
    c.circle(ML + label_width + 3 * mm, y + 1 * mm, 1.1 * mm, fill=1, stroke=0)
    
    # Title
    c.setFont("Helvetica-Bold", 10.5)
    c.setFillColor(COLORS['FOREST'])
    c.drawString(ML + label_width + 8 * mm, y, title_text)
    
    # Rule below
    c.setStrokeColor(COLORS['SAND_DEEP'])
    c.setLineWidth(0.5)
    c.line(ML, y - 2.5 * mm, MR, y - 2.5 * mm)
    
    return y - 5 * mm

def draw_signature_box(c, x, y, width, label, prefill=""):
    """Draw signature box component"""
    box_height = 22 * mm
    
    # Main card
    c.setFillColor(COLORS['CREAM_LIGHT'])
    c.setStrokeColor(COLORS['SAND_DEEP'])
    c.setLineWidth(0.4)
    c.roundRect(x, y - box_height, width, box_height, 1.5, fill=1, stroke=1)
    
    # Top band
    c.setFillColor(COLORS['SAND'])
    c.roundRect(x, y - 7 * mm, width, 7 * mm, 1.5, fill=1, stroke=0)
    
    # Label in band
    c.setFont("Helvetica", 6.5)
    c.setFillColor(COLORS['FOREST'])
    c.drawString(x + 3 * mm, y - 4.5 * mm, label.upper())
    
    # Signature line
    c.setStrokeColor(COLORS['FOREST_LIGHT'])
    c.setLineWidth(0.6)
    c.line(x + 4 * mm, y - 16 * mm, x + width - 4 * mm, y - 16 * mm)
    
    # Prefill or X mark
    if prefill:
        c.setFont("Helvetica", 8.5)
        c.setFillColor(COLORS['TEXT_MID'])
        c.drawString(x + 4 * mm, y - 14 * mm, prefill)
    else:
        c.setFont("Helvetica", 12)
        c.setFillColor(COLORS['TEXT_LIGHT'])
        c.drawString(x + 4 * mm, y - 15.5 * mm, "✕")

# ════════════════════════════════════════════════════════════════════════════════
# PAGE 1 CONTENT
# ════════════════════════════════════════════════════════════════════════════════

def draw_page1(c, user_data, assets, executors, emergency_contacts):
    """Generate Page 1 content"""
    draw_header_page1(c, user_data)
    
    y = PAGE_HEIGHT - 64 * mm
    
    # Preamble
    y = draw_preamble(c, y, user_data)
    
    # Article I - Testator Identification
    y = draw_article_heading(c, y, "ARTICLE  I", "TESTATOR IDENTIFICATION")
    y -= 5 * mm
    
    # Two-column field grid
    col_width = (CW - 5 * mm) / 2
    field_height = 13 * mm
    
    fields = [
        [("FULL LEGAL NAME", user_data['full_name'].upper()),
         ("DATE OF REGISTRATION", user_data.get('created_at', datetime.now().strftime('%B %d, %Y')))],
        [("EMAIL ADDRESS", user_data['email']),
         ("DIGIPASS USER ID", f"DIGIPASS ID #{user_data['id']}")]
    ]
    
    for row in fields:
        for col_idx, (label, value) in enumerate(row):
            x = ML + col_idx * (col_width + 5 * mm)
            
            # Label
            c.setFont("Helvetica", 6.5)
            c.setFillColor(COLORS['TEXT_LIGHT'])
            c.drawString(x, y - 3 * mm, label)
            
            # Value
            c.setFont("Helvetica-Bold", 10)
            c.setFillColor(COLORS['TEXT_DARK'])
            c.drawString(x, y - 8.5 * mm, value[:40])  # Truncate long values
            
            # Underline
            c.setStrokeColor(COLORS['SAND_DEEP'])
            c.setLineWidth(0.5)
            c.line(x, y - 10.5 * mm, x + col_width - 5 * mm, y - 10.5 * mm)
        
        y -= field_height
    
    y -= 6 * mm
    c.setStrokeColor(COLORS['FOREST_LIGHT'])
    c.setLineWidth(0.5)
    c.line(ML, y, MR, y)
    y -= 6 * mm
    
    # Article II - Schedule of Digital Assets
    y = draw_article_heading(c, y, "ARTICLE  II", "SCHEDULE OF DIGITAL ASSETS")
    y -= 5 * mm
    
    # Intro paragraph
    intro_text = (
        "I give, bequeath, and assign the following digital assets, being the whole of my electronic "
        "estate as recorded within the DIGIPASS platform, to the designated Executor(s) in accordance "
        "with the permissions and instructions granted under Article III. Each asset shall be managed "
        "according to the preferred action specified herein:"
    )
    
    c.setFont("Helvetica-Oblique", 8)
    c.setFillColor(COLORS['TEXT_MID'])
    y -= draw_multiline_text(c, intro_text, ML, y, CW, 12.5)
    y -= 8 * mm
    
    # Asset cards
    for idx, asset in enumerate(assets, 1):
        if y < 80 * mm:  # Not enough space, would need page break logic
            break
        
        card_height = 16 * mm
        
        # Drop shadow
        c.setFillColor(COLORS['SAND_DEEP'])
        c.roundRect(ML + 0.6 * mm, y - card_height - 0.6 * mm, CW, card_height, 2, fill=1, stroke=0)
        
        # Card
        c.setFillColor(COLORS['CREAM_LIGHT'])
        c.setStrokeColor(COLORS['SAND_DEEP'])
        c.setLineWidth(0.4)
        c.roundRect(ML, y - card_height, CW, card_height, 2, fill=1, stroke=1)
        
        # Left strip
        c.setFillColor(COLORS['FOREST'])
        c.rect(ML, y - card_height, 6 * mm, card_height, fill=1, stroke=0)
        
        # Roman numeral
        c.setFont("Helvetica-Bold", 7)
        c.setFillColor(COLORS['WHITE'])
        c.drawCentredString(ML + 3 * mm, y - card_height + 4 * mm, roman_numeral(idx))
        
        # Asset name
        c.setFont("Helvetica-Bold", 10)
        c.setFillColor(COLORS['TEXT_DARK'])
        c.drawString(ML + 9 * mm, y - 5.5 * mm, asset['name'].upper()[:50])
        
        # Category badge
        badge_colors = {
            'social': (colors.HexColor('#ddeaf5'), colors.HexColor('#1a4a6e')),
            'finance': (colors.HexColor('#d4ead8'), colors.HexColor('#1b3a2d')),
            'storage': (colors.HexColor('#f0e6d4'), colors.HexColor('#7a4f1a')),
            'email': (colors.HexColor('#ede8f5'), colors.HexColor('#4a3080')),
        }
        bg_color, text_color = badge_colors.get(asset.get('category', 'default'), (COLORS['SAND'], COLORS['TEXT_MID']))
        
        c.setFillColor(bg_color)
        c.roundRect(ML + 100 * mm, y - 7.5 * mm, 25 * mm, 4.2 * mm, 1.2, fill=1, stroke=0)
        
        c.setFont("Helvetica", 6.5)
        c.setFillColor(text_color)
        c.drawCentredString(ML + 112.5 * mm, y - 5.5 * mm, asset.get('category', 'ASSET').upper())
        
        # Description
        c.setFont("Helvetica", 8)
        c.setFillColor(COLORS['TEXT_MID'])
        c.drawString(ML + 9 * mm, y - 11 * mm, asset.get('description', '')[:60])
        
        # Right meta
        c.setFont("Helvetica", 7)
        c.setFillColor(COLORS['TEXT_LIGHT'])
        action = asset.get('preferred_action', 'MANAGE').upper()
        c.drawRightString(MR - 2 * mm, y - 5.5 * mm, f"Preferred Action: {action}")
        date_str = asset.get('created_at', datetime.now().strftime('%B %d, %Y'))
        c.drawRightString(MR - 2 * mm, y - 11 * mm, f"Added: {date_str}")
        
        y -= card_height + 2 * mm
    
    y -= 5 * mm
    c.setStrokeColor(COLORS['FOREST_LIGHT'])
    c.setLineWidth(0.5)
    c.line(ML, y, MR, y)
    y -= 6 * mm
    
    # Article III - Appointment of Executors
    y = draw_article_heading(c, y, "ARTICLE  III", "APPOINTMENT OF EXECUTORS")
    y -= 5 * mm
    
    intro_text = (
        "I hereby nominate, constitute, and appoint the following named individuals as Personal Executors "
        "of my digital estate within the DIGIPASS platform. Each Executor shall serve in a fiduciary capacity "
        "and shall have only such authority as is expressly granted herein. Sensitive credentials remain encrypted "
        "and are accessible solely through the secure DIGIPASS Executor Portal:"
    )
    
    c.setFont("Helvetica-Oblique", 8)
    c.setFillColor(COLORS['TEXT_MID'])
    y -= draw_multiline_text(c, intro_text, ML, y, CW, 12.5)
    y -= 8 * mm
    
    # Executor cards
    for idx, executor in enumerate(executors[:2], 1):  # Limit to 2 on page 1
        if y < 80 * mm:
            break
        
        card_height = 17 * mm
        
        # Drop shadow
        c.setFillColor(COLORS['SAND_DEEP'])
        c.roundRect(ML + 0.6 * mm, y - card_height - 0.6 * mm, CW, card_height, 2, fill=1, stroke=0)
        
        # Card
        c.setFillColor(COLORS['CREAM_LIGHT'])
        c.setStrokeColor(COLORS['SAND_DEEP'])
        c.setLineWidth(0.4)
        c.roundRect(ML, y - card_height, CW, card_height, 2, fill=1, stroke=1)
        
        # Left strip (different color for executors)
        c.setFillColor(COLORS['FOREST_LIGHT'])
        c.rect(ML, y - card_height, 6 * mm, card_height, fill=1, stroke=0)
        
        # Roman numeral
        c.setFont("Helvetica-Bold", 7)
        c.setFillColor(COLORS['WHITE'])
        c.drawCentredString(ML + 3 * mm, y - card_height + 4 * mm, roman_numeral(idx))
        
        # Name
        c.setFont("Helvetica-Bold", 10)
        c.setFillColor(COLORS['TEXT_DARK'])
        c.drawString(ML + 9 * mm, y - 5.5 * mm, executor['name'].upper()[:50])
        
        # Email
        c.setFont("Helvetica", 8)
        c.setFillColor(COLORS['TEXT_MID'])
        c.drawString(ML + 9 * mm, y - 10.5 * mm, executor.get('email', '')[:50])
        
        # Status badges on right
        status = executor.get('status', 'Pending')
        access = "Granted" if executor.get('access_granted') else "Pending"
        
        status_color = COLORS['GREEN'] if status == 'Verified' else COLORS['FOREST']
        access_color = COLORS['GREEN'] if access == 'Granted' else COLORS['AMBER']
        
        c.setFont("Helvetica", 7)
        c.setFillColor(status_color)
        c.drawRightString(MR - 2 * mm, y - 5.5 * mm, f"Status: {status}")
        c.setFillColor(access_color)
        c.drawRightString(MR - 2 * mm, y - 9.5 * mm, f"Access: {access}")
        
        y -= card_height + 2 * mm
    
    y -= 5 * mm
    c.setStrokeColor(COLORS['FOREST_LIGHT'])
    c.setLineWidth(0.5)
    c.line(ML, y, MR, y)
    
    draw_footer(c, 1, user_data)

def draw_multiline_text(c, text, x, y, max_width, leading, font_name="Helvetica", font_size=8):
    """Draw text with word wrapping, return height used"""
    c.setFont(font_name, font_size)
    words = text.split()
    line = ""
    height_used = 0
    
    for word in words:
        test_line = line + word + " " if line else word + " "
        if c.stringWidth(test_line, font_name, font_size) > max_width:
            if line:
                c.drawString(x, y - height_used, line.strip())
                height_used += leading / mm
            line = word + " "
        else:
            line = test_line
    
    if line:
        c.drawString(x, y - height_used, line.strip())
        height_used += leading / mm
    
    return height_used

# ════════════════════════════════════════════════════════════════════════════════
# PAGE 2 CONTENT
# ════════════════════════════════════════════════════════════════════════════════

def draw_page2(c, user_data, executors):
    """Generate Page 2 - Signature and Execution Page"""
    draw_header_page2(c, user_data)
    
    y = PAGE_HEIGHT - 46 * mm
    
    # Execution Statement
    exec_text = (
        f"IN WITNESS WHEREOF, I, {user_data['full_name'].upper()}, the Testator named in this Digital Will "
        f"and Estate Declaration, have hereunto set my hand and seal to this instrument, on this {datetime.now().strftime('%-d')} day of "
        f"{datetime.now().strftime('%B')}, in the year {number_to_words(datetime.now().year).replace(' ', '  ')}, "
        f"declaring and publishing this as my Digital Will and Estate Declaration of digital assets, in the presence of the witnesses "
        f"whose signatures appear below, each of whom signed in my presence and in the presence of each other."
    )
    
    c.setFont("Helvetica", 9)
    c.setFillColor(COLORS['TEXT_BODY'])
    y -= draw_multiline_text(c, exec_text, ML, y, CW, 15)
    y -= 8 * mm
    
    # Rule
    c.setStrokeColor(COLORS['RULE_DARK'])
    c.setLineWidth(0.5)
    c.line(ML, y, MR, y)
    y -= 8 * mm
    
    # Testator Signature Section
    c.setFont("Helvetica-Bold", 9)
    c.setFillColor(COLORS['FOREST'])
    c.drawString(ML, y, "TESTATOR")
    y -= 6 * mm
    
    c.setFont("Helvetica", 8.5)
    c.setFillColor(COLORS['TEXT_MID'])
    testator_text = (
        f"I, {user_data['full_name'].upper()}, sign my name to this instrument this {datetime.now().strftime('%B %d, %Y')}, "
        f"and being first duly sworn, declare to the undersigned authority that I sign and execute this instrument as my Digital Will "
        f"and that I sign it willingly."
    )
    y -= draw_multiline_text(c, testator_text, ML, y, CW, 12.5)
    y -= 6 * mm
    
    # Signature boxes
    draw_signature_box(c, ML, y, 80 * mm, "Signature of Testator", user_data['full_name'])
    draw_signature_box(c, ML + 90 * mm, y, 80 * mm, "Date", datetime.now().strftime('%B %d, %Y'))
    y -= 28 * mm
    
    # Rule
    c.setStrokeColor(COLORS['RULE_DARK'])
    c.setLineWidth(0.5)
    c.line(ML, y, MR, y)
    y -= 8 * mm
    
    # Witness Attestation
    c.setFont("Helvetica-Bold", 9)
    c.setFillColor(COLORS['FOREST'])
    c.drawString(ML, y, "ATTESTATION OF WITNESSES")
    y -= 6 * mm
    
    attestation_text = (
        "We, the undersigned witnesses, each do hereby declare that the Testator signed and "
        "executed this instrument as their Digital Will and Estate Declaration in the presence "
        "of us, both present at the same time; and that we, in the Testator's presence, at their "
        "request, and in the presence of each other, have subscribed our names hereto as witnesses "
        "thereof, and that to the best of our knowledge the Testator was at the time of signing of "
        "sound and disposing mind and memory."
    )
    
    c.setFont("Helvetica", 8.5)
    c.setFillColor(COLORS['TEXT_MID'])
    y -= draw_multiline_text(c, attestation_text, ML, y, CW, 13.5)
    y -= 8 * mm
    
    # Witness boxes - Row 1
    draw_signature_box(c, ML, y, 80 * mm, "Witness No. 1 — Signature", "")
    draw_signature_box(c, ML + 90 * mm, y, 80 * mm, "Witness No. 1 — Full Name (Print)", "")
    y -= 28 * mm
    
    # Witness boxes - Row 2
    draw_signature_box(c, ML, y, 80 * mm, "Witness No. 2 — Signature", "")
    draw_signature_box(c, ML + 90 * mm, y, 80 * mm, "Witness No. 2 — Full Name (Print)", "")
    y -= 28 * mm
    
    # Rule
    c.setStrokeColor(COLORS['RULE_DARK'])
    c.setLineWidth(0.5)
    c.line(ML, y, MR, y)
    y -= 8 * mm
    
    # Notarial Acknowledgement
    c.setFont("Helvetica-Bold", 9)
    c.setFillColor(COLORS['FOREST'])
    c.drawString(ML, y, "NOTARIAL ACKNOWLEDGEMENT  /  OFFICIAL SEAL")
    y -= 6 * mm
    
    notary_text = (
        f"State / Jurisdiction of ____________________    Country / District of ____________________\n\n"
        f"Subscribed, sworn to and acknowledged before me by {user_data['full_name'].upper()}, the Testator, "
        f"and subscribed and sworn to before me by ____________________ and ____________________, "
        f"witnesses, this ______ day of ______________, 20____."
    )
    
    c.setFont("Helvetica", 8.5)
    c.setFillColor(COLORS['TEXT_MID'])
    y -= draw_multiline_text(c, notary_text, ML, y, CW - 60 * mm, 14)
    
    # DIGIPASS Seal Circle (right side)
    seal_x = MR - 25 * mm
    seal_y = y + 30 * mm
    
    c.setFillColor(COLORS['CREAM_LIGHT'])
    c.setStrokeColor(COLORS['FOREST_LIGHT'])
    c.setLineWidth(0.8)
    c.circle(seal_x, seal_y, 18 * mm, fill=1, stroke=1)
    
    c.setStrokeColor(COLORS['SAGE'])
    c.setLineWidth(0.4)
    c.circle(seal_x, seal_y, 15 * mm, fill=0, stroke=1)
    
    # Vault icon in seal
    draw_vault_icon(c, seal_x - 10 * mm, seal_y + 10 * mm, size=20, on_dark=False)
    
    # Seal text
    c.setFont("Helvetica-Bold", 6)
    c.setFillColor(COLORS['FOREST'])
    c.drawCentredString(seal_x, seal_y - 12 * mm, "DIGIPASS")
    c.drawCentredString(seal_x, seal_y - 15.5 * mm, "DIGITAL ESTATE")
    c.drawCentredString(seal_x, seal_y - 19 * mm, "OFFICIAL SEAL")
    
    y -= 42 * mm
    
    # Notary signature box
    draw_signature_box(c, ML, y, 100 * mm, "Notary Public — Signature & Commission No.", "")
    y -= 28 * mm
    
    # Rule
    c.setStrokeColor(COLORS['RULE_DARK'])
    c.setLineWidth(0.5)
    c.line(ML, y, MR, y)
    y -= 6 * mm
    
    # Final certification
    now = datetime.now()
    instrument_no = f"DW-{now.strftime('%Y%m%d')}-U{user_data['id']}"
    cert_text = f"This document was digitally generated by DIGIPASS · digipass.app · Instrument No. {instrument_no} · {now.strftime('%B %d, %Y')}"
    
    c.setFont("Helvetica", 7.5)
    c.setFillColor(COLORS['TEXT_LIGHT'])
    c.drawCentredString(PAGE_WIDTH / 2, y, cert_text)
    
    draw_footer(c, 2, user_data)

# ════════════════════════════════════════════════════════════════════════════════
# MAIN FUNCTION
# ════════════════════════════════════════════════════════════════════════════════

def generate_pdf(user_data, assets, executors, emergency_contacts=None):
    """Main function to generate the complete 2-page PDF"""
    if emergency_contacts is None:
        emergency_contacts = []
    
    output = BytesIO()
    
    c = canvas.Canvas(output, pagesize=A4)
    c.setTitle(f"Digital Will and Estate Declaration — {user_data['full_name']}")
    c.setAuthor("DIGIPASS")
    c.setSubject("Digital Will and Estate Declaration of Digital Assets")
    c.setKeywords("digital will, digipass, digital estate, digital inheritance, testament")
    
    # Background color for all pages
    def set_background():
        c.setFillColor(COLORS['CREAM'])
        c.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, fill=1, stroke=0)
        
        # Left and right border rules (3.5mm wide FOREST)
        c.setFillColor(COLORS['FOREST'])
        c.rect(0, 0, 3.5 * mm, PAGE_HEIGHT, fill=1, stroke=0)
        c.rect(PAGE_WIDTH - 3.5 * mm, 0, 3.5 * mm, PAGE_HEIGHT, fill=1, stroke=0)
    
    # Page 1
    set_background()
    draw_page1(c, user_data, assets, executors, emergency_contacts)
    c.showPage()
    
    # Page 2
    set_background()
    draw_page2(c, user_data, executors)
    c.showPage()
    
    c.save()
    output.seek(0)
    return output

# ════════════════════════════════════════════════════════════════════════════════
# ENTRY POINT FOR SUBPROCESS
# ════════════════════════════════════════════════════════════════════════════════

if __name__ == '__main__':
    try:
        # Read JSON from stdin
        data = json.loads(sys.stdin.read())
        
        user_data = data['user']
        assets = data['assets']
        executors = data['executors']
        emergency_contacts = data.get('emergency_contacts', [])
        
        pdf_buffer = generate_pdf(user_data, assets, executors, emergency_contacts)
        
        # Write PDF to stdout in binary mode
        sys.stdout.buffer.write(pdf_buffer.getvalue())
    except json.JSONDecodeError as e:
        sys.stderr.write(f'JSON parsing error: {str(e)}\n')
        sys.exit(1)
    except KeyError as e:
        sys.stderr.write(f'Missing required field: {str(e)}\n')
        sys.exit(1)
    except ImportError as e:
        sys.stderr.write(f'Import error (missing dependency): {str(e)}\nInstall reportlab: pip install reportlab\n')
        sys.exit(1)
    except Exception as e:
        sys.stderr.write(f'Unexpected error: {str(e)}\n')
        import traceback
        sys.stderr.write(traceback.format_exc() + '\n')
        sys.exit(1)
