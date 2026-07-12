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

export interface UIProperties {
  [key: string]: any;
}

export interface IComponent {
  id: string;
  type: string;
  properties?: UIProperties;
  action?: UIAction | Record<string, UIAction>;
  subComponents?: IComponent[];
  subcomponents?: IComponent[];
  children?: IComponent[];
  childrenData?: any[];
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
  sections?: ISection[];
  components?: IComponent[];
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
