export * from './public/index.js';
import { Component } from './schema/component/Component.js';
import { SubComponent } from './schema/subcomponent/SubComponent.js';
import { Child } from './schema/child/Child.js';
import { ChildrenData } from './schema/child-data/ChildrenData.js';
import { Template } from './schema/template/Template.js';
export declare class UI {
    static template(id: string, type?: string): Template;
    static component(id: string, type?: string): Component;
    static subcomponent(id: string, type?: string): SubComponent;
    static child(id: string, type?: string): Child;
    static childrenData(id: string, type: string): ChildrenData;
    static text(id: string, text: string): ChildrenData;
    static image(id: string, imageUrl: string): ChildrenData;
    static icon(id: string, iconName: string): ChildrenData;
    static button(id: string, text: string): ChildrenData;
    static input(id: string, inputType: string): ChildrenData;
}
