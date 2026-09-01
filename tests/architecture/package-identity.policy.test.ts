import { readFileSync } from 'node:fs';
import { globSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Placeholder policy test file kept intentionally small until package-identity
// migration is complete. The final implementation will enumerate workspace
// manifests and reject duplicate package names.
describe('workspace package identity policy', () => {
  it('reserves one canonical SDUI package name', () => {
    const manifest = JSON.parse(readFileSync('packages/sdui-engine/package.json', 'utf8')) as { name?: string };
    expect(manifest.name).toBe('@carbroz/sdui-engine');
  });
});
