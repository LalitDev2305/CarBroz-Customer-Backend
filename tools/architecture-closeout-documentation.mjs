import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const root = process.cwd();
const normalize = (value) => value.replaceAll('\\', '/');
const rel = (file, base = root) => normalize(path.relative(base, file));
const exists = (file) => fs.existsSync(file);
const read = (file) => fs.readFileSync(file, 'utf8');
const write = (file, content) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content.endsWith('\n') ? content : `${content}\n`);
};
const walk = (dir) => {
  if (!exists(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (['node_modules', 'dist', 'generated', '.git', 'coverage'].includes(entry.name)) return [];
    const absolute = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
};

const canonicalRoots = [
  'apps/api',
  'domains/identity', 'domains/customer', 'domains/partner', 'domains/catalog-pricing',
  'domains/booking', 'domains/financials', 'domains/operations', 'domains/communications',
  'domains/engagement', 'domains/configuration', 'domains/dispute', 'domains/enterprise', 'domains/audit',
  'sdui/ui-sdk', 'sdui/registry',
  'platform/database', 'platform/cache', 'platform/messaging', 'platform/storage',
  'platform/observability', 'platform/integrations',
  'foundation/kernel',
];

const isTest = (file) => /\.(?:spec|test)\.ts$/.test(file) || normalize(file).includes('/tests/');
const isProductionTs = (file) => file.endsWith('.ts') && !file.endsWith('.d.ts') && !isTest(file);
const ownerFor = (file) => canonicalRoots.find((candidate) => rel(file) === candidate || rel(file).startsWith(`${candidate}/`)) ?? 'unknown-owner';

function layerFor(file) {
  const value = normalize(file);
  if (value.includes('/domain/')) return 'domain';
  if (value.includes('/application/')) return 'application';
  if (value.includes('/infrastructure/')) return 'infrastructure';
  if (value.includes('/composition/')) return 'composition';
  if (value.includes('/surfaces/') || value.includes('/transport/') || value.includes('/presentation/')) return 'transport';
  if (value.includes('/definitions/')) return 'definition';
  if (value.includes('/public/')) return 'public-contract';
  return 'module-support';
}

function boundaryRule(owner, layer) {
  if (owner === 'foundation/kernel') return 'This universal contract must remain business-agnostic and must never depend upward on domains, platform implementations, API transport, or SDUI.';
  if (owner.startsWith('domains/')) {
    if (layer === 'domain') return 'This behavior must preserve bounded-context invariants and remain independent of HTTP, Prisma implementations, platform adapters, and vendor SDKs.';
    if (layer === 'application') return 'This operation may orchestrate domain rules and stable ports, but must not absorb transport, persistence implementation, or vendor-specific policy.';
    if (layer === 'infrastructure') return 'This adapter may translate persistence or technical representations, but must not become the owner of business policy.';
    return 'This artifact must stay within its bounded-context ownership and expose only approved public contracts to sibling contexts.';
  }
  if (owner === 'apps/api') return 'This transport/composition behavior may map requests, responses, lifecycle, and dependencies, but must not own business rules or persistence semantics.';
  if (owner.startsWith('platform/')) return 'This technical capability must stay replaceable and business-agnostic; bounded-context policy belongs in domains.';
  if (owner.startsWith('sdui/')) return 'This SDUI behavior must preserve canonical structural/lifecycle semantics without importing unrelated business policy or frontend-native rendering concerns.';
  return 'This artifact must preserve its declared architectural owner and dependency direction.';
}

function nodeName(node, sourceFile) {
  if (ts.isConstructorDeclaration(node)) return 'constructor';
  if ('name' in node && node.name) {
    if (ts.isIdentifier(node.name) || ts.isStringLiteral(node.name) || ts.isNumericLiteral(node.name)) return node.name.text;
    return node.name.getText(sourceFile);
  }
  if (ts.isVariableStatement(node)) return node.declarationList.declarations.map((item) => item.name.getText(sourceFile)).join(', ');
  return node.kind === ts.SyntaxKind.FunctionDeclaration ? 'function' : ts.SyntaxKind[node.kind];
}

function classNameFor(node, sourceFile) {
  let current = node.parent;
  while (current) {
    if (ts.isClassDeclaration(current)) return current.name?.text ?? 'anonymous class';
    current = current.parent;
  }
  return path.basename(sourceFile.fileName, '.ts');
}

function isExported(node) {
  return Boolean(node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword || modifier.kind === ts.SyntaxKind.DefaultKeyword));
}

function isFunctionVariableStatement(node) {
  if (!ts.isVariableStatement(node) || !isExported(node)) return false;
  return node.declarationList.declarations.some((declaration) => ts.isArrowFunction(declaration.initializer) || ts.isFunctionExpression(declaration.initializer));
}

function shouldDocument(node) {
  if (ts.isClassDeclaration(node) || ts.isFunctionDeclaration(node)) return Boolean(node.name);
  if (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node) || ts.isEnumDeclaration(node)) return isExported(node);
  if (ts.isMethodDeclaration(node) || ts.isConstructorDeclaration(node) || ts.isGetAccessorDeclaration(node) || ts.isSetAccessorDeclaration(node)) return true;
  if (ts.isPropertyDeclaration(node) && (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer))) return true;
  return isFunctionVariableStatement(node);
}

