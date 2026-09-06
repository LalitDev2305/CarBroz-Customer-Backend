import { screenSchema, type SduiScreen } from '../contract/screen.schema.js';

/** parseSduiScreen is an exported sdui/ui-sdk contract/implementation; see the owning README for lifecycle and extension rules. */
export function parseSduiScreen(input: unknown): SduiScreen {
  return screenSchema.parse(input);
}

/** isValidSduiScreen is an exported sdui/ui-sdk contract/implementation; see the owning README for lifecycle and extension rules. */
export function isValidSduiScreen(input: unknown): input is SduiScreen {
  return screenSchema.safeParse(input).success;
}
