import { IScreenBuilder } from '../builders/IScreenBuilder.js';
import { IScreen } from '../models/ui.models.js';
export declare class ScreenFactory {
    private builders;
    /**
     * Dynamically loads all builder classes from the builders directory,
     * completely eliminating the need to manually register new screens.
     */
    initialize(): Promise<void>;
    registerBuilder(screenId: string, builder: IScreenBuilder): void;
    buildScreen(screenId: string, context?: any): Promise<IScreen>;
}
