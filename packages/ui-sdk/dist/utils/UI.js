import { GenericComponent } from '../components/GenericComponent.js';
import { Subcomponent } from '../subcomponents/Subcomponent.js';
import { Child } from '../children/Child.js';
import { ChildrenData } from '../children-data/ChildrenData.js';
export class UI {
    static component(id, type = id) {
        return new GenericComponent(id, type);
    }
    static subcomponent(id, type = 'default_subcomponent_layout') {
        return new Subcomponent(id, type);
    }
    static child(id, type = 'default_child_layout') {
        return new Child(id, type);
    }
    static childrenData(id, type) {
        return new ChildrenData(id, type);
    }
    static text(id, text) {
        return new ChildrenData(id, 'atom_text').setProperties({ text });
    }
    static image(id, imageUrl) {
        return new ChildrenData(id, 'atom_image').setProperties({ imageUrl });
    }
    static icon(id, iconName) {
        return new ChildrenData(id, 'atom_icon').setProperties({ icon: iconName });
    }
    static button(id, text) {
        return new ChildrenData(id, 'atom_button').setProperties({ text });
    }
    static input(id, inputType) {
        return new ChildrenData(id, 'atom_input_field').setProperties({ inputType });
    }
}
//# sourceMappingURL=UI.js.map