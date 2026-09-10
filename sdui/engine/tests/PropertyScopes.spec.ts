import { describe, expect, it } from 'vitest';
import { action, PropertyAccumulator } from '../src/index.js';

describe('SDUI property scopes', () => {
  it('accepts numeric and explicit edge insets and merges later edge overrides', () => {
    const numeric = new PropertyAccumulator();
    numeric.base.padding(6);
    expect(numeric.properties.padding).toEqual({ start: 6, top: 6, end: 6, bottom: 6 });

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

  it('preserves validation rules with and without optional messages', () => {
    const properties = new PropertyAccumulator();

    properties.behavior
      .required('Mobile number is required')
      .pattern('^[0-9]{10}$', 'Enter a valid mobile number');

    expect(properties.extras.validation).toEqual({
      required: true,
      message: 'Enter a valid mobile number',
      pattern: '^[0-9]{10}$',
    });

    const noMessage = new PropertyAccumulator();
    noMessage.behavior.pattern('^[A-Z]+$');
    expect(noMessage.extras.validation).toEqual({ pattern: '^[A-Z]+$' });
  });

  it('creates the first event map and merges subsequent event actions', () => {
    const properties = new PropertyAccumulator();
    const first = action.dismiss();
    const second = action.dismiss('dialog');

    properties.behavior.onClick(first).onLongClick(second);

    expect(properties.extras.actions).toEqual({
      onClick: first,
      onLongClick: second,
    });
  });
});
