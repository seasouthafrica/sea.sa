// Renders a CV in the SmartCV template supplied by the programme team:
// a green bar down the left edge, a photo beside the name, letter-spaced
// section headings with a short green rule, and a dated timeline (year and
// ring marker on the left, role and employer on the right).
//
// Geometry is taken from the template PDF: A4 595x842, content margin 41,
// right-hand column at 316.

import { pdfText, serialisePdf, loadPortfolioImage } from './pdf';

const PAGE = { width: 595, height: 842 };
const GREEN = '0.13 0.84 0.46';
const INK = '0.11 0.12 0.13';
const MUTED = '0.42 0.45 0.48';
const BAR_WIDTH = 22;
const LEFT = 41;
const RIGHT_COL = 316;
const CONTENT_RIGHT = 554;
const BOTTOM = 56;

const esc = (value) => pdfText(value).replace(/([\\()])/g, '\\$1');

// PDF has no letter-spacing property on a string, so headings use the Tc
// character-spacing operator the template's own headings rely on.
function text(x, y, value, { size = 9, bold = false, color = INK, spacing = 0 } = {}) {
  const font = bold ? '/F2' : '/F1';
  return `BT ${color} rg ${spacing ? `${spacing} Tc ` : ''}${font} ${size} Tf 1 0 0 1 ${x} ${PAGE.height - y} Tm (${esc(value)}) Tj${spacing ? ' 0 Tc' : ''} ET`;
}

function rect(x, y, w, h, color) {
  return `${color} rg ${x} ${PAGE.height - y - h} ${w} ${h} re f`;
}

// Four bezier arcs — PDF has no circle primitive.
function ring(cx, cy, r, color, lineWidth = 1.4) {
  const k = r * 0.5523;
  const y = PAGE.height - cy;
  return [
    `${color} RG ${lineWidth} w`,
    `${cx + r} ${y} m`,
    `${cx + r} ${y + k} ${cx + k} ${y + r} ${cx} ${y + r} c`,
    `${cx - k} ${y + r} ${cx - r} ${y + k} ${cx - r} ${y} c`,
    `${cx - r} ${y - k} ${cx - k} ${y - r} ${cx} ${y - r} c`,
    `${cx + k} ${y - r} ${cx + r} ${y - k} ${cx + r} ${y} c`,
    'S',
  ].join('\n');
}

function wrap(value, maxChars) {
  const words = pdfText(value).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const word of words) {
    if (line && `${line} ${word}`.length > maxChars) { lines.push(line); line = word; continue; }
    line = line ? `${line} ${word}` : word;
  }
  if (line) lines.push(line);
  return lines;
}

function splitList(value) {
  return String(value || '').split(/[\n,]/).map((item) => item.trim()).filter(Boolean);
}

