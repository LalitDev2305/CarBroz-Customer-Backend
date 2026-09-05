import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('strict production coverage diagnostics policy', () => {
  it('keeps the 100% coverage gate actionable by reporting only incomplete production files', () => {
    const config = fs.readFileSync(path.join(process.cwd(), 'vitest.config.ts'), 'utf8');

    expect(config).toContain('findExecutableProductionFiles');
    expect(config).toContain('include: executableProductionFiles');
    expect(config).toContain("['text', { skipFull: true }]");
    expect(config).toContain("'json'");
    expect(config).toContain("'html'");
  });

  it('executes CarBroz workspace package imports from the TypeScript source being certified', () => {
    const config = fs.readFileSync(path.join(process.cwd(), 'vitest.config.ts'), 'utf8');

    expect(config).toContain('findWorkspaceSourceAliases');
    expect(config).toContain("packageJson.name?.startsWith('@carbroz/')");
    expect(config).toContain('alias: findWorkspaceSourceAliases()');
    expect(config).toContain("path.join(packageRoot, 'public', 'index.ts')");
    expect(config).toContain("path.join(packageRoot, 'src', 'public', 'index.ts')");
  });
});
