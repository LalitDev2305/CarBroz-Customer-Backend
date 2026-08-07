import { IScreen } from '../schema/screen/Screen.js';
import { IScreenBuilder, BuildContext } from './ScreenBuilderContract.js';

export abstract class ScreenBuilder implements IScreenBuilder {
  abstract readonly screenId: string;
  abstract build(context?: BuildContext): Promise<IScreen>;
}

export { ScreenBuilder as BaseScreenBuilder };
