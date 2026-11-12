#!/usr/bin/env python3
"""
DIGIPASS Digital Will PDF Generator

Builds the "Digital Will and Estate Declaration" PDF with ReportLab's flowing
layout (platypus), so text, tables and page breaks follow one margin grid.

Input:  JSON on stdin (see controllers/willController.js)
Output: PDF bytes on stdout
Test:   python generate-will.py --test   ->  writes test_will.pdf
"""

import sys
import json
from datetime import datetime
from io import BytesIO
from xml.sax.saxutils import escape

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.pdfgen import canvas
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Table, TableStyle,
    Flowable, KeepTogether, PageBreak, NextPageTemplate, CondPageBreak,
)

# ─── Palette (DIGIPASS) ───────────────────────────────────────────────────────
FOREST = colors.HexColor('#1b3a2d')
FOREST_MID = colors.HexColor('#2d5a42')
FOREST_LIGHT = colors.HexColor('#3d7a5a')
SAGE = colors.HexColor('#d4ead8')
CREAM = colors.HexColor('#f5ead8')
CREAM_LIGHT = colors.HexColor('#fdf6ec')
SAND = colors.HexColor('#e8d9c0')
SAND_DEEP = colors.HexColor('#d4c4a0')
INK = colors.HexColor('#1a2e22')
MUTED = colors.HexColor('#4d6454')

# ─── Page geometry ────────────────────────────────────────────────────────────
PAGE_W, PAGE_H = A4
MARGIN_X = 24 * mm
CONTENT_W = PAGE_W - 2 * MARGIN_X
BORDER_INSET = 11 * mm
FIRST_TOP = 26 * mm      # first page: the title block is part of the flow
LATER_TOP = 30 * mm      # later pages: room for the running header
BOTTOM = 26 * mm         # room for the footer

ACTIONS = {
    'pass': ('Pass to Executor',
             'The Executor shall receive the login details for this account through the '
             'DIGIPASS Executor Portal and manage it on the Testator’s behalf.'),
    'delete': ('Close and Delete',
               'The Executor shall request the closure and permanent deletion of this account.'),
    'last_message': ('Deliver Final Message',
                     'The Executor shall deliver the Testator’s final message set out in '
                     'Article {msg_article}.'),
}

# ─── Text styles ──────────────────────────────────────────────────────────────
BODY = ParagraphStyle('Body', fontName='Times-Roman', fontSize=10.5, leading=15.5,
                      textColor=INK, alignment=TA_JUSTIFY)
BODY_LEFT = ParagraphStyle('BodyLeft', parent=BODY, alignment=TA_LEFT)
NOTE = ParagraphStyle('Note', parent=BODY, fontSize=9.5, leading=14, textColor=MUTED)
QUOTE = ParagraphStyle('Quote', fontName='Times-Italic', fontSize=10.5, leading=15.5,
                       textColor=INK, alignment=TA_LEFT)
CELL = ParagraphStyle('Cell', fontName='Times-Roman', fontSize=10, leading=13, textColor=INK)
CELL_BOLD = ParagraphStyle('CellBold', parent=CELL, fontName='Times-Bold')
CELL_SMALL = ParagraphStyle('CellSmall', fontName='Helvetica', fontSize=7.5, leading=10,
                            textColor=MUTED)
TH = ParagraphStyle('TH', fontName='Helvetica-Bold', fontSize=7, leading=9, textColor=FOREST)
LABEL = ParagraphStyle('Label', fontName='Helvetica', fontSize=7.5, leading=10, textColor=MUTED)


# ─── Helpers ──────────────────────────────────────────────────────────────────
def esc(value):
    return escape(str(value or '').strip())


def roman(n):
    out = ''
    for v, s in ((1000, 'M'), (900, 'CM'), (500, 'D'), (400, 'CD'), (100, 'C'), (90, 'XC'),
                 (50, 'L'), (40, 'XL'), (10, 'X'), (9, 'IX'), (5, 'V'), (4, 'IV'), (1, 'I')):
        while n >= v:
            out += s
            n -= v
    return out


