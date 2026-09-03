import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(absolute));
    else out.push(absolute);
  }
  return out;
}

function splitNamedSymbolImport(text, sourcePackage, symbol, targetPackage) {
  const escapedSource = sourcePackage.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const rx = new RegExp(`import\\s+(type\\s+)?\\{([^}]*)\\}\\s+from\\s+['\"]${escapedSource}['\"];?`, 'g');
  return text.replace(rx, (all, wholeType, body) => {
    const tokens = body.split(',').map((token) => token.trim()).filter(Boolean);
    const moved = [];
    const retained = [];
    for (const token of tokens) {
      const normalized = token.replace(/^type\s+/, '').split(/\s+as\s+/)[0].trim();
      (normalized === symbol ? moved : retained).push(token);
    }
    if (!moved.length) return all;
    const lines = [];
    if (retained.length) lines.push(`import ${wholeType ?? ''}{ ${retained.join(', ')} } from '${sourcePackage}';`);
    lines.push(`import ${wholeType ?? ''}{ ${moved.join(', ')} } from '${targetPackage}';`);
    return lines.join('\n');
  });
}

for (const file of walk(root).filter((x) => /\.(?:ts|mts|cts)$/.test(x) && !x.includes(`${path.sep}dist${path.sep}`))) {
  let text = fs.readFileSync(file, 'utf8');
  text = splitNamedSymbolImport(text, '@carbroz/domain-financials', 'Money', '@carbroz/foundation-kernel');
  fs.writeFileSync(file, text);
}

console.log('Backend V3 relocated symbol ownership finalized.');
