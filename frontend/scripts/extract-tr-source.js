const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const storePath = path.join(ROOT, 'src', 'store', 'languageStore.ts');
let content = fs.readFileSync(storePath, 'utf8').replace(/\r\n/g, '\n');
const start = content.indexOf('  tr: {');
let end = content.indexOf('  },\n\n  en: {', start);
if (end === -1) end = content.indexOf('  en: {', start);
const block = content.slice(start + 7, end);
const tr = {};
const lineRe = /^\s*'((?:[^'\\]|\\.)*)'\s*:\s*'((?:[^'\\]|\\.)*)'\s*,?\s*$/;
block.split('\n').forEach((line) => {
  const m = line.match(lineRe);
  if (m) tr[m[1].replace(/\\'/g, "'")] = m[2].replace(/\\'/g, "'").replace(/\\n/g, '\n');
});
const outDir = path.join(ROOT, 'public', 'locales');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'tr-source.json'), JSON.stringify(tr, null, 0), 'utf8');
console.log('Keys:', Object.keys(tr).length);
