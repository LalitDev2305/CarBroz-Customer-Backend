export interface ThemeColor {
  color: string;
  stop: number;
}

export interface ThemeGradient {
  colors: ThemeColor[];
}

export interface TemplateProperties {
  padding?: string | number;
  horizontalAlignment?: string;
  [key: string]: any;
}
