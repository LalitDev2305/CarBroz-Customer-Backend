export * from './public/index.js';

// UI Utility Helper
import { Component } from './schema/component/Component.js';
import { SubComponent } from './schema/subcomponent/SubComponent.js';
import { Child } from './schema/child/Child.js';
import { ChildrenData } from './schema/child-data/ChildrenData.js';
import { Template } from './schema/template/Template.js';

export class UI {
  public static template(id: string, type: string = 'default_template_layout'): Template {
    return new Template(id, type);
  }

  public static component(id: string, type: string = id): Component {
    return new Component(id, type);
  }

  public static subcomponent(id: string, type: string = 'default_subcomponent_layout'): SubComponent {
    return new SubComponent(id, type);
  }

  public static child(id: string, type: string = 'default_child_layout'): Child {
    return new Child(id, type);
  }

  public static childrenData(id: string, type: string): ChildrenData {
    return new ChildrenData(id, type);
  }

  public static text(id: string, text: string): ChildrenData {
    return new ChildrenData(id, 'atom_text').setProperties({ text });
  }

  public static image(id: string, imageUrl: string): ChildrenData {
    return new ChildrenData(id, 'atom_image').setProperties({ imageUrl });
  }

  public static icon(id: string, iconName: string): ChildrenData {
    return new ChildrenData(id, 'atom_icon').setProperties({ icon: iconName });
  }

  public static button(id: string, text: string): ChildrenData {
    return new ChildrenData(id, 'atom_button').setProperties({ text });
  }

  public static input(id: string, inputType: string): ChildrenData {
    return new ChildrenData(id, 'atom_input_field').setProperties({ inputType });
  }
}
