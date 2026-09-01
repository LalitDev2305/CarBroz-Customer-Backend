import { describe, expect, it } from 'vitest';
import { SduiComponentEntity, SduiElementEntity, SduiGroupEntity, SduiSectionEntity } from '@carbroz/domain-sdui-registry';

const base = {
  id: 1,
  publicId: 'public-1',
  name: 'node',
  componentType: 'default',
  schemaJson: {},
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

describe('SDUI registry node levels', () => {
  it('uses only canonical V3 node terminology', () => {
    expect(new SduiComponentEntity(base).nodeLevel).toBe('COMPONENT');
    expect(new SduiSectionEntity(base).nodeLevel).toBe('SECTION');
    expect(new SduiGroupEntity(base).nodeLevel).toBe('GROUP');
    expect(new SduiElementEntity(base).nodeLevel).toBe('ELEMENT');
  });
});
