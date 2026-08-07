import { IScreenBuilder } from '../builder/ScreenBuilderContract.js';
import { IScreen } from '../schema/screen/Screen.js';
import { ScreenBuilder } from '../builder/ScreenBuilder.js';
export declare class ScreenFactory {
    registerBuilder(screenId: string, builder: IScreenBuilder): void;
    registerBuilders(builders: ScreenBuilder[]): void;
    buildScreen(screenId: string, context?: any): Promise<IScreen>;
}
