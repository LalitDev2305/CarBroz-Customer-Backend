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

const packageRoots = [];
for (const base of ['apps', 'domains', 'sdui', 'platform', 'foundation']) {
  const baseDir = path.join(root, base);
  if (!exists(baseDir)) continue;
  for (const candidate of walk(baseDir).filter((file) => path.basename(file) === 'package.json')) {
    packageRoots.push(path.dirname(candidate));
  }
}

const failures = [];
let rewrittenFiles = 0;

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
      ) {
        name = statement.name.text;
      }
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

  for (const file of sourceFiles) {
    let content = read(file);
    const source = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const replacements = [];

    for (const statement of source.statements) {
      if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
      const specifier = statement.moduleSpecifier.text;
      if (specifier !== packageName) continue;

      const clause = statement.importClause;
      if (!clause || clause.name || !clause.namedBindings || !ts.isNamedImports(clause.namedBindings)) {
        failures.push(`${path.relative(root, file)} has unsupported self-import: ${statement.getText(source)}`);
        continue;
      }

      const groups = new Map();
      let importFailed = false;
      for (const element of clause.namedBindings.elements) {
        const sourceName = element.propertyName?.text ?? element.name.text;
        const candidates = (declarations.get(sourceName) ?? []).filter((candidate) => path.resolve(candidate) !== path.resolve(file));
        const preferred = candidates.filter((candidate) => !candidate.includes(`${path.sep}public${path.sep}`));
        const usable = preferred.length ? preferred : candidates;
        if (usable.length !== 1) {
          failures.push(
            `${path.relative(root, file)} cannot uniquely resolve ${sourceName} from ${packageName}; candidates=${usable.map((candidate) => path.relative(root, candidate)).join(',') || 'none'}`,
          );
          importFailed = true;
          continue;
        }
        const target = usable[0];
        const parts = groups.get(target) ?? [];
        const alias = element.propertyName ? `${element.propertyName.text} as ${element.name.text}` : element.name.text;
        parts.push(element.isTypeOnly && !clause.isTypeOnly ? `type ${alias}` : alias);
        groups.set(target, parts);
      }
      if (importFailed) continue;

      const rendered = [...groups.entries()]
        .map(([target, names]) => `import${clause.isTypeOnly ? ' type' : ''} { ${names.join(', ')} } from '${relativeImport(file, target)}';`)
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

if (failures.length) {
  throw new Error(`Canonical self-import resolution failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}`);
}

console.log(`[architecture-closeout-self-imports] rewrote ${rewrittenFiles} package-internal files to local declarations`);
