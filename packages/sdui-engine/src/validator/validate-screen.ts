import { screenSchema, type SduiScreen } from '../contract/screen.schema.js';

export function parseSduiScreen(input: unknown): SduiScreen {
  return screenSchema.parse(input);
}

export function isValidSduiScreen(input: unknown): input is SduiScreen {
  return screenSchema.safeParse(input).success;
}
