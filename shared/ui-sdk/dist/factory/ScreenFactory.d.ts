import { IScreenBuilder } from '../builders/IScreenBuilder.js';
import { IScreen } from '../models/ui.models.js';
import { BaseScreenBuilder } from '../builders/BaseScreenBuilder.js';
export declare class ScreenFactory {
    private builders;
    registerBuilder(screenId: string, builder: IScreenBuilder): void;
    registerBuilders(builders: BaseScreenBuilder[]): void;
    initialize(customBuildersDir?: string): Promise<void>;
    buildScreen(screenId: string, context?: any): Promise<IScreen>;
}
//# sourceMappingURL=ScreenFactory.d.ts.map