import { UITheme, ScreenProperties } from './ScreenProperties.js';
import { ITemplate } from '../template/Template.js';
import { IComponent } from '../component/Component.js';
import { ISubcomponent } from '../subcomponent/SubComponent.js';
import { IChild } from '../child/Child.js';
import { IChildrenData } from '../child-data/ChildrenData.js';

export interface IScreen {
  screenId: string;
  templateId: string;
  templateType: string;
  template: ITemplate;
  components?: IComponent[];
  subcomponents?: ISubcomponent[];
  children?: IChild[];
  childrenData?: IChildrenData[];
  theme?: UITheme;
  properties?: ScreenProperties;
}
