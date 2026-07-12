import { IScreen } from '../models/ui.models.js';
import { BaseScreenBuilder } from './BaseScreenBuilder.js';
import { BuildContext } from './IScreenBuilder.js';
export declare class AuthLoginBuilder extends BaseScreenBuilder {
    readonly screenId = "auth_login";
    build(context?: BuildContext): Promise<IScreen>;
}
