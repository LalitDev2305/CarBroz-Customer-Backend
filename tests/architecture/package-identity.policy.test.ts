import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('workspace package identity policy', () => {
  it('reserves the canonical SDUI package identities and retires ui-sdk', () => {
    const engine = JSON.parse(readFileSync('sdui/engine/package.json', 'utf8')) as { name?: string };
    const registry = JSON.parse(readFileSync('sdui/registry/package.json', 'utf8')) as { name?: string };

    expect(engine.name).toBe('@carbroz/sdui-engine');
    expect(registry.name).toBe('@carbroz/sdui-registry');
    expect(existsSync('sdui/ui-sdk')).toBe(false);
  });
});
