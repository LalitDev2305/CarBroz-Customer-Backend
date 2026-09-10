import { describe, expect, it, vi } from 'vitest';
import { CompareSduiVersionsUseCase, SduiScreenEntity } from '../public/index.js';

describe('SDUI Registry hierarchy comparison', () => {
  it('counts section elements and grouped elements through the canonical hierarchy', async () => {
    const sourceLayout = {
      screenId: 'hierarchy_compare',
      schemaVersion: '3.0.0',
      targetApp: 'PARTNER' as const,
      template: {
        id: 'source_template',
        type: 'stack_template',
        components: [
          {
            id: 'source_component',
            type: 'stack_component',
            elements: [{ id: 'source_text', type: 'text', properties: { text: 'Source' } }],
          },
        ],
      },
    };

    const targetLayout = {
      screenId: 'hierarchy_compare',
      schemaVersion: '3.0.0',
      targetApp: 'PARTNER' as const,
      template: {
        id: 'target_template',
        type: 'stack_template',
        components: [
          {
            id: 'target_component',
            type: 'stack_component',
            sections: [
              {
                id: 'direct_section',
                type: 'stack_section',
                elements: [{ id: 'direct_text', type: 'text', properties: { text: 'Direct' } }],
              },
              {
                id: 'grouped_section',
                type: 'stack_section',
                groups: [
                  {
                    id: 'content_group',
                    type: 'stack_group',
                    elements: [{ id: 'group_text', type: 'text', properties: { text: 'Grouped' } }],
                  },
                ],
              },
            ],
          },
        ],
      },
    };

    const entity = (versionNumber: number, layoutJson: unknown) => new SduiScreenEntity({
      id: versionNumber,
      publicId: `uuid-${versionNumber}`,
      screenId: 'hierarchy_compare',
      targetApp: 'PARTNER',
      versionNumber,
      status: versionNumber === 1 ? 'ARCHIVED' : 'PUBLISHED',
      layoutJson,
      lockVersion: 1,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    });

    const sourceVersion = entity(1, sourceLayout);
    const targetVersion = entity(2, targetLayout);
    const repository = {
      getSpecificVersion: vi.fn((_screenId: string, _targetApp: string, version: number) =>
        Promise.resolve(version === 1 ? sourceVersion : targetVersion)),
    } as any;

    const result = await new CompareSduiVersionsUseCase(repository).execute({
      screenId: 'hierarchy_compare',
      targetApp: 'PARTNER',
      sourceVersion: 1,
      targetVersion: 2,
    });

    expect(result.comparisonSummary).toMatchObject({
      isIdentical: false,
      templateTypeChanged: false,
      componentsCountDelta: 0,
      sectionsCountDelta: 2,
      groupsCountDelta: 1,
      elementsCountDelta: 1,
    });
  });
});
