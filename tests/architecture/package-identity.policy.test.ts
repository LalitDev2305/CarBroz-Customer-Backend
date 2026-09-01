import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('workspace package identity policy', () => {
  it('reserves one canonical SDUI package name', () => {
    const manifest = JSON.parse(readFileSync('packages/sdui-engine/package.json', 'utf8')) as { name?: string };
    expect(manifest.name).toBe('@carbroz/sdui-engine');
  });
});