export async function createCvPdf(cv, { photoUrl } = {}) {
  const photo = photoUrl ? await loadPortfolioImage(photoUrl) : null;

  const pages = [];
  let ops = [];
  let images = [];
  let y = 0;

  const startPage = (withHeader) => {
    ops = [rect(0, 0, BAR_WIDTH, PAGE.height, GREEN)];
    images = [];
    y = withHeader ? 0 : 31;
  };

  const pushPage = () => { pages.push({ ops, images }); };

  const need = (space) => {
    if (y + space <= PAGE.height - BOTTOM) return;
    pushPage();
    startPage(false);
  };

  const heading = (label) => {
    need(42);
    y += 24;
    ops.push(text(LEFT, y, label.toUpperCase(), { size: 9, bold: true, spacing: 2.2 }));
    ops.push(rect(LEFT, y + 6, 26, 2, GREEN));
    y += 20;
  };

  // ── Header ──────────────────────────────────────────────
  startPage(true);
  const textLeft = photo ? 153 : LEFT;
  if (photo) {
    const box = { x: 55, y: 20, size: 85 };
    ops.push(rect(box.x - 4, box.y - 4, box.size + 8, box.size + 8, GREEN));
    images.push({ ...photo, x: box.x, y: box.y, w: box.size, h: box.size });
  }
  ops.push(text(textLeft, 39, 'CURRICULUM VITAE', { size: 6, bold: true, color: GREEN, spacing: 2.6 }));
  ops.push(text(textLeft, 74, (cv.fullName || 'Your name').toUpperCase(), { size: 21, bold: true }));
  ops.push(rect(textLeft, 84, 52, 2.4, GREEN));
  const contact = [cv.location, cv.phone, cv.email, cv.linkedin].filter(Boolean).join('   |   ');
  if (contact) ops.push(text(textLeft, 110, contact, { size: 8, color: MUTED }));
  if (cv.jobTitle) ops.push(text(textLeft, 126, cv.jobTitle, { size: 8.5, bold: true, color: GREEN }));
  // Start below whichever is lower: the photo frame or the last header line.
  y = Math.max(photo ? 116 : 0, cv.jobTitle ? 132 : 114);

  // ── Profile (not in the template, rendered in its style when present) ──
  if (cv.summary && cv.summary.trim()) {
    heading('Profile');
    for (const line of wrap(cv.summary.trim(), 96)) {
      need(14);
      ops.push(text(LEFT, y, line, { size: 8, color: MUTED }));
      y += 12;
    }
    y += 4;
  }

  // ── Skills: two columns with square markers ─────────────
  const skills = splitList(cv.skills);
  if (skills.length) {
    heading('Skills');
    const columnX = [LEFT, 307];
    for (let i = 0; i < skills.length; i += 2) {
      need(24);
      [skills[i], skills[i + 1]].forEach((skill, column) => {
        if (!skill) return;
        const x = columnX[column];
        ops.push(rect(x + 3, y - 6, 7, 7, '0.85 0.72 0.45'));
        ops.push(text(x + 15, y, skill, { size: 8 }));
      });
      y += 22;
    }
    y += 2;
  }

  // ── Timeline sections ───────────────────────────────────
  const timeline = (label, rows) => {
    if (!rows.length) return;
    heading(label);
    rows.forEach((row) => {
      const detail = splitList(row.detail);
      const blockHeight = 34 + detail.length * 11;
      need(blockHeight);
      if (row.dates) ops.push(text(LEFT, y + 4, row.dates, { size: 7, bold: true }));
      ops.push(ring(LEFT + 6, y + 18, 5, GREEN));
      if (row.title) ops.push(text(RIGHT_COL, y + 8, row.title, { size: 9, bold: true }));
      if (row.subtitle) ops.push(text(RIGHT_COL, y + 24, row.subtitle, { size: 7.5, color: MUTED }));
      let lineY = y + 38;
      detail.forEach((point) => {
        wrap(point, 52).forEach((piece, index) => {
          ops.push(text(RIGHT_COL + (index ? 6 : 0), lineY, index ? piece : `- ${piece}`, { size: 7, color: MUTED }));
          lineY += 10;
        });
      });
      y = Math.max(y + 54, lineY + 8);
    });
  };

  timeline('Work experience', (cv.experience || [])
    .filter((row) => row.role || row.employer || row.detail)
    .map((row) => ({ dates: row.dates, title: row.role, subtitle: row.employer, detail: row.detail })));

  timeline('Education', (cv.education || [])
    .filter((row) => row.qualification || row.institution)
    .map((row) => ({ dates: row.dates, title: row.qualification, subtitle: row.institution, detail: '' })));

  // ── References ──────────────────────────────────────────
  const references = splitList(cv.references);
  if (references.length) {
    heading('References');
    references.forEach((item) => {
      need(14);
      ops.push(text(LEFT, y, item, { size: 8, color: MUTED }));
      y += 13;
    });
  }

  pushPage();

  // ── Assemble ────────────────────────────────────────────
  const objects = [];
  const add = (value) => { objects.push(value); return objects.length; };
  const catalogId = add('');
  const pagesId = add('');
  const regularId = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  const boldId = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');

  const pageIds = pages.map((page) => {
    const pageId = add('');
    const xobjects = [];
    const drawn = page.images.map((image, index) => {
      const name = `Im${index + 1}`;
      const imageId = add(`<< /Type /XObject /Subtype /Image /Width ${image.width} /Height ${image.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.data.length} >>\nstream\n${Array.from(image.data, (byte) => String.fromCharCode(byte)).join('')}\nendstream`);
      xobjects.push(`/${name} ${imageId} 0 R`);
      return `q ${image.w} 0 0 ${image.h} ${image.x} ${PAGE.height - image.y - image.h} cm /${name} Do Q`;
    });
    const content = [...page.ops, ...drawn].join('\n');
    const contentId = add(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
    objects[pageId - 1] = `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PAGE.width} ${PAGE.height}] /Resources << /Font << /F1 ${regularId} 0 R /F2 ${boldId} 0 R >> /XObject << ${xobjects.join(' ')} >> >> /Contents ${contentId} 0 R >>`;
    return pageId;
  });

  objects[catalogId - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
  objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;
  return serialisePdf(objects, catalogId);
}

export { CONTENT_RIGHT };