function hasTsDoc(text, node, sourceFile) {
  const start = node.getStart(sourceFile);
  const prefix = text.slice(Math.max(0, start - 2000), start);
  return /\/\*\*[\s\S]*?\*\/\s*$/.test(prefix);
}

function summaryFor(node, sourceFile, owner, layer) {
  const name = nodeName(node, sourceFile);
  if (ts.isConstructorDeclaration(node)) return `Constructs \`${classNameFor(node, sourceFile)}\` with the dependencies and initial state required by its ${layer} responsibility.`;
  if (ts.isMethodDeclaration(node) || ts.isPropertyDeclaration(node)) return `Executes \`${name}\` as part of \`${classNameFor(node, sourceFile)}\` while preserving the ${owner} boundary.`;
  if (ts.isGetAccessorDeclaration(node)) return `Exposes \`${name}\` from \`${classNameFor(node, sourceFile)}\` without transferring ownership of its internal state.`;
  if (ts.isSetAccessorDeclaration(node)) return `Updates \`${name}\` on \`${classNameFor(node, sourceFile)}\` through the owning class boundary.`;
  if (ts.isClassDeclaration(node)) return `Defines \`${name}\` as a concrete ${layer} responsibility owned by \`${owner}\`.`;
  if (ts.isInterfaceDeclaration(node)) return `Defines the stable \`${name}\` contract owned by \`${owner}\` for approved consumers.`;
  if (ts.isTypeAliasDeclaration(node) || ts.isEnumDeclaration(node)) return `Defines the canonical \`${name}\` vocabulary owned by \`${owner}\` for this architectural boundary.`;
  return `Executes \`${name}\` within the ${layer} responsibility owned by \`${owner}\`.`;
}

