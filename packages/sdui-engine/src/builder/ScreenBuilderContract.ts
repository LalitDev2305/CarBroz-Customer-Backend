import { IScreen } from '../schema/screen/Screen.js';

export interface BuildContext {
  isLoggedIn: boolean;
  user?: any;
  [key: string]: any;
}

export interface IScreenBuilder {
  readonly screenId: string;
  build(context?: BuildContext): Promise<IScreen>;
}
