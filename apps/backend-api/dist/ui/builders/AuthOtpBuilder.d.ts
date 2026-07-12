import { IScreen } from '../models/ui.models.js';
import { BaseScreenBuilder } from './BaseScreenBuilder.js';
import { BuildContext } from './IScreenBuilder.js';
export declare class AuthOtpBuilder extends BaseScreenBuilder {
    readonly screenId = "auth_otp";
    build(context?: BuildContext): Promise<IScreen>;
}
