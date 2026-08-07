export * from './public/index.js';
// UI Utility Helper
import { Component } from './schema/component/Component.js';
import { SubComponent } from './schema/subcomponent/SubComponent.js';
import { Child } from './schema/child/Child.js';
import { ChildrenData } from './schema/child-data/ChildrenData.js';
import { Template } from './schema/template/Template.js';
export class UI {
    static template(id, type = 'default_template_layout') {
        return new Template(id, type);
    }
    static component(id, type = id) {
        return new Component(id, type);
    }
    static subcomponent(id, type = 'default_subcomponent_layout') {
        return new SubComponent(id, type);
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
//# sourceMappingURL=index.js.map