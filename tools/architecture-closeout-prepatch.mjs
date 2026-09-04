import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const source = path.join(root, 'apps/api/src/modules/booking/use-cases');
const target = path.join(root, 'domains/booking/application/use-cases');
const publicIndex = path.join(root, 'domains/booking/public/index.ts');

if (fs.existsSync(source)) {
  fs.mkdirSync(target, { recursive: true });
  for (const name of fs.readdirSync(source)) {
    const from = path.join(source, name);
    if (!fs.statSync(from).isFile()) continue;
    fs.renameSync(from, path.join(target, name));
  }
  fs.rmSync(source, { recursive: true, force: true });
}

if (fs.existsSync(target)) {
  let content = fs.readFileSync(publicIndex, 'utf8');
  for (const name of fs.readdirSync(target)) {
    if (!name.endsWith('UseCase.ts') || name.includes('.spec.') || name.includes('.test.')) continue;
    const line = `export * from '../application/use-cases/${name.replace(/\.ts$/, '.js')}';`;
    if (!content.includes(line)) content += `${content.endsWith('\n') ? '' : '\n'}${line}\n`;
  }
  fs.writeFileSync(publicIndex, content);
}
