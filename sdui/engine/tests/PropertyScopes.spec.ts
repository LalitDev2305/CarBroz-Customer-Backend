import { describe, expect, it } from 'vitest';
import { action, PropertyAccumulator, ref } from '../src/index.js';

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

  it('authors generic rich text spans including dynamic references and inline actions', () => {
    const properties = new PropertyAccumulator();
    const termsAction = action.externalUri(ref.context('legal.termsUri'));

    properties.content
      .text(ref.context('authFlow.phoneNumber'))
      .spans([
        { text: '+91 ' },
        { text: ref.context('authFlow.phoneNumber'), fontWeight: 600 },
        { text: 'Terms', color: '#13B8B5', underline: true, onClick: termsAction },
      ]);

    expect(properties.properties).toMatchObject({
      text: { $context: 'authFlow.phoneNumber' },
      spans: [
        { text: '+91 ' },
        { text: { $context: 'authFlow.phoneNumber' }, fontWeight: 600 },
        { text: 'Terms', color: '#13B8B5', underline: true, onClick: termsAction },
      ],
    });
  });

  it('authors generic disabled presentation and segmented input configuration', () => {
    const properties = new PropertyAccumulator();

    properties.behavior.enabled(false);
    properties.style
      .disabledColor('#9CA3AF')
      .presentation({
        type: 'segmented',
        count: 6,
        spacing: 8,
        segmentWidth: 44,
        segmentHeight: 52,
      });

    expect(properties.properties).toEqual({
      enabled: false,
      disabledColor: '#9CA3AF',
      presentation: {
        type: 'segmented',
        count: 6,
        spacing: 8,
        segmentWidth: 44,
        segmentHeight: 52,
      },
    });
  });
});
