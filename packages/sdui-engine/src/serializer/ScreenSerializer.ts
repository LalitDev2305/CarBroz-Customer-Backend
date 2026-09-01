import { screenSchema, type SduiScreen } from '../contract/screen.schema.js';

export class ScreenSerializer {
  static serialize(screen: SduiScreen): string {
    return JSON.stringify(screenSchema.parse(screen));
  }

  static deserialize(json: string): SduiScreen {
    return screenSchema.parse(JSON.parse(json));
  }
}