def parse_date(raw):
    if not raw:
        return None
    try:
        return datetime.fromisoformat(str(raw).replace('Z', '+00:00'))
    except ValueError:
        return None


def long_date(raw=None):
    d = parse_date(raw) if raw else datetime.now()
    return f"{d.day} {d.strftime('%B %Y')}" if d else '—'


def action_key(asset):
    key = str(asset.get('preferred_action') or '').strip().lower().replace(' ', '_')
    aliases = {'pass_executor': 'pass', 'pass_to_executor': 'pass', 'transfer': 'pass',
               'memorialise': 'pass', 'memorialize': 'pass', 'download': 'pass',
               'deactivate': 'delete'}
    return aliases.get(key, key)


def title_case(value):
    return str(value or '').replace('_', ' ').strip().title()


# ─── Flowables ────────────────────────────────────────────────────────────────
class ArticleHeading(Flowable):
    """'ARTICLE III' eyebrow, the title in serif, and a hairline beneath."""

    def __init__(self, label, title):
        super().__init__()
        self.label, self.title = label, title
        self.height = 14 * mm

    def wrap(self, aw, ah):
        self.width = aw
        return aw, self.height

    def draw(self):
        c = self.canv
        t = c.beginText(0, self.height - 3 * mm)
        t.setFont('Helvetica-Bold', 7.5)
        t.setCharSpace(1.6)
        t.setFillColor(FOREST_LIGHT)
        t.textOut(self.label.upper())
        t.setCharSpace(0)
        c.drawText(t)
        c.setFillColor(FOREST)
        c.setFont('Times-Bold', 14)
        c.drawString(0, self.height - 9.5 * mm, self.title)
        c.setStrokeColor(SAND_DEEP)
        c.setLineWidth(0.6)
        c.line(0, 1 * mm, self.width, 1 * mm)


class TitleBlock(Flowable):
    """Centered title for page one."""

    def __init__(self, name, instrument, date_text):
        super().__init__()
        self.name, self.instrument, self.date_text = name, instrument, date_text
        self.height = 62 * mm

    def wrap(self, aw, ah):
        self.width = aw
        return aw, self.height

    def _spaced(self, text, y, font, size, color, space):
        c = self.canv
        w = c.stringWidth(text, font, size) + space * (len(text) - 1)
        t = c.beginText((self.width - w) / 2, y)
        t.setFont(font, size)
        t.setCharSpace(space)
        t.setFillColor(color)
        t.textOut(text)
        t.setCharSpace(0)
        c.drawText(t)

    def draw(self):
        c = self.canv
        cx = self.width / 2
        top = self.height
        self._spaced('DIGIPASS', top - 4 * mm, 'Helvetica-Bold', 8, FOREST_LIGHT, 3)
        c.setFillColor(FOREST)
        c.setFont('Times-Bold', 27)
        c.drawCentredString(cx, top - 19 * mm, 'Digital Will')
        c.setFont('Times-Italic', 13)
        c.setFillColor(FOREST_MID)
        c.drawCentredString(cx, top - 27 * mm, 'and Estate Declaration of Digital Assets')

        # ornament: rule · diamond · rule
        y = top - 35 * mm
        c.setStrokeColor(SAND_DEEP)
        c.setLineWidth(0.6)
        c.line(cx - 34 * mm, y, cx - 4 * mm, y)
        c.line(cx + 4 * mm, y, cx + 34 * mm, y)
        c.setFillColor(FOREST_LIGHT)
        p = c.beginPath()
        p.moveTo(cx, y + 1.6 * mm)
        p.lineTo(cx + 1.6 * mm, y)
        p.lineTo(cx, y - 1.6 * mm)
        p.lineTo(cx - 1.6 * mm, y)
        p.close()
        c.drawPath(p, fill=1, stroke=0)

        c.setFont('Times-Roman', 11)
        c.setFillColor(MUTED)
        c.drawCentredString(cx, top - 44 * mm, 'of')
        c.setFont('Times-Bold', 15)
        c.setFillColor(INK)
        c.drawCentredString(cx, top - 51 * mm, self.name)
        self._spaced(f'INSTRUMENT NO. {self.instrument}   ·   {self.date_text.upper()}',
                     top - 59 * mm, 'Helvetica', 7, MUTED, 0.8)


