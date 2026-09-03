import { componentSchema, type SduiComponent } from '../contract/component.schema.js';
import { elementSchema, type SduiElement } from '../contract/element.schema.js';
import { groupSchema, type SduiGroup } from '../contract/group.schema.js';
import { sectionSchema, type SduiSection } from '../contract/section.schema.js';
import { templateSchema, type SduiTemplate } from '../contract/template.schema.js';
import { componentRegistry, elementRegistry, groupRegistry, sectionRegistry, templateRegistry, type InstanceInput } from '../registry/registries.js';

export class ElementFactory {
  static create(type: string, input: InstanceInput): SduiElement {
    return elementSchema.parse(elementRegistry.create(type, input));
  }
  static raw(value: SduiElement): SduiElement { return elementSchema.parse(value); }
}

export class GroupFactory {
  static create(type: string, input: InstanceInput): SduiGroup {
    return groupSchema.parse(groupRegistry.create(type, input));
  }
  static raw(value: SduiGroup): SduiGroup { return groupSchema.parse(value); }
}

export class SectionFactory {
  static create(type: string, input: InstanceInput): SduiSection {
    return sectionSchema.parse(sectionRegistry.create(type, input));
  }
  static raw(value: SduiSection): SduiSection { return sectionSchema.parse(value); }
}

export class ComponentFactory {
  static create(type: string, input: InstanceInput): SduiComponent {
    return componentSchema.parse(componentRegistry.create(type, input));
  }
  static raw(value: SduiComponent): SduiComponent { return componentSchema.parse(value); }
}

export class TemplateFactory {
  static create(type: string, input: InstanceInput): SduiTemplate {
    return templateSchema.parse(templateRegistry.create(type, input));
  }
  static raw(value: SduiTemplate): SduiTemplate { return templateSchema.parse(value); }
}
