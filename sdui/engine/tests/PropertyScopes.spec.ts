import { describe, expect, it } from 'vitest';
import { PropertyAccumulator } from '../src/index.js';

describe('SDUI property scopes', () => {
  it('accepts explicit edge insets and merges later edge overrides', () => {
    const properties = new PropertyAccumulator();

    properties.base
      .padding({ start: 1, top: 2, end: 3, bottom: 4 })
      .paddingTop(9);

    expect(properties.properties.padding).toEqual({
      start: 1,
      top: 9,
      end: 3,
      bottom: 4,
    });
  });

  it('preserves validation messages for required and pattern rules', () => {
    const properties = new PropertyAccumulator();

    properties.behavior
      .required('Mobile number is required')
      .pattern('^[0-9]{10}$', 'Enter a valid mobile number');

    expect(properties.extras.validation).toEqual({
      required: true,
      message: 'Enter a valid mobile number',
      pattern: '^[0-9]{10}$',
    });
  });
});
