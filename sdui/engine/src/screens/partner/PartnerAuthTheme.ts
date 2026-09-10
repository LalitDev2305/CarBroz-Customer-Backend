import type { SduiTheme } from '../../core/SduiModel.js';

const partnerAuthGradientColors = Object.freeze([
  { color: '#DDF8F6', stop: 0 },
  { color: '#F7FEFD', stop: 0.28 },
  { color: '#FFFFFF', stop: 0.55 },
  { color: '#D9F7F4', stop: 1 },
]);

/** Shared, presentation-only theme for Partner authentication screens. */
export const partnerAuthTheme: SduiTheme = Object.freeze({
  theme: 'light',
  statusBar: 'transparent',
  properties: Object.freeze({
    gradient: Object.freeze({
      type: 'linear',
      angle: 135,
      colors: partnerAuthGradientColors,
    }),
  }),
});
