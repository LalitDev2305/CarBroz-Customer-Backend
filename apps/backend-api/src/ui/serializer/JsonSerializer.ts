import { IScreen } from '../models/ui.models.js';

export class JsonSerializer {
  public static serialize(screen: IScreen): any {
    // Basic null/undefined filtering
    return JSON.parse(JSON.stringify(screen, (key, value) => {
      if (value === null || value === undefined) {
        return undefined;
      }
      return value;
    }));
  }
}
