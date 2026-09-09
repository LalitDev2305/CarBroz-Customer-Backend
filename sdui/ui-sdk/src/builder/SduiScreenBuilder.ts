import { BaseSduiScreenBuilder } from './BaseSduiScreenBuilder.js';

/**
 * Canonical production root Builder for SDUI composition.
 *
 * It intentionally has no constructor configuration: screen identity, schema version, target,
 * theme, and hierarchy are configured through explicit returned-object/fluent APIs.
 */
export class SduiScreenBuilder extends BaseSduiScreenBuilder {
  constructor() {
    super();
  }
}
