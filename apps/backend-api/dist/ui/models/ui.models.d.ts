export interface ActionPayload {
    destination?: string;
    api?: string;
    endpoint?: string;
    [key: string]: any;
}
export interface UIAction {
    type: string;
    payload?: ActionPayload;
}
export interface UIProperties {
    [key: string]: any;
}
export interface IComponent {
    id: string;
    type: string;
    properties?: UIProperties;
    action?: Record<string, UIAction>;
    subComponents?: IComponent[];
    children?: IComponent[];
}
export interface ISection {
    id: string;
    type: string;
    components: IComponent[];
}
export interface ITemplate {
    id: string;
    type: string;
    properties?: UIProperties;
    sections: ISection[];
}
export interface ThemeColor {
    color: string;
    stop: number;
}
export interface ThemeGradient {
    colors: ThemeColor[];
}
export interface UITheme {
    theme: 'light' | 'dark';
    showBackButton?: boolean;
    statusBar?: 'transparent' | 'default';
    backgroundGradient?: ThemeGradient;
}
export interface IScreen {
    screenId: string;
    templateId: string;
    templateType: string;
    template: ITemplate;
    theme?: UITheme;
}
