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
});
