import { describe, expect, it } from 'vitest';
import type { SduiScreen, SduiTemplate } from '../../sdui/ui-sdk/src/index.js';
import { SduiComponentEntity } from '../../sdui/registry/domain/SduiComponent.js';
import { SduiElementEntity } from '../../sdui/registry/domain/SduiElement.js';
import { SduiGroupEntity } from '../../sdui/registry/domain/SduiGroup.js';
import { SduiScreenEntity } from '../../sdui/registry/domain/SduiScreen.js';
import { SduiSectionEntity } from '../../sdui/registry/domain/SduiSection.js';
import { SduiTemplateEntity } from '../../sdui/registry/domain/SduiTemplate.js';

const createdAt = new Date('2026-02-01T00:00:00.000Z');
const updatedAt = new Date('2026-02-02T00:00:00.000Z');
const schemaJson = { type: 'object' };
const supportedProperties = ['text', 'padding'];
const supportedActions = ['tap'];

const baseNode = {
  id: 1,
  publicId: 'node_public_id',
  name: 'Registry node',
  componentType: 'container',
  schemaJson,
  createdAt,
  updatedAt,
};

describe('SDUI registry domain entities', () => {
  it.each([
    ['COMPONENT', SduiComponentEntity],
    ['ELEMENT', SduiElementEntity],
    ['GROUP', SduiGroupEntity],
    ['SECTION', SduiSectionEntity],
  ] as const)('applies canonical defaults for %s nodes', (nodeLevel, EntityType) => {
    const entity = new EntityType(baseNode);

    expect(entity.id).toBe(1);
    expect(entity.publicId).toBe('node_public_id');
    expect(entity.name).toBe('Registry node');
    expect(entity.nodeLevel).toBe(nodeLevel);
    expect(entity.componentType).toBe('container');
    expect(entity.schemaJson).toBe(schemaJson);
    expect(entity.supportedProperties).toBeUndefined();
    expect(entity.supportedActions).toBeUndefined();
    expect(entity.version).toBe(1);
    expect(entity.status).toBe('ACTIVE');
    expect(entity.createdAt).toBe(createdAt);
    expect(entity.updatedAt).toBe(updatedAt);
  });

  it.each([
    SduiComponentEntity,
    SduiElementEntity,
    SduiGroupEntity,
    SduiSectionEntity,
  ] as const)('preserves explicit registry node version, status and capability metadata', (EntityType) => {
    const entity = new EntityType({
      ...baseNode,
      supportedProperties,
      supportedActions,
      version: 7,
      status: 'DEPRECATED',
    });

    expect(entity.supportedProperties).toBe(supportedProperties);
    expect(entity.supportedActions).toBe(supportedActions);
    expect(entity.version).toBe(7);
    expect(entity.status).toBe('DEPRECATED');
  });

  it('applies screen lifecycle defaults without altering the supplied SDUI layout', () => {
    const layoutJson = { screenId: 'home' } as unknown as SduiScreen;
    const entity = new SduiScreenEntity({
      id: 11,
      publicId: 'screen_public_id',
      screenId: 'home',
      layoutJson,
      createdAt,
      updatedAt,
    });

    expect(entity.id).toBe(11);
    expect(entity.publicId).toBe('screen_public_id');
    expect(entity.screenId).toBe('home');
    expect(entity.targetApp).toBe('CUSTOMER');
    expect(entity.versionNumber).toBe(1);
    expect(entity.status).toBe('DRAFT');
    expect(entity.layoutJson).toBe(layoutJson);
    expect(entity.lockVersion).toBe(1);
    expect(entity.publishedAt).toBeNull();
    expect(entity.publishedBy).toBeNull();
    expect(entity.createdFromVersion).toBeNull();
    expect(entity.changeDescription).toBeNull();
    expect(entity.createdAt).toBe(createdAt);
    expect(entity.updatedAt).toBe(updatedAt);
  });

  it('preserves explicit screen publication and version metadata', () => {
    const layoutJson = { screenId: 'partner_jobs' } as unknown as SduiScreen;
    const publishedAt = new Date('2026-02-03T00:00:00.000Z');
    const entity = new SduiScreenEntity({
      id: 12,
      publicId: 'published_screen',
      screenId: 'partner_jobs',
      targetApp: 'PARTNER',
      versionNumber: 4,
      status: 'PUBLISHED',
      layoutJson,
      lockVersion: 8,
      publishedAt,
      publishedBy: 'admin-1',
      createdFromVersion: 3,
      changeDescription: 'Publish partner jobs v4',
      createdAt,
      updatedAt,
    });

    expect(entity.targetApp).toBe('PARTNER');
    expect(entity.versionNumber).toBe(4);
    expect(entity.status).toBe('PUBLISHED');
    expect(entity.lockVersion).toBe(8);
    expect(entity.publishedAt).toBe(publishedAt);
    expect(entity.publishedBy).toBe('admin-1');
    expect(entity.createdFromVersion).toBe(3);
    expect(entity.changeDescription).toBe('Publish partner jobs v4');
  });

  it('preserves template registry identity and default layout by reference', () => {
    const defaultLayoutJson = { id: 'default_template' } as unknown as SduiTemplate;
    const entity = new SduiTemplateEntity({
      id: 21,
      publicId: 'template_public_id',
      templateId: 'form_template',
      templateType: 'FORM',
      defaultLayoutJson,
      createdAt,
      updatedAt,
    });

    expect(entity.id).toBe(21);
    expect(entity.publicId).toBe('template_public_id');
    expect(entity.templateId).toBe('form_template');
    expect(entity.templateType).toBe('FORM');
    expect(entity.defaultLayoutJson).toBe(defaultLayoutJson);
    expect(entity.createdAt).toBe(createdAt);
    expect(entity.updatedAt).toBe(updatedAt);
  });
});
