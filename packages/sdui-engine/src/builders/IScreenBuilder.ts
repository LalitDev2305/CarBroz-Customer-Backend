import { IScreen } from '../models/ui.models.js';

export interface BuildContext {
  isLoggedIn: boolean;
  user?: any;
}

export interface IScreenBuilder {
  build(context?: BuildContext): Promise<IScreen>;
}