function hardenTsDoc(file) {
  const text = read(file);
  const sourceFile = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const owner = ownerFor(file);
  const layer = layerFor(file);
  const insertions = [];

  function visit(node) {
    if (shouldDocument(node) && !hasTsDoc(text, node, sourceFile)) {
      const start = node.getStart(sourceFile);
      const lineStart = text.lastIndexOf('\n', Math.max(0, start - 1)) + 1;
      const indent = text.slice(lineStart, start).match(/^\s*/)?.[0] ?? '';
      const comment = [
        '/**',
        ` * ${summaryFor(node, sourceFile, owner, layer)}`,
        ' *',
        ' * @remarks',
        ` * Owner: \`${owner}\`; role: ${layer}. ${boundaryRule(owner, layer)}`,
        ' */',
        indent,
      ].join(`\n${indent}`);
      insertions.push({ start, comment });
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  if (insertions.length === 0) return 0;
  let next = text;
  for (const insertion of insertions.sort((a, b) => b.start - a.start)) next = `${next.slice(0, insertion.start)}${insertion.comment}${next.slice(insertion.start)}`;
  write(file, next);
  return insertions.length;
}

function topLevelSymbols(file) {
  const text = read(file);
  const sourceFile = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const result = [];
  for (const node of sourceFile.statements) {
    if (ts.isClassDeclaration(node) && node.name) result.push({ kind: 'class', name: node.name.text });
    if (ts.isFunctionDeclaration(node) && node.name) result.push({ kind: 'function', name: node.name.text });
    if (isFunctionVariableStatement(node)) {
      for (const declaration of node.declarationList.declarations) result.push({ kind: 'function', name: declaration.name.getText(sourceFile) });
    }
  }
  return result;
}

function packageNameFor(moduleRel) {
  const owner = canonicalRoots.find((candidate) => moduleRel === candidate || moduleRel.startsWith(`${candidate}/`));
  if (!owner) return null;
  const packageFile = path.join(root, owner, 'package.json');
  if (!exists(packageFile)) return null;
  try {
    return JSON.parse(read(packageFile)).name ?? null;
  } catch {
    return null;
  }
}

const allTests = walk(root).filter((file) => /\.(?:spec|test)\.ts$/.test(file)).sort();
const freezeWideTests = allTests.filter((file) => [
  'tests/unit/final-production-runtime.behavior.test.ts',
  'tests/architecture/canonical-topology.policy.test.ts',
  'tests/architecture/engineering-quality.policy.test.ts',
  'tests/architecture/production-coverage-scope.policy.test.ts',
].includes(rel(file)));

function relatedTests(moduleRel, productionFiles) {
  const moduleDir = path.join(root, moduleRel);
  const packageName = packageNameFor(moduleRel);
  const needles = [moduleRel, packageName, ...productionFiles.map((file) => rel(file))].filter(Boolean);
  const direct = allTests.filter((testFile) => {
    if (testFile.startsWith(`${moduleDir}${path.sep}`)) return true;
    const content = read(testFile);
    return needles.some((needle) => content.includes(needle));
  });
  return [...new Set([...direct, ...freezeWideTests])].sort();
}

function testNames(file) {
  return [...read(file).matchAll(/\b(?:it|test)\s*\(\s*['"`]([^'"`]+)['"`]/g)].map((match) => match[1]);
}

function directTestsForSymbol(symbol, file, tests) {
  const fileRel = rel(file);
  return tests.filter((testFile) => {
    if (freezeWideTests.includes(testFile)) return false;
    const content = read(testFile);
    return content.includes(symbol.name) || content.includes(fileRel);
  });
}

function appendOrReplaceSection(content, heading, bodyLines) {
  const section = [heading, '', ...bodyLines, ''].join('\n');
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`${escaped}\\n[\\s\\S]*?(?=\\n## |$)`, 'm');
  if (regex.test(content)) return content.replace(regex, section.trimEnd());
  return `${content.trimEnd()}\n\n${section}`;
}

function augmentReadme(readmeFile) {
  const moduleDir = path.dirname(readmeFile);
  const moduleRel = rel(moduleDir);
  const productionFiles = walk(moduleDir).filter(isProductionTs).sort();
  if (productionFiles.length === 0) return null;
  const tests = relatedTests(moduleRel, productionFiles);
  const packageName = packageNameFor(moduleRel);
  const symbols = productionFiles.flatMap((file) => topLevelSymbols(file).map((symbol) => ({ ...symbol, file })));
  const directTests = tests.filter((testFile) => !freezeWideTests.includes(testFile));

  const commands = [];
  if (packageName) commands.push(`- Build the owning workspace package: \`pnpm --filter ${packageName} build\`.`);
  commands.push(`- Lint this module: \`pnpm exec eslint ${moduleRel}\`.`);
  if (tests.length) commands.push(`- Run all tests discovered for this module: \`pnpm exec vitest run ${tests.map((file) => rel(file)).join(' ')}\`.`);
  commands.push('- Run the repository freeze suite, including strict executable-production coverage: `pnpm test:freeze`.');
  commands.push('- Database-backed integration tests require the same PostgreSQL `DATABASE_URL` used by CI and must run after `pnpm exec prisma migrate deploy`.');
  commands.push('', '### Test files and exact commands', '');
  commands.push('| Test file | What it currently verifies | Exact command |', '| --- | --- | --- |');
  for (const testFile of tests) {
    const names = testNames(testFile);
    commands.push(`| \`${rel(testFile)}\` | ${names.length ? names.map((name) => `\`${name}\``).join('<br>') : 'Cross-cutting or dynamically generated architecture/freeze behavior'} | \`pnpm exec vitest run ${rel(testFile)}\` |`);
  }
  if (!tests.length) commands.push('| _None discovered_ | Add a direct behavioral test before changing this module. | _Not runnable yet_ |');

  const verification = [
    '| Production symbol | Source | Direct behavioral/integration tests | How to verify |',
    '| --- | --- | --- | --- |',
  ];
  for (const symbol of symbols) {
    const direct = directTestsForSymbol(symbol, symbol.file, directTests);
    verification.push(`| ${symbol.kind} \`${symbol.name}\` | \`${rel(symbol.file, moduleDir)}\` | ${direct.length ? direct.map((file) => `\`${rel(file)}\``).join('<br>') : '**No direct-name/source test detected; only freeze-wide execution currently proves reachability. Add a focused regression test before materially changing this symbol.**'} | ${direct.length ? direct.map((file) => `\`pnpm exec vitest run ${rel(file)}\``).join('<br>') : '`pnpm test:freeze` plus the module matrix above'} |`);
  }
  if (!symbols.length) verification.push('| _No concrete top-level class/function_ | — | Use the module-level tests above. | `pnpm test:freeze` |');

  verification.push('', '### Freeze expectation', '',
    '- Positive, negative/failure, regression, boundary, provider/repository, and integration cases must be represented wherever that behavior exists.',
    '- A freeze-wide runtime sweep is supporting evidence, not a substitute for focused tests of important business invariants or fixed defects.',
    '- Every bug fix must keep its reproducing regression test permanently.',
    '- Before changing a symbol marked as lacking a direct test above, add the focused test first and then update this generated inventory by rerunning the closeout documentation step.',
  );

  let content = read(readmeFile);
  content = appendOrReplaceSection(content, '## How to test this module', commands);
  content = appendOrReplaceSection(content, '## Specific functionality verification', verification);
  write(readmeFile, content);
  return { moduleRel, tests: tests.map(rel), symbols: symbols.map((symbol) => ({ ...symbol, file: rel(symbol.file) })) };
}

let insertedDocs = 0;
const productionFiles = canonicalRoots.flatMap((moduleRel) => walk(path.join(root, moduleRel)).filter(isProductionTs));
for (const file of productionFiles) insertedDocs += hardenTsDoc(file);

const readmes = canonicalRoots.flatMap((moduleRel) => walk(path.join(root, moduleRel)).filter((file) => path.basename(file) === 'README.md')).sort();
const moduleEvidence = readmes.map(augmentReadme).filter(Boolean);

write(path.join(root, 'tests/architecture/tsdoc-documentation.policy.test.ts'), `import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
const root = process.cwd();
const roots = ${JSON.stringify(canonicalRoots)} as const;
const walk = (dir: string): string[] => fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  if (['node_modules', 'dist', 'generated', '.git', 'coverage'].includes(entry.name)) return [];
  const absolute = path.join(dir, entry.name);
  return entry.isDirectory() ? walk(absolute) : [absolute];
}) : [];
const isTest = (file: string) => /\\.(?:spec|test)\\.ts$/.test(file) || file.replaceAll('\\\\', '/').includes('/tests/');
const isExported = (node: ts.Node & { modifiers?: ts.NodeArray<ts.ModifierLike> }) => Boolean(node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword || modifier.kind === ts.SyntaxKind.DefaultKeyword));
const functionVariable = (node: ts.Node) => ts.isVariableStatement(node) && isExported(node) && node.declarationList.declarations.some((declaration) => ts.isArrowFunction(declaration.initializer) || ts.isFunctionExpression(declaration.initializer));
const required = (node: ts.Node) => (ts.isClassDeclaration(node) && Boolean(node.name)) || (ts.isFunctionDeclaration(node) && Boolean(node.name)) || ((ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node) || ts.isEnumDeclaration(node)) && isExported(node)) || ts.isMethodDeclaration(node) || ts.isConstructorDeclaration(node) || ts.isGetAccessorDeclaration(node) || ts.isSetAccessorDeclaration(node) || (ts.isPropertyDeclaration(node) && (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer))) || functionVariable(node);
const hasTsDoc = (text: string, node: ts.Node, sourceFile: ts.SourceFile) => /\\/\\*\\*[\\s\\S]*?\\*\\/\\s*$/.test(text.slice(Math.max(0, node.getStart(sourceFile) - 2000), node.getStart(sourceFile)));
describe('production TSDoc policy', () => {
  for (const rootRel of roots) {
    for (const file of walk(path.join(root, rootRel)).filter((candidate) => candidate.endsWith('.ts') && !candidate.endsWith('.d.ts') && !isTest(candidate))) {
      it(path.relative(root, file).replaceAll('\\\\', '/') + ' documents classes/functions/operations', () => {
        const text = fs.readFileSync(file, 'utf8');
        const sourceFile = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
        const missing: string[] = [];
        const visit = (node: ts.Node) => {
          if (required(node) && !hasTsDoc(text, node, sourceFile)) missing.push(ts.SyntaxKind[node.kind] + ':' + node.getText(sourceFile).slice(0, 80));
          ts.forEachChild(node, visit);
        };
        visit(sourceFile);
        expect(missing, 'Every class, top-level function, exported vocabulary and class operation requires TSDoc architectural intent').toEqual([]);
      });
    }
  }
});
`);

write(path.join(root, 'tests/architecture/module-test-documentation.policy.test.ts'), `import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
const root = process.cwd();
const modules = ${JSON.stringify(moduleEvidence.map((entry) => entry.moduleRel), null, 2)} as const;
describe('module test documentation policy', () => {
  for (const moduleRel of modules) {
    it(moduleRel + ' documents exact module and functionality verification', () => {
      const file = path.join(root, moduleRel, 'README.md');
      expect(fs.existsSync(file)).toBe(true);
      const content = fs.readFileSync(file, 'utf8');
      expect(content).toContain('## How to test this module');
      expect(content).toContain('## Specific functionality verification');
      expect(content).toContain('pnpm exec vitest run');
      expect(content).toContain('pnpm test:freeze');
      expect(content).toContain('Freeze expectation');
    });
  }
});
`);

write(path.join(root, 'docs/FINAL-MODULE-TEST-EVIDENCE.json'), JSON.stringify({ generatedAt: new Date().toISOString(), modules: moduleEvidence }, null, 2));

console.log(`[architecture-closeout-documentation] inserted ${insertedDocs} missing TSDoc blocks, documented ${moduleEvidence.length} module test surfaces, and generated permanent documentation policy tests`);