class SignatureLine(Flowable):
    """A line to sign on, with a caption and an optional printed name under it."""

    def __init__(self, width, caption, printed=None):
        super().__init__()
        self.w, self.caption, self.printed = width, caption, printed
        self.height = 17 * mm if printed is not None else 13 * mm

    def wrap(self, aw, ah):
        return self.w, self.height

    def draw(self):
        c = self.canv
        y = self.height - 8 * mm
        c.setStrokeColor(INK)
        c.setLineWidth(0.6)
        c.line(0, y, self.w, y)
        t = c.beginText(0, y - 4 * mm)
        t.setFont('Helvetica', 6.8)
        t.setCharSpace(0.9)
        t.setFillColor(MUTED)
        t.textOut(self.caption.upper())
        t.setCharSpace(0)
        c.drawText(t)
        if self.printed:
            c.setFont('Times-Roman', 9.5)
            c.setFillColor(INK)
            c.drawString(0, y - 9 * mm, self.printed)


class SealPlace(Flowable):
    """Dashed circle marking where the notary's seal goes."""

    def __init__(self, diameter=34 * mm):
        super().__init__()
        self.d = diameter

    def wrap(self, aw, ah):
        return self.d, self.d

    def draw(self):
        c = self.canv
        r = self.d / 2
        c.setStrokeColor(SAND_DEEP)
        c.setLineWidth(0.8)
        c.setDash(2, 2)
        c.circle(r, r, r - 0.5, stroke=1, fill=0)
        c.setDash()
        c.setFillColor(MUTED)
        c.setFont('Helvetica', 6.5)
        c.drawCentredString(r, r + 1 * mm, 'OFFICIAL SEAL')
        c.drawCentredString(r, r - 3 * mm, 'OF NOTARY')


