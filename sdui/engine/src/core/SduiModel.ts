export {
  CURRENT_SDUI_SCHEMA_VERSION,
  type SduiAction,
  type SduiAuthentication,
  type SduiComponent,
  type SduiElement,
  type SduiGroup,
  type SduiRequestMethod,
  type SduiScreen,
  type SduiSection,
  type SduiTargetApp,
  type SduiTemplate,
  type SduiTheme,
  type SduiValueReference,
} from '@carbroz/ui-sdk';

/**
 * Temporary compatibility bridge to the stable SDUI v3 wire contract.
 *
 * The single engine owns composition. These aliases preserve exact serialized
 * output while the old ui-sdk package is converged and eventually retired.
 */
