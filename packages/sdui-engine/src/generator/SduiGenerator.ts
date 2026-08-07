import { IScreen } from '../schema/screen/Screen.js';

export class SduiGenerator {
  public static generateJson(screen: IScreen): any {
    return JSON.parse(JSON.stringify(screen, (key, value) => {
      if (value === null || value === undefined) {
        return undefined;
      }
      return value;
    }));
  }
}

export { SduiGenerator as JsonSerializer };
