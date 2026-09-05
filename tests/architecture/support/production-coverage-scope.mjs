import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import ts from 'typescript';

const PRODUCTION_ROOTS = ['apps', 'domains', 'sdui', 'platform', 'foundation'];
const IGNORED_DIRECTORIES = new Set(['node_modules', 'dist', 'coverage', 'generated', '.git']);
const TEST_FILE_PATTERN = /\.(?:test|spec)\.[cm]?tsx?$/;
const TYPESCRIPT_FILE_PATTERN = /\.[cm]?tsx?$/;

function hasDeclareModifier(node) {
  return Boolean(node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.DeclareKeyword));
}

/**
 * Returns true only when a top-level statement emits or owns runtime behavior.
 * Imports with bindings and export declarations are treated as structural module wiring; explicit
 * side-effect-only imports remain executable because their purpose is runtime initialization.
 */
export function statementIsExecutable(statement) {
  if (ts.isImportDeclaration(statement)) return statement.importClause === undefined;
  if (ts.isExportDeclaration(statement)) return false;
  if (ts.isInterfaceDeclaration(statement) || ts.isTypeAliasDeclaration(statement)) return false;
  if (ts.isNamespaceExportDeclaration?.(statement)) return false;

  if (
    ts.isClassDeclaration(statement) ||
    ts.isFunctionDeclaration(statement) ||
    ts.isEnumDeclaration(statement) ||
    ts.isVariableStatement(statement) ||
    ts.isModuleDeclaration(statement)
  ) {
    return !hasDeclareModifier(statement);
  }

  if (ts.isImportEqualsDeclaration(statement)) {
    return !statement.isTypeOnly;
  }

  if (ts.isEmptyStatement(statement)) return false;
  return true;
}

/** Classifies TypeScript source text without executing or importing the target module. */
export function sourceTextIsExecutable(sourceText, fileName = 'source.ts') {
  const scriptKind = fileName.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sourceFile = ts.createSourceFile(fileName, sourceText, ts.ScriptTarget.Latest, true, scriptKind);
  return sourceFile.statements.some(statementIsExecutable);
}

export function fileIsExecutable(file) {
  return sourceTextIsExecutable(fs.readFileSync(file, 'utf8'), file);
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (IGNORED_DIRECTORIES.has(entry.name)) return [];
    const absolute = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
}

function isProductionTypeScriptFile(file, root) {
  const relative = path.relative(root, file).split(path.sep).join('/');
  if (!TYPESCRIPT_FILE_PATTERN.test(relative) || relative.endsWith('.d.ts')) return false;
  if (TEST_FILE_PATTERN.test(relative)) return false;
  if (/(?:^|\/)tests?(?:\/|$)/.test(relative)) return false;
  return true;
}

/**
 * Returns repository-relative executable production TypeScript files for Constitution §49.
 * Generated/type-only/barrel modules are omitted only after AST proof that they own no runtime behavior.
 */
export function findExecutableProductionFiles(root = process.cwd()) {
  return PRODUCTION_ROOTS
    .flatMap((productionRoot) => walk(path.join(root, productionRoot)))
    .filter((file) => isProductionTypeScriptFile(file, root))
    .filter(fileIsExecutable)
    .map((file) => path.relative(root, file).split(path.sep).join('/'))
    .sort();
}

/** Returns non-executable production TypeScript files for architecture-audit evidence. */
export function findStructuralProductionFiles(root = process.cwd()) {
  return PRODUCTION_ROOTS
    .flatMap((productionRoot) => walk(path.join(root, productionRoot)))
    .filter((file) => isProductionTypeScriptFile(file, root))
    .filter((file) => !fileIsExecutable(file))
    .map((file) => path.relative(root, file).split(path.sep).join('/'))
    .sort();
}
