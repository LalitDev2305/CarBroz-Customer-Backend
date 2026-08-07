export interface ActionPayload {
    destination?: string;
    api?: string;
    endpoint?: string;
    [key: string]: any;
}
export interface UIAction {
    type: string;
    targetId?: string;
    payload?: ActionPayload;
}
export interface ChildrenDataProperties {
    text?: string;
    imageUrl?: string;
    icon?: string | Record<string, any>;
    inputType?: string;
    hint?: string;
    showCountryPicker?: boolean;
    defaultCountryCode?: string;
    textColor?: string;
    fontSize?: number;
    font?: string;
    style?: string;
    typography?: string;
    textAlign?: string;
    backgroundColor?: string;
    cornerRadius?: number;
    padding?: string | number;
    width?: string | number;
    height?: string | number;
    contentScale?: string;
    fontWeight?: string;
    marginTop?: number;
    [key: string]: any;
}
