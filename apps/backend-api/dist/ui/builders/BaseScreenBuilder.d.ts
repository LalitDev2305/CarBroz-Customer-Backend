import { IScreen } from '../models/ui.models.js';
import { IScreenBuilder, BuildContext } from './IScreenBuilder.js';
export declare abstract class BaseScreenBuilder implements IScreenBuilder {
    /**
     * The unique identifier for the screen (e.g., 'auth_login').
     * This is used by the ScreenFactory to automatically register the builder.
     */
    abstract readonly screenId: string;
    /**
     * Constructs the full screen layout.
     */
    abstract build(context?: BuildContext): Promise<IScreen>;
}
