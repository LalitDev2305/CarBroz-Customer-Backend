import { ThemeGradient } from '../template/TemplateProperties.js';

export interface UITheme {
  theme?: 'light' | 'dark';
  showBackButton?: boolean;
  statusBar?: 'transparent' | 'default' | string;
  backgroundGradient?: ThemeGradient;
  [key: string]: any;
}

export interface ScreenProperties {
  [key: string]: any;
}
