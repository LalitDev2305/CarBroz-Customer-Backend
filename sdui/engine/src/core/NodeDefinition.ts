export type SduiNodeLevel = 'template' | 'component' | 'section' | 'group' | 'element';

export type SduiContentMode =
  | 'components'
  | 'elements-or-sections'
  | 'elements-or-groups'
  | 'elements'
  | 'none';

export type SduiPropertyCategory = 'base' | 'style' | 'content' | 'behavior' | 'metadata';
export type SduiEventName = 'onClick' | 'onLongClick' | 'onValueChange' | 'onFocus' | 'onBlur';

/** Minimal parser contract; Zod schemas satisfy this structurally without coupling core to Zod. */
export interface PropertyParser<TProperties> {
  parse(input: unknown): TProperties;
}

/**
 * Canonical owner for one reusable SDUI node type.
 * Defaults are always resolved before strict parsing. Categories/events describe authoring capabilities,
 * while the exact property parser remains the final authority for legal serialized fields.
 */
export interface NodeDefinition<TProperties = unknown> {
  readonly type: string;
  readonly level: SduiNodeLevel;
  readonly defaults?: Readonly<Record<string, unknown>>;
  readonly properties: PropertyParser<TProperties>;
  readonly children: SduiContentMode;
  readonly categories?: readonly SduiPropertyCategory[];
  readonly supportedEvents?: readonly SduiEventName[];
}
