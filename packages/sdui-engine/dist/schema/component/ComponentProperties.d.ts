export interface ComponentProperties {
    width?: string | number;
    height?: string | number;
    padding?: number | string;
    margin?: number | string;
    marginTop?: number;
    marginHorizontal?: number;
    backgroundColor?: string;
    backgroundGradient?: any;
    cornerRadius?: number;
    elevation?: number;
    borderWidth?: number;
    borderColor?: string;
    title?: string;
    [key: string]: any;
}
