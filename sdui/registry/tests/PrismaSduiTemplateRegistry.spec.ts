import { describe, expect, it, vi } from 'vitest';
import { PrismaSduiRegistryRepository } from '../infrastructure/repositories/PrismaSduiRegistryRepository.js';

const now = new Date('2026-03-01T00:00:00.000Z');
const template = {
  id: 'template_1',
  type: 'stack_template',
  properties: { orientation: 'vertical' as const },
  components: [
    {
      id: 'component_1',
      type: 'stack_component',
      properties: { orientation: 'vertical' as const },
      elements: [{ id: 'text_1', type: 'text', properties: { text: 'Hello' } }],
    },
  ],
};

function templateRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    publicId: 'template-public-1',
    templateId: 'template_1',
    templateType: 'stack_template',
    defaultLayoutJson: template,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe('Prisma SDUI template registry persistence', () => {
  it('maps existing templates and returns null when no template exists', async () => {
    const client = {
      sduiTemplate: {
        findUnique: vi.fn()
          .mockResolvedValueOnce(templateRecord())
          .mockResolvedValueOnce(null),
      },
    } as any;
    const repository = new PrismaSduiRegistryRepository(client);

    const existing = await repository.getTemplate('template_1');
    expect(existing?.templateId).toBe('template_1');
    expect(existing?.defaultLayoutJson.type).toBe('stack_template');
    await expect(repository.getTemplate('missing_template')).resolves.toBeNull();
  });

  it('validates and maps an upserted canonical template', async () => {
    const upsert = vi.fn(async ({ create }: any) => templateRecord({
      templateId: create.templateId,
      templateType: create.templateType,
      defaultLayoutJson: create.defaultLayoutJson,
    }));
    const client = { sduiTemplate: { upsert } } as any;
    const repository = new PrismaSduiRegistryRepository(client);

    const result = await repository.upsertTemplate('template_1', 'stack_template', template);

    expect(result.templateId).toBe('template_1');
    expect(result.defaultLayoutJson).toEqual(template);
    expect(upsert).toHaveBeenCalledWith({
      where: { templateId: 'template_1' },
      update: { templateType: 'stack_template', defaultLayoutJson: template },
      create: { templateId: 'template_1', templateType: 'stack_template', defaultLayoutJson: template },
    });
  });
});
