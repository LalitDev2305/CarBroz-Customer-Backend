import { IScreen, BaseScreenBuilder, BuildContext } from '@carbroz/sdui-engine';
export declare class AuthLoginBuilder extends BaseScreenBuilder {
    readonly screenId = "auth_login";
    build(context?: BuildContext): Promise<IScreen>;
}
