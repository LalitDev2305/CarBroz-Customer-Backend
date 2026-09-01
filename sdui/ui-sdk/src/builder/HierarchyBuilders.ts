import type { SduiComponent } from '../contract/component.schema.js';
import type { SduiElement } from '../contract/element.schema.js';
import type { SduiGroup } from '../contract/group.schema.js';
import type { SduiSection } from '../contract/section.schema.js';
import type { SduiTemplate } from '../contract/template.schema.js';
import { componentSchema } from '../contract/component.schema.js';
import { groupSchema } from '../contract/group.schema.js';
import { sectionSchema } from '../contract/section.schema.js';
import { templateSchema } from '../contract/template.schema.js';

interface NodeBase { id: string; type: string; properties?: Record<string, unknown>; }

export class GroupBuilder {
  private readonly elements: SduiElement[] = [];
  constructor(private readonly base: NodeBase) {}
  addElement(element: SduiElement): this { this.elements.push(element); return this; }
  build(): SduiGroup { return groupSchema.parse({ ...this.base, elements: this.elements }); }
}

export class SectionBuilder {
  private readonly elements: SduiElement[] = [];
  private readonly groups: SduiGroup[] = [];
  constructor(private readonly base: NodeBase) {}

  addElement(element: SduiElement): this {
    if (this.groups.length) throw new Error('Section cannot contain both elements and groups');
    this.elements.push(element); return this;
  }

  addGroup(group: SduiGroup): this {
    if (this.elements.length) throw new Error('Section cannot contain both elements and groups');
    this.groups.push(group); return this;
  }

  build(): SduiSection {
    const content = this.groups.length ? { groups: this.groups } : { elements: this.elements };
    return sectionSchema.parse({ ...this.base, ...content });
  }
}

export class ComponentBuilder {
  private readonly elements: SduiElement[] = [];
  private readonly sections: SduiSection[] = [];
  constructor(private readonly base: NodeBase) {}

  addElement(element: SduiElement): this {
    if (this.sections.length) throw new Error('Component cannot contain both elements and sections');
    this.elements.push(element); return this;
  }

  addSection(section: SduiSection): this {
    if (this.elements.length) throw new Error('Component cannot contain both elements and sections');
    this.sections.push(section); return this;
  }

  build(): SduiComponent {
    const content = this.sections.length ? { sections: this.sections } : { elements: this.elements };
    return componentSchema.parse({ ...this.base, ...content });
  }
}

export class TemplateBuilder {
  private readonly components: SduiComponent[] = [];
  constructor(private readonly base: NodeBase) {}
  addComponent(component: SduiComponent): this { this.components.push(component); return this; }
  build(): SduiTemplate { return templateSchema.parse({ ...this.base, components: this.components }); }
}
