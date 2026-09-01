import { componentSchema, type SduiComponent } from '../contract/component.schema.js';
import { elementSchema, type SduiElement } from '../contract/element.schema.js';
import { groupSchema, type SduiGroup } from '../contract/group.schema.js';
import { sectionSchema, type SduiSection } from '../contract/section.schema.js';
import { templateSchema, type SduiTemplate } from '../contract/template.schema.js';
import {
  componentRegistry,
  elementRegistry,
  groupRegistry,
  sectionRegistry,
  templateRegistry,
  type InstanceInput,
} from '../catalog/registries.js';

function fromDefinition<T>(registered: boolean, create: () => T, parse: (value: T) => T): T {
  return parse(create());
}

export class ElementFactory {
  static create(type: string, input: InstanceInput): SduiElement {
    if (!elementRegistry.has(type)) throw new Error(`SDUI element '${type}' is not registered`);
    return fromDefinition(true, () => elementRegistry.create(type, input), (value) => elementSchema.parse(value));
  }

  static raw(value: SduiElement): SduiElement { return elementSchema.parse(value); }
}

export class GroupFactory {
  static create(type: string, input: InstanceInput): SduiGroup {
    if (!groupRegistry.has(type)) throw new Error(`SDUI group '${type}' is not registered`);
    return fromDefinition(true, () => groupRegistry.create(type, input), (value) => groupSchema.parse(value));
  }

  static raw(value: SduiGroup): SduiGroup { return groupSchema.parse(value); }
}

export class SectionFactory {
  static create(type: string, input: InstanceInput): SduiSection {
    if (!sectionRegistry.has(type)) throw new Error(`SDUI section '${type}' is not registered`);
    return fromDefinition(true, () => sectionRegistry.create(type, input), (value) => sectionSchema.parse(value));
  }

  static raw(value: SduiSection): SduiSection { return sectionSchema.parse(value); }
}

export class ComponentFactory {
  static create(type: string, input: InstanceInput): SduiComponent {
    if (!componentRegistry.has(type)) throw new Error(`SDUI component '${type}' is not registered`);
    return fromDefinition(true, () => componentRegistry.create(type, input), (value) => componentSchema.parse(value));
  }

  static raw(value: SduiComponent): SduiComponent { return componentSchema.parse(value); }
}

export class TemplateFactory {
  static create(type: string, input: InstanceInput): SduiTemplate {
    if (!templateRegistry.has(type)) throw new Error(`SDUI template '${type}' is not registered`);
    return fromDefinition(true, () => templateRegistry.create(type, input), (value) => templateSchema.parse(value));
  }

  static raw(value: SduiTemplate): SduiTemplate { return templateSchema.parse(value); }
}
