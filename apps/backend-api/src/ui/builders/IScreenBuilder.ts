import { IScreen } from '../models/ui.models.js';

export interface BuildContext {
  isLoggedIn: boolean;
  user?: any; // To be typed later when Postgres model is ready
}

export interface IScreenBuilder {
  build(context?: BuildContext): Promise<IScreen>;
}
