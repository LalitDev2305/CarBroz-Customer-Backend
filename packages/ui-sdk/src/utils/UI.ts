import { GenericComponent } from '../components/GenericComponent.js';
import { Subcomponent } from '../subcomponents/Subcomponent.js';
import { Child } from '../children/Child.js';
import { ChildrenData } from '../children-data/ChildrenData.js';

export class UI {
  public static component(id: string, type: string = id): GenericComponent {
    return new GenericComponent(id, type);
  }

  public static subcomponent(id: string, type: string = 'default_subcomponent_layout'): Subcomponent {
    return new Subcomponent(id, type);
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
