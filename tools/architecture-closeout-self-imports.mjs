import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const root = process.cwd();
const exists = (file) => fs.existsSync(file);
const read = (file) => fs.readFileSync(file, 'utf8');
const write = (file, content) => fs.writeFileSync(file, content.endsWith('\n') ? content : `${content}\n`);
const walk = (dir) => {
  if (!exists(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (['node_modules', 'dist', 'generated', '.git'].includes(entry.name)) return [];
    const absolute = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
};
const relativeImport = (fromFile, toFile) => {
  let specifier = path.relative(path.dirname(fromFile), toFile).replaceAll('\\', '/').replace(/\.ts$/, '.js');
  if (!specifier.startsWith('.')) specifier = `./${specifier}`;
  return specifier;
};
const resolveTsTarget = (packageRoot, packageName, specifier) => {
  if (!specifier.startsWith(`${packageName}/`)) return null;
  const suffix = specifier.slice(packageName.length + 1);
  const candidates = [
    path.join(packageRoot, `${suffix.replace(/\.js$/, '')}.ts`),
    path.join(packageRoot, suffix.replace(/\.js$/, '.ts')),
    path.join(packageRoot, suffix, 'index.ts'),
  ];
  return candidates.find(exists) ?? null;
};

// Deliberately mirror the post-closeout invariant package-root enumeration.
const packageRoots = [];
for (const base of ['apps', 'domains', 'sdui', 'platform', 'foundation']) {
  const baseDir = path.join(root, base);
  if (!exists(baseDir)) continue;
  for (const entry of fs.readdirSync(baseDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const packageRoot = path.join(baseDir, entry.name);
    if (exists(path.join(packageRoot, 'package.json'))) packageRoots.push(packageRoot);
  }
}

const failures = [];
let rewrittenFiles = 0;
let matchedStatements = 0;

for (const packageRoot of packageRoots) {
  const manifest = JSON.parse(read(path.join(packageRoot, 'package.json')));
  const packageName = manifest.name;
  if (!packageName) continue;

  const sourceFiles = walk(packageRoot).filter(
    (file) => file.endsWith('.ts') && !/\.(?:spec|test)\.ts$/.test(file) && !file.includes(`${path.sep}dist${path.sep}`),
  );
  const declarations = new Map();

  for (const file of sourceFiles) {
    const source = ts.createSourceFile(file, read(file), ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    for (const statement of source.statements) {
      let name;
      if (
        (ts.isInterfaceDeclaration(statement) ||
          ts.isClassDeclaration(statement) ||
          ts.isTypeAliasDeclaration(statement) ||
          ts.isEnumDeclaration(statement) ||
          ts.isFunctionDeclaration(statement)) &&
        statement.name
      ) name = statement.name.text;
      if (name) {
        const targets = declarations.get(name) ?? [];
        targets.push(file);
        declarations.set(name, targets);
      }
      if (ts.isVariableStatement(statement)) {
        for (const declaration of statement.declarationList.declarations) {
          if (!ts.isIdentifier(declaration.name)) continue;
          const targets = declarations.get(declaration.name.text) ?? [];
          targets.push(file);
          declarations.set(declaration.name.text, targets);
        }
      }
    }
  }

  const resolveSymbol = (file, symbol) => {
    const candidates = (declarations.get(symbol) ?? []).filter((candidate) => path.resolve(candidate) !== path.resolve(file));
    const nonPublic = candidates.filter((candidate) => !candidate.includes(`${path.sep}public${path.sep}`) && !candidate.endsWith(`${path.sep}index.ts`));
    const usable = nonPublic.length ? nonPublic : candidates;
    if (usable.length !== 1) {
      failures.push(`${path.relative(root, file)} cannot uniquely resolve ${symbol} from ${packageName}; candidates=${usable.map((candidate) => path.relative(root, candidate)).join(',') || 'none'}`);
      return null;
    }
    return usable[0];
  };

  for (const file of sourceFiles) {
    let content = read(file);
    const source = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const replacements = [];

    for (const statement of source.statements) {
      const isImport = ts.isImportDeclaration(statement);
      const isExport = ts.isExportDeclaration(statement);
      if (!isImport && !isExport) continue;
      if (!statement.moduleSpecifier || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
      const specifier = statement.moduleSpecifier.text;
      if (specifier !== packageName && !specifier.startsWith(`${packageName}/`)) continue;
      matchedStatements++;

      const directTarget = resolveTsTarget(packageRoot, packageName, specifier);
      if (directTarget) {
        const quote = statement.moduleSpecifier.getText(source)[0] === '"' ? '"' : "'";
        replacements.push({
          start: statement.moduleSpecifier.getStart(source),
          end: statement.moduleSpecifier.getEnd(),
          text: `${quote}${relativeImport(file, directTarget)}${quote}`,
        });
        continue;
      }

      if (isImport) {
        const clause = statement.importClause;
        if (!clause || clause.name || !clause.namedBindings || !ts.isNamedImports(clause.namedBindings)) {
          failures.push(`${path.relative(root, file)} has unsupported bare self-import: ${statement.getText(source)}`);
          continue;
        }
        const groups = new Map();
        let failed = false;
        for (const element of clause.namedBindings.elements) {
          const sourceName = element.propertyName?.text ?? element.name.text;
          const target = resolveSymbol(file, sourceName);
          if (!target) { failed = true; continue; }
          const parts = groups.get(target) ?? [];
          const alias = element.propertyName ? `${element.propertyName.text} as ${element.name.text}` : element.name.text;
          parts.push(element.isTypeOnly && !clause.isTypeOnly ? `type ${alias}` : alias);
          groups.set(target, parts);
        }
        if (failed) continue;
        const rendered = [...groups.entries()]
          .map(([target, names]) => `import${clause.isTypeOnly ? ' type' : ''} { ${names.join(', ')} } from '${relativeImport(file, target)}';`)
          .join('\n');
        replacements.push({ start: statement.getFullStart(), end: statement.getEnd(), text: rendered });
        continue;
      }

      if (!statement.exportClause || !ts.isNamedExports(statement.exportClause)) {
        failures.push(`${path.relative(root, file)} has unsupported bare self re-export: ${statement.getText(source)}`);
        continue;
      }
      const groups = new Map();
      let failed = false;
      for (const element of statement.exportClause.elements) {
        const sourceName = element.propertyName?.text ?? element.name.text;
        const target = resolveSymbol(file, sourceName);
        if (!target) { failed = true; continue; }
        const parts = groups.get(target) ?? [];
        parts.push(element.propertyName ? `${element.propertyName.text} as ${element.name.text}` : element.name.text);
        groups.set(target, parts);
      }
      if (failed) continue;
      const rendered = [...groups.entries()]
        .map(([target, names]) => `export${statement.isTypeOnly ? ' type' : ''} { ${names.join(', ')} } from '${relativeImport(file, target)}';`)
        .join('\n');
      replacements.push({ start: statement.getFullStart(), end: statement.getEnd(), text: rendered });
    }

    for (const replacement of replacements.sort((a, b) => b.start - a.start)) {
      content = content.slice(0, replacement.start) + replacement.text + content.slice(replacement.end);
    }
    if (replacements.length) {
      write(file, content);
      rewrittenFiles++;
    }
  }
}

if (failures.length) throw new Error(`Canonical self-import resolution failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}`);

const residue = [];
const dependencyPattern = /(?:from\s+|import\s*\(\s*)['"]([^'"]+)['"]/g;
for (const packageRoot of packageRoots) {
  const packageName = JSON.parse(read(path.join(packageRoot, 'package.json'))).name;
  if (!packageName) continue;
  for (const file of walk(packageRoot).filter((candidate) => candidate.endsWith('.ts'))) {
    for (const match of read(file).matchAll(dependencyPattern)) {
      if (match[1] === packageName || match[1].startsWith(`${packageName}/`)) residue.push(`${path.relative(root, file)} -> ${match[1]}`);
    }
  }
}
if (residue.length) throw new Error(`Self-import residue remains after rewrite:\n${residue.map((item) => `- ${item}`).join('\n')}`);

console.log(`[architecture-closeout-self-imports] matched ${matchedStatements} self import/re-export statements and rewrote ${rewrittenFiles} package-internal files; zero residue remains`);
