import { IScreen, BaseScreenBuilder, BuildContext } from '@carbroz/sdui-engine';
export declare class AuthOtpBuilder extends BaseScreenBuilder {
    readonly screenId = "auth_otp";
    build(context?: BuildContext): Promise<IScreen>;
}
