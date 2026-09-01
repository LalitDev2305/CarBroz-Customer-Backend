import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('workspace package identity policy', () => {
  it('reserves the canonical SDUI package identities', () => {
    const uiSdk = JSON.parse(readFileSync('sdui/ui-sdk/package.json', 'utf8')) as { name?: string };
    const registry = JSON.parse(readFileSync('sdui/registry/package.json', 'utf8')) as { name?: string };

    expect(uiSdk.name).toBe('@carbroz/ui-sdk');
    expect(registry.name).toBe('@carbroz/sdui-registry');
  });
});
