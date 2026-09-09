export type SduiNodeLevel = 'template' | 'component' | 'section' | 'group' | 'element';

export type SduiChildMode =
  | 'components'
  | 'elements-or-sections'
  | 'elements-or-groups'
  | 'elements'
  | 'none';

/** Minimal parser contract; Zod schemas satisfy this structurally without coupling core to Zod. */
export interface PropertyParser<TProperties> {
  parse(input: unknown): TProperties;
}

/**
 * Single source of truth for one reusable SDUI node type.
 * A concrete definition co-locates its type name, property contract and legal child mode.
 */
export interface NodeDefinition<TProperties = unknown> {
  readonly type: string;
  readonly level: SduiNodeLevel;
  readonly properties: PropertyParser<TProperties>;
  readonly children: SduiChildMode;
}
