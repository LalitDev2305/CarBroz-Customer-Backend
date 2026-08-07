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

export interface IChildrenData {
  id: string;
  type: string;
  properties?: UIProperties;
  action?: UIAction | Record<string, UIAction>;
  analytics?: Record<string, any>;
  [key: string]: any;
}

export interface IChild {
  id: string;
  type: string;
  properties?: UIProperties;
  childrenData?: IChildrenData[];
  [key: string]: any;
}

export interface ISubcomponent {
  id: string;
  type: string;
  properties?: UIProperties;
  children?: IChild[];
  [key: string]: any;
}

export interface IComponent {
  id: string;
  type: string;
  properties?: UIProperties;
  action?: UIAction | Record<string, UIAction>;
  subComponents?: ISubcomponent[];
  subcomponents?: ISubcomponent[];
  children?: IChild[];
  childrenData?: IChildrenData[];
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
  [key: string]: any;
}

export interface ITheme extends UITheme {}

export interface IScreen {
  screenId: string;
  templateId: string;
  templateType: string;
  template: ITemplate;
  theme?: UITheme;
}
