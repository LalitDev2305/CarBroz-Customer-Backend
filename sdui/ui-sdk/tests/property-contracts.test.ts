import { describe, expect, it } from 'vitest';
import {
  orientationSchema,
  edgeInsetsSchema,
  backgroundSchema,
  stackTemplatePropertiesSchema,
  stackComponentPropertiesSchema,
  stackSectionPropertiesSchema,
  stackGroupPropertiesSchema,
  textPropertiesSchema,
  inputPropertiesSchema,
  buttonPropertiesSchema,
} from '../src/public/index.js';

describe('SDUI Phase B property contracts', () => {
  it('validates reusable atomic layout and appearance vocabulary', () => {
    expect(orientationSchema.parse('vertical')).toBe('vertical');
    expect(edgeInsetsSchema.parse({ start: 24, top: 20, end: 24, bottom: 20 })).toEqual({ start: 24, top: 20, end: 24, bottom: 20 });
    expect(backgroundSchema.parse({ type: 'linearGradient', angle: 90, colors: [{ color: '#28CBC7', stop: 0 }, { color: '#10B6B3', stop: 1 }] })).toBeTruthy();
  });

  it('accepts current stack property shapes without one global StackProperties schema', () => {
    const values = {
      orientation: 'vertical',
      verticalArrangement: { type: 'spacedBy', spacing: 16 },
      horizontalAlignment: 'center',
      fillMaxWidth: true,
      padding: { start: 24, top: 20, end: 24, bottom: 20 },
    } as const;
    expect(stackTemplatePropertiesSchema.safeParse(values).success).toBe(true);
    expect(stackComponentPropertiesSchema.safeParse(values).success).toBe(true);
    expect(stackSectionPropertiesSchema.safeParse(values).success).toBe(true);
    expect(stackGroupPropertiesSchema.safeParse(values).success).toBe(true);
  });

  it('rejects unknown properties for known definition contracts', () => {
    expect(stackComponentPropertiesSchema.safeParse({ orientation: 'vertical', unknownProperty: true }).success).toBe(false);
    expect(textPropertiesSchema.safeParse({ text: 'CarBroz', unexpected: 1 }).success).toBe(false);
  });

  it('supports existing typed text, input and button values', () => {
    expect(textPropertiesSchema.safeParse({ text: 'CarBroz', fontSize: 44, fontWeight: 700, color: '#101522', textAlign: 'center' }).success).toBe(true);
    expect(inputPropertiesSchema.safeParse({ placeholder: '98765 43210', keyboardType: 'phone', maxLength: 10, weight: 1 }).success).toBe(true);
    expect(buttonPropertiesSchema.safeParse({ text: 'Continue', fillMaxWidth: true, height: 56, fontSize: 18, fontWeight: 600, textColor: '#FFFFFF', shape: { type: 'roundedCorner', cornerRadius: 16 }, background: { type: 'linearGradient', angle: 90, colors: [{ color: '#28CBC7', stop: 0 }, { color: '#10B6B3', stop: 1 }] } }).success).toBe(true);
  });
});
