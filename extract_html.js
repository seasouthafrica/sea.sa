const fs = require('fs');
const path = require('path');

const logPath = 'C:\\Users\\Administrator\\.codex\\attachments\\3e3e923b-f082-4fa4-b437-ed27b9a02f8d\\pasted-text.txt';
const targetPath = 'C:\\Users\\Administrator\\Desktop\\SEA Website\\index.html';

try {
  const fileContent = fs.readFileSync(logPath, 'utf8');
  const lines = [fileContent];

  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    if (!line.trim()) continue;
    if (line.includes('<!DOCTYPE html>')) {
      try {
        const data = JSON.parse(line);
        const content = typeof data.content === 'string' ? data.content : line;
        const docIdx = content.indexOf('<!DOCTYPE html>');
        if (docIdx !== -1) {
          const html = content.slice(docIdx);
          fs.writeFileSync(targetPath, html, 'utf8');
          console.log(`SUCCESS: Wrote index.html (${html.length} bytes)`);
          process.exit(0);
        }
      } catch (e) {
        // Fallback string manipulation if JSON parse fails
        const docIdx = line.indexOf('<!DOCTYPE html>');
        if (docIdx !== -1) {
          let rawHtml = line;
          fs.writeFileSync(targetPath, rawHtml, 'utf8');
          console.log(`SUCCESS_FALLBACK: Wrote index.html (${rawHtml.length} bytes)`);
          process.exit(0);
        }
      }
    }
  }
  console.log('HTML string not found in transcript_full.jsonl');
} catch (err) {
  console.error('Error processing transcript:', err);
}
