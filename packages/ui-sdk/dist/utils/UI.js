import { GenericComponent } from '../components/GenericComponent.js';
export class UI {
    static component(id, type = id) {
        return new GenericComponent(id, type);
    }
    static child(id, type = 'default_child_layout') {
        return new GenericComponent(id, type);
    }
    static text(id, text) {
        return new GenericComponent(id, 'text').setProperties({ text });
    }
    static image(id, imageUrl) {
        return new GenericComponent(id, 'image').setProperties({ imageUrl });
    }
    static icon(id, iconName) {
        return new GenericComponent(id, 'icon').setProperties({ icon: iconName });
    }
    static button(id, text) {
        return new GenericComponent(id, 'button').setProperties({ text });
    }
    static input(id, inputType) {
        return new GenericComponent(id, 'input_field').setProperties({ inputType });
    }
}
//# sourceMappingURL=UI.js.map