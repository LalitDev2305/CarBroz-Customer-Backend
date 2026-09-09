export {
  CURRENT_SDUI_SCHEMA_VERSION,
  type SduiAction,
  type SduiComponent,
  type SduiElement,
  type SduiGroup,
  type SduiScreen,
  type SduiSection,
  type SduiTargetApp,
  type SduiTemplate,
  type SduiTheme,
} from '@carbroz/ui-sdk';

/**
 * Temporary compatibility bridge to the stable SDUI v3 wire contract.
 *
 * The single engine owns composition. These aliases preserve exact serialized
 * output while the old ui-sdk package is converged and eventually retired.
 */