# ─── Page furniture ───────────────────────────────────────────────────────────
class NumberedCanvas(canvas.Canvas):
    """Defers page drawing so every footer can say 'Page X of Y'."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._pages = []

    def showPage(self):
        self._pages.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        total = len(self._pages)
        for state in self._pages:
            self.__dict__.update(state)
            self._draw_footer(total)
            super().showPage()
        super().save()

    def _draw_footer(self, total):
        meta = getattr(self, '_will_meta', {})
        y = BORDER_INSET + 7 * mm
        self.saveState()
        self.setStrokeColor(SAND_DEEP)
        self.setLineWidth(0.5)
        self.line(MARGIN_X, y + 4 * mm, PAGE_W - MARGIN_X, y + 4 * mm)
        self.setFont('Helvetica', 7)
        self.setFillColor(MUTED)
        self.drawString(MARGIN_X, y, f"Instrument No. {meta.get('instrument', '')}")
        self.drawCentredString(PAGE_W / 2, y, 'Prepared with DIGIPASS')
        self.drawRightString(PAGE_W - MARGIN_X, y, f'Page {self._pageNumber} of {total}')
        self.restoreState()


def draw_frame(c):
    """Double-rule border, the traditional frame of a formal instrument."""
    c.saveState()
    c.setStrokeColor(FOREST)
    c.setLineWidth(1.1)
    c.rect(BORDER_INSET, BORDER_INSET, PAGE_W - 2 * BORDER_INSET, PAGE_H - 2 * BORDER_INSET)
    c.setStrokeColor(SAND_DEEP)
    c.setLineWidth(0.5)
    gap = 1.6 * mm
    c.rect(BORDER_INSET + gap, BORDER_INSET + gap,
           PAGE_W - 2 * (BORDER_INSET + gap), PAGE_H - 2 * (BORDER_INSET + gap))
    c.restoreState()


def make_page_callbacks(meta):
    def first(c, doc):
        c._will_meta = meta
        draw_frame(c)

    def later(c, doc):
        c._will_meta = meta
        draw_frame(c)
        y = PAGE_H - BORDER_INSET - 10 * mm
        c.saveState()
        c.setFont('Times-Italic', 9)
        c.setFillColor(MUTED)
        c.drawString(MARGIN_X, y, f"Digital Will and Estate Declaration of {meta['name']}")
        t = c.beginText(0, y)
        t.setFont('Helvetica-Bold', 7)
        t.setCharSpace(1.6)
        w = c.stringWidth('DIGIPASS', 'Helvetica-Bold', 7) + 1.6 * 7
        t.setTextOrigin(PAGE_W - MARGIN_X - w, y)
        t.setFillColor(FOREST_LIGHT)
        t.textOut('DIGIPASS')
        t.setCharSpace(0)
        c.drawText(t)
        c.setStrokeColor(SAND_DEEP)
        c.setLineWidth(0.5)
        c.line(MARGIN_X, y - 3 * mm, PAGE_W - MARGIN_X, y - 3 * mm)
        c.restoreState()

    return first, later


# ─── Content builders ─────────────────────────────────────────────────────────
def table_style(header=True):
    cmds = [
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LINEBELOW', (0, 0), (-1, -1), 0.4, SAND),
        ('LINEABOVE', (0, 0), (-1, 0), 0.8, FOREST),
        ('LINEBELOW', (0, -1), (-1, -1), 0.8, FOREST),
    ]
    if header:
        cmds += [('BACKGROUND', (0, 0), (-1, 0), CREAM),
                 ('LINEBELOW', (0, 0), (-1, 0), 0.6, SAND_DEEP),
                 ('TOPPADDING', (0, 0), (-1, 0), 5),
                 ('BOTTOMPADDING', (0, 0), (-1, 0), 5)]
    return TableStyle(cmds)


def section(label_no, title, *flowables):
    """Heading kept with the start of its content; the rest flows freely."""
    head = ArticleHeading(f'Article {roman(label_no)}', title)
    first, rest = (flowables[0], flowables[1:]) if flowables else (Spacer(0, 0), ())
    return [CondPageBreak(45 * mm), KeepTogether([head, Spacer(0, 3 * mm), first]), *rest,
            Spacer(0, 8 * mm)]


def build_story(data, meta):
    user = data.get('user', {})
    assets = data.get('assets') or []
    executors = data.get('executors') or []
    will = data.get('will') or {}
    custom = (will.get('custom_content') or data.get('custom_content') or '').strip()
    name = meta['name']

    messages = [a for a in assets
                if action_key(a) == 'last_message' or str(a.get('final_message') or '').strip()]

    # Article numbers are assigned in order, so none are skipped
    n = iter(range(1, 20))
    art_testator, art_assets, art_exec = next(n), next(n), next(n)
    art_msgs = next(n)
    art_custom = next(n) if custom else None
    art_terms = next(n)

    story = [TitleBlock(name, meta['instrument'], meta['date']), Spacer(0, 6 * mm)]

    story.append(Paragraph(
        f"<b>KNOW ALL PERSONS BY THESE PRESENTS</b> that I, <b>{esc(name)}</b>, a registered "
        f"user of the DIGIPASS digital estate platform (User No. {esc(user.get('id'))}), being of "
        "sound mind and memory, and acting freely and without duress, fraud or undue influence, "
        "do hereby make, publish and declare this instrument to be my Digital Will and Estate "
        "Declaration in respect of my digital assets, and I revoke all earlier declarations of "
        "the same kind made by me on this platform.", BODY))
    story.append(Spacer(0, 9 * mm))

    # Article I: testator
    rows = [
        ('Full legal name', name),
        ('Email address', user.get('email') or '—'),
        ('DIGIPASS user number', 'No. ' + str(user.get('id', '—'))),
        ('Registered on', long_date(user.get('created_at'))),
    ]
    t = Table([[Paragraph(k.upper(), LABEL), Paragraph(esc(v), CELL)] for k, v in rows],
              colWidths=[48 * mm, CONTENT_W - 48 * mm])
    ts = table_style(header=False)
    ts.add('TOPPADDING', (0, 0), (0, -1), 8)
    t.setStyle(ts)
    story += section(art_testator, 'Testator Identification', t)

    # Article II: assets
    intro_assets = Paragraph(
        "I direct that the following digital assets, recorded on the DIGIPASS platform, be dealt "
        "with by my Executor(s) according to the instruction stated against each of them:", BODY)
    if assets:
        head = [Paragraph(h, TH) for h in ('NO.', 'ASSET', 'ACCOUNT', 'INSTRUCTION')]
        body = []
        for i, a in enumerate(assets, 1):
            key = action_key(a)
            label, explain = ACTIONS.get(key, (title_case(key) or 'At the Executor’s discretion', ''))
            explain = explain.replace('{msg_article}', roman(art_msgs))
            cat = title_case(a.get('category'))
            body.append([
                Paragraph(roman(i), CELL),
                [Paragraph(esc(a.get('name') or a.get('platform') or 'Unnamed asset'), CELL_BOLD),
                 Paragraph(esc(cat), CELL_SMALL)] if cat else
                Paragraph(esc(a.get('name') or 'Unnamed asset'), CELL_BOLD),
                Paragraph(esc(a.get('account_username') or '—'), CELL),
                [Paragraph(f'<b>{esc(label)}</b>', CELL),
                 Paragraph(esc(explain), CELL_SMALL)] if explain else Paragraph(esc(label), CELL),
            ])
        t = Table([head] + body, colWidths=[13 * mm, 40 * mm, 44 * mm, CONTENT_W - 97 * mm],
                  repeatRows=1)
        t.setStyle(table_style())
        story += section(art_assets, 'Schedule of Digital Assets', intro_assets,
                         Spacer(0, 4 * mm), t)
    else:
        story += section(art_assets, 'Schedule of Digital Assets', Paragraph(
            "No digital assets were recorded on the DIGIPASS platform at the date of this "
            "instrument.", BODY))

    # Article III: executors
    intro_exec = Paragraph(
        "I appoint the following person(s) as Executor(s) of my digital estate. Each Executor "
        "shall act in good faith and only within the instructions given in this instrument.", BODY)
    if executors:
        head = [Paragraph(h, TH) for h in ('NO.', 'EXECUTOR', 'RELATIONSHIP', 'VERIFICATION')]
        body = []
        for i, e in enumerate(executors, 1):
            status = str(e.get('status') or 'pending').lower()
            body.append([
                Paragraph(roman(i), CELL),
                [Paragraph(esc(e.get('name') or 'Unnamed executor'), CELL_BOLD)] +
                ([Paragraph(esc(e.get('email')), CELL_SMALL)] if e.get('email') else []) +
                ([Paragraph(esc(e.get('phone')), CELL_SMALL)] if e.get('phone') else []),
                Paragraph(esc(title_case(e.get('relationship')) or '—'), CELL),
                Paragraph('Verified' if status == 'verified' else 'Awaiting verification', CELL),
            ])
        t = Table([head] + body, colWidths=[13 * mm, 70 * mm, 36 * mm, CONTENT_W - 119 * mm],
                  repeatRows=1)
        t.setStyle(table_style())
        story += section(art_exec, 'Appointment of Executors', intro_exec, Spacer(0, 4 * mm), t)
    else:
        story += section(art_exec, 'Appointment of Executors', Paragraph(
            "No Executor had been appointed on the DIGIPASS platform at the date of this "
            "instrument.", BODY))

    # Article IV: final messages
    if messages:
        blocks = [Paragraph(
            "I ask that my Executor(s) deliver the following messages as I have written them:",
            BODY), Spacer(0, 4 * mm)]
        for a in messages:
            msg = str(a.get('final_message') or '').strip()
            text = (f'“{esc(msg)}”'.replace('\n', '<br/>') if msg
                    else '<i>No message text was recorded for this asset.</i>')
            q = Table([[[Paragraph(esc(a.get('name') or 'Asset').upper(), TH),
                         Spacer(0, 2 * mm), Paragraph(text, QUOTE)]]],
                      colWidths=[CONTENT_W])
            q.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), CREAM_LIGHT),
                ('LINEBEFORE', (0, 0), (0, -1), 2, FOREST_LIGHT),
                ('LEFTPADDING', (0, 0), (-1, -1), 12), ('RIGHTPADDING', (0, 0), (-1, -1), 12),
                ('TOPPADDING', (0, 0), (-1, -1), 9), ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
            ]))
            blocks += [q, Spacer(0, 3 * mm)]
        story += section(art_msgs, 'Final Messages', *blocks)
    else:
        story += section(art_msgs, 'Final Messages', Paragraph(
            "I have not left any final message to be delivered. My assets are to be dealt with "
            f"solely as set out in Article {roman(art_assets)}.", BODY))

    # Article V (optional): the testator's own words
    if custom:
        paras = [Paragraph(esc(p).replace('\n', '<br/>'), BODY)
                 for p in custom.split('\n\n') if p.strip()]
        spaced = []
        for p in paras:
            spaced += [p, Spacer(0, 3 * mm)]
        story += section(art_custom, 'Personal Declaration', *spaced[:-1])

    # Terms
    terms = [
        "This instrument was prepared with DIGIPASS, a digital estate planning platform, and "
        "records the Testator’s wishes for their digital assets as entered on that platform "
        "on the date shown above.",
        "It is intended to accompany, and not to replace, a will executed in accordance with the "
        "law of the Testator’s jurisdiction. The Testator is advised to obtain independent "
        "legal advice so that these wishes are given legal effect.",
        "Account passwords are deliberately not printed in this instrument. They are held on the "
        "DIGIPASS platform and are made available to the Executor(s) through the DIGIPASS "
        "Executor Portal once access has been granted.",
        "DIGIPASS accepts no liability for the legal validity or enforceability of this "
        "instrument in any jurisdiction.",
    ]
    rows = [[Paragraph(f'{i}.', BODY_LEFT), Paragraph(t_, BODY)] for i, t_ in enumerate(terms, 1)]
    t = Table(rows, colWidths=[8 * mm, CONTENT_W - 8 * mm])
    t.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'TOP'),
                           ('LEFTPADDING', (0, 0), (-1, -1), 0),
                           ('RIGHTPADDING', (0, 0), (-1, -1), 0),
                           ('BOTTOMPADDING', (0, 0), (-1, -1), 5)]))
    story += section(art_terms, 'General Provisions', t)
    story.append(Paragraph('[ The remainder of this page is intentionally left blank. ]',
                           ParagraphStyle('Blank', parent=NOTE, fontName='Times-Italic',
                                          alignment=TA_CENTER)))

    # Execution page
    story += [PageBreak()]
    story += execution_page(name, meta)
    return story


def execution_page(name, meta):
    half = (CONTENT_W - 12 * mm) / 2
    out = [ArticleHeading('Execution', 'Signature and Attestation'), Spacer(0, 4 * mm)]

    out.append(Paragraph(
        f"<b>IN WITNESS WHEREOF</b>, I, <b>{esc(name)}</b>, the Testator, sign my name to this "
        "instrument on this ______ day of ____________________, 20____, and declare that I sign "
        "it willingly as my Digital Will and Estate Declaration, that I execute it as my free and "
        "voluntary act, and that I am of full age and sound mind.", BODY))
    out.append(Spacer(0, 12 * mm))

    def pair(left, right):
        t = Table([[left, right]], colWidths=[half + 12 * mm, half], hAlign='LEFT')
        t.setStyle(TableStyle([('LEFTPADDING', (0, 0), (-1, -1), 0),
                               ('RIGHTPADDING', (0, 0), (0, -1), 12 * mm),
                               ('RIGHTPADDING', (1, 0), (1, -1), 0),
                               ('VALIGN', (0, 0), (-1, -1), 'BOTTOM')]))
        return t

    out.append(pair(SignatureLine(half, 'Signature of Testator', name),
                    SignatureLine(half, 'Date', '')))
    out.append(Spacer(0, 9 * mm))

    # Witnesses
    out.append(Paragraph('<b>WITNESSES</b>', ParagraphStyle(
        'W', fontName='Helvetica-Bold', fontSize=7.5, leading=10, textColor=FOREST)))
    out.append(Spacer(0, 2 * mm))
    out.append(Paragraph(
        "Signed by the Testator in our presence, and then by each of us in the presence of the "
        "Testator and of each other.", NOTE))
    out.append(Spacer(0, 9 * mm))
    for caption in ('Signature of witness', 'Full name', 'Address'):
        out.append(pair(SignatureLine(half, f'{caption} (1)'), SignatureLine(half, f'{caption} (2)')))
        out.append(Spacer(0, 3 * mm))
    out.append(Spacer(0, 6 * mm))

    # Notary
    out.append(Paragraph('<b>NOTARIAL ACKNOWLEDGEMENT</b>', ParagraphStyle(
        'N', fontName='Helvetica-Bold', fontSize=7.5, leading=10, textColor=FOREST)))
    out.append(Spacer(0, 3 * mm))
    notary_text = [
        Paragraph("State / jurisdiction of ______________________", NOTE),
        Spacer(0, 2 * mm),
        Paragraph("County / district of ________________________", NOTE),
        Spacer(0, 4 * mm),
        Paragraph(f"Subscribed, sworn to and acknowledged before me by <b>{esc(name)}</b>, "
                  "the Testator, this ______ day of ____________________, 20____.", NOTE),
        Spacer(0, 10 * mm),
        SignatureLine(CONTENT_W - 50 * mm, 'Notary public — signature and commission no.'),
    ]
    t = Table([[notary_text, SealPlace()]], colWidths=[CONTENT_W - 42 * mm, 42 * mm])
    t.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'TOP'),
                           ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
                           ('LEFTPADDING', (0, 0), (-1, -1), 0),
                           ('RIGHTPADDING', (0, 0), (-1, -1), 0)]))
    out.append(t)
    out.append(Spacer(0, 8 * mm))
    out.append(Paragraph(
        f"Instrument No. {esc(meta['instrument'])} · prepared on {esc(meta['date'])}",
        ParagraphStyle('Cert', parent=CELL_SMALL, alignment=TA_CENTER)))
    return [KeepTogether(out)]


# ─── Entry points ─────────────────────────────────────────────────────────────
def generate_pdf(data):
    user = data.get('user') or {}
    name = str(user.get('full_name') or 'Testator').strip()
    now = datetime.now()
    meta = {
        'name': name,
        'instrument': f"DW-{now.strftime('%Y%m%d')}-U{user.get('id', 0)}",
        'date': long_date(),
    }

    output = BytesIO()
    doc = BaseDocTemplate(
        output, pagesize=A4,
        leftMargin=MARGIN_X, rightMargin=MARGIN_X, topMargin=LATER_TOP, bottomMargin=BOTTOM,
        title=f'Digital Will and Estate Declaration — {name}', author='DIGIPASS',
        subject='Digital Will and Estate Declaration of Digital Assets',
        keywords='digital will, digipass, digital estate')
    first_cb, later_cb = make_page_callbacks(meta)
    first_frame = Frame(MARGIN_X, BOTTOM, CONTENT_W, PAGE_H - FIRST_TOP - BOTTOM, id='first',
                        leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    later_frame = Frame(MARGIN_X, BOTTOM, CONTENT_W, PAGE_H - LATER_TOP - BOTTOM, id='later',
                        leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    doc.addPageTemplates([
        PageTemplate(id='First', frames=[first_frame], onPage=first_cb),
        PageTemplate(id='Later', frames=[later_frame], onPage=later_cb),
    ])
    story = [NextPageTemplate('Later')] + build_story(data, meta)
    doc.build(story, canvasmaker=NumberedCanvas)
    output.seek(0)
    return output


def create_mock_data():
    return {
        'user': {'id': 15, 'full_name': 'Johnathan Q. Public',
                 'email': 'john.public@example.com', 'created_at': '2026-05-09T10:00:00Z'},
        'assets': [
            {'name': 'Instagram', 'category': 'social', 'account_username': '@jqpublic',
             'preferred_action': 'pass', 'final_message': ''},
            {'name': 'Gmail', 'category': 'email', 'account_username': 'john.public@gmail.com',
             'preferred_action': 'last_message',
             'final_message': 'To everyone in my contacts: thank you for the years of letters, '
                              'jokes and arguments. Look after each other.'},
            {'name': 'PayPal', 'category': 'finance', 'account_username': 'john.public@example.com',
             'preferred_action': 'delete', 'final_message': ''},
            {'name': 'Google Drive', 'category': 'storage', 'account_username': 'john.public@gmail.com',
             'preferred_action': 'pass', 'final_message': ''},
            {'name': 'Facebook', 'category': 'social', 'account_username': 'john.q.public',
             'preferred_action': 'last_message',
             'final_message': 'Please post this for me: it was a good life, and you were the best part of it.'},
        ],
        'executors': [
            {'name': 'Jane M. Doe', 'email': 'jane.doe@example.com', 'phone': '+44 7700 900123',
             'relationship': 'spouse', 'status': 'verified', 'access_granted': True},
            {'name': 'Samuel Smith Jr.', 'email': 'sam.smith@example.com',
             'relationship': 'friend', 'status': 'pending', 'access_granted': False},
        ],
        'will': {'custom_content': 'I leave this declaration as a guide for those I trust with '
                                   'my digital life. Be gentle with the photographs.'},
    }


if __name__ == '__main__':
    try:
        if '--test' in sys.argv:
            out = sys.argv[sys.argv.index('--test') + 1] if len(sys.argv) > sys.argv.index('--test') + 1 else 'test_will.pdf'
            with open(out, 'wb') as f:
                f.write(generate_pdf(create_mock_data()).getvalue())
            print(f'{out} generated successfully.')
            sys.exit(0)

        data = json.loads(sys.stdin.read())
        sys.stderr.write(f"Generating will: {len(data.get('assets') or [])} assets, "
                         f"{len(data.get('executors') or [])} executors\n")
        sys.stdout.buffer.write(generate_pdf(data).getvalue())

    except json.JSONDecodeError as e:
        sys.stderr.write(f'JSON parsing error: {e}\n')
        sys.exit(1)
    except ImportError as e:
        sys.stderr.write(f'Import error (missing dependency): {e}\nInstall reportlab: pip install reportlab\n')
        sys.exit(1)
    except Exception as e:
        import traceback
        sys.stderr.write(f'Unexpected error: {e}\n{traceback.format_exc()}\n')
        sys.exit(1)
