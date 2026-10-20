// Minimal PDF writer shared by the learner portfolio and the CV builder.
// Text is laid out top-down on Letter-size pages; images are embedded as JPEG.
// Every byte is written through a latin1 string, so offsets stay exact.

function pdfText(value) {
  return String(value ?? '')
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, '?');
}

function wrapText(value, max = 86) {
  const words = pdfText(value).split(/\s+/);
  const lines = [];
  let line = '';
  for (let word of words) {
    if (line && `${line} ${word}`.length > max) { lines.push(line); line = ''; }
    while (word.length > max) { if (line) { lines.push(line); line = ''; } lines.push(word.slice(0, max)); word = word.slice(max); }
    line = line ? `${line} ${word}` : word;
  }
  if (line) lines.push(line);
  return lines.length ? lines : [''];
}

function pdfBytes(value) {
  const bytes = new Uint8Array(value.length);
  for (let i = 0; i < value.length; i += 1) bytes[i] = value.charCodeAt(i) & 0xff;
  return bytes;
}

export async function loadPortfolioImage(url) {
  if (!url || typeof createImageBitmap !== 'function') return null;
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const bitmap = await createImageBitmap(await response.blob());
    const scale = Math.min(1, 900 / bitmap.width, 550 / bitmap.height);
    const canvas = window.document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext('2d');
    // JPEG has no alpha: without this, transparent PNG logos flatten onto black.
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const base64 = canvas.toDataURL('image/jpeg', 0.88).split(',')[1];
    const decoded = atob(base64);
    const data = new Uint8Array(decoded.length);
    for (let i = 0; i < decoded.length; i += 1) data[i] = decoded.charCodeAt(i);
    return { data, width: canvas.width, height: canvas.height };
  } catch {
    // Keep the submitted file link in the PDF if the browser cannot embed its preview.
    return null;
  }
}

export function createPdf(lines) {
  const pages = [];
  let page = [];
  let remainingHeight = 700;
  for (const item of lines) {
    if (item.image) {
      const scale = Math.min(500 / item.image.width, 250 / item.image.height);
      const imageHeight = item.image.height * scale + 18;
      if (remainingHeight < imageHeight) { pages.push(page); page = []; remainingHeight = 700; }
      page.push(item);
      remainingHeight -= imageHeight;
    } else {
      for (const line of wrapText(item.text, item.heading ? 64 : 88)) {
        const lineHeight = item.heading ? 24 : 15;
        if (remainingHeight < lineHeight) { pages.push(page); page = []; remainingHeight = 700; }
        page.push({ ...item, text: line });
        remainingHeight -= lineHeight;
      }
    }
    if (item.gap) {
      if (remainingHeight < 15) { pages.push(page); page = []; remainingHeight = 700; }
      page.push({ text: '', size: 10 });
      remainingHeight -= 15;
    }
  }
  if (page.length) pages.push(page);
  const objects = [];
  const add = (value) => { objects.push(value); return objects.length; };
  const catalogId = add('');
  const pagesId = add('');
  const fontId = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  const pageIds = [];
  pages.forEach((pageLines) => {
    const pageId = add('');
    const stream = [];
    const annotations = [];
    const xobjects = [];
    let y = 750;
    for (const item of pageLines) {
      if (item.image) {
        const imageName = `Im${xobjects.length + 1}`;
        const imageId = add(`<< /Type /XObject /Subtype /Image /Width ${item.image.width} /Height ${item.image.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${item.image.data.length} >>\nstream\n${Array.from(item.image.data, (byte) => String.fromCharCode(byte)).join('')}\nendstream`);
        xobjects.push(`/${imageName} ${imageId} 0 R`);
        const scale = Math.min(500 / item.image.width, 250 / item.image.height);
        const width = item.image.width * scale;
        const height = item.image.height * scale;
        stream.push(`q ${width} 0 0 ${height} 50 ${y - height} cm /${imageName} Do Q`);
        y -= height + 18;
        continue;
      }
      const size = item.size || (item.heading ? 14 : 10);
      stream.push(`BT ${item.heading ? '0.02 0.38 0.40' : '0.10 0.18 0.20'} rg /F1 ${size} Tf 1 0 0 1 50 ${y} Tm (${pdfText(item.text).replace(/([\\()])/g, '\\$1')}) Tj ET`);
      if (item.link) {
        const width = Math.min(510, Math.max(20, item.text.length * size * 0.52));
        const uri = pdfText(item.link).replace(/([\\()])/g, '\\$1');
        annotations.push(add(`<< /Type /Annot /Subtype /Link /Rect [50 ${y - 3} ${50 + width} ${y + size + 2}] /Border [0 0 0] /A << /S /URI /URI (${uri}) >> /P ${pageId} 0 R >>`));
      }
      y -= item.heading ? 24 : 15;
    }
    const content = stream.join('\n');
    const contentId = add(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
    objects[pageId - 1] = `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontId} 0 R >> /XObject << ${xobjects.join(' ')} >> >> /Contents ${contentId} 0 R${annotations.length ? ` /Annots [${annotations.map((id) => `${id} 0 R`).join(' ')}]` : ''} >>`;
    pageIds.push(pageId);
  });
  objects[catalogId - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
  objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;
  let output = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => { offsets.push(output.length); output += `${index + 1} 0 obj\n${object}\nendobj\n`; });
  const xrefOffset = output.length;
  output += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => { output += `${String(offset).padStart(10, '0')} 00000 n \n`; });
  output += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return new Blob([pdfBytes(output)], { type: 'application/pdf' });
}
