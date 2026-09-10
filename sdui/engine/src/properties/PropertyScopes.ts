import type { SduiAction, SduiElement } from '../core/SduiModel.js';
import type { Arrangement, EdgeInsets, HorizontalAlignment, Orientation, TextAlignment, VerticalAlignment } from '../core/value-objects/Layout.js';
import type { Background, Border, Shape } from '../core/value-objects/Appearance.js';
import type { Accessory } from '../core/value-objects/Accessory.js';

type MutableRecord = Record<string, unknown>;
type ElementExtras = Omit<SduiElement, 'id' | 'type' | 'properties'>;

export interface PropertySink {
  setProperty(key: string, value: unknown): void;
  setExtra(key: keyof ElementExtras, value: unknown): void;
}

export class BasePropertyScope {
  constructor(private readonly sink: PropertySink) {}

  width(value: number): this { return this.property('width', value); }
  height(value: number): this { return this.property('height', value); }
  minWidth(value: number): this { return this.property('minWidth', value); }
  minHeight(value: number): this { return this.property('minHeight', value); }
  maxWidth(value: number): this { return this.property('maxWidth', value); }
  maxHeight(value: number): this { return this.property('maxHeight', value); }
  weight(value: number): this { return this.property('weight', value); }
  fillMaxWidth(value = true): this { return this.property('fillMaxWidth', value); }
  fillMaxHeight(value = true): this { return this.property('fillMaxHeight', value); }
  fillMaxSize(value = true): this { return this.property('fillMaxSize', value); }
  orientation(value: Orientation): this { return this.property('orientation', value); }
  vertical(): this { return this.orientation('vertical'); }
  horizontal(): this { return this.orientation('horizontal'); }
  verticalArrangement(value: Arrangement): this { return this.property('verticalArrangement', value); }
  horizontalArrangement(value: Arrangement): this { return this.property('horizontalArrangement', value); }
  spacing(value: number): this {
    const properties = this.properties();
    const orientation = properties.orientation === 'horizontal' ? 'horizontal' : 'vertical';
    return orientation === 'horizontal'
      ? this.horizontalArrangement({ type: 'spacedBy', spacing: value })
      : this.verticalArrangement({ type: 'spacedBy', spacing: value });
  }
  horizontalAlignment(value: HorizontalAlignment): this { return this.property('horizontalAlignment', value); }
  verticalAlignment(value: VerticalAlignment): this { return this.property('verticalAlignment', value); }
  padding(value: number | EdgeInsets): this {
    const insets = typeof value === 'number'
      ? { start: value, top: value, end: value, bottom: value }
      : value;
    return this.property('padding', insets);
  }
  paddingHorizontal(value: number): this {
    return this.mergeProperty('padding', { start: value, end: value });
  }
  paddingVertical(value: number): this {
    return this.mergeProperty('padding', { top: value, bottom: value });
  }
  paddingStart(value: number): this { return this.mergeProperty('padding', { start: value }); }
  paddingTop(value: number): this { return this.mergeProperty('padding', { top: value }); }
  paddingEnd(value: number): this { return this.mergeProperty('padding', { end: value }); }
  paddingBottom(value: number): this { return this.mergeProperty('padding', { bottom: value }); }

  private property(key: string, value: unknown): this {
    this.sink.setProperty(key, value);
    return this;
  }

  private mergeProperty(key: string, patch: MutableRecord): this {
    const current = this.properties()[key];
    this.sink.setProperty(key, deepMergeRecord(isPlainRecord(current) ? current : {}, patch));
    return this;
  }

  private properties(): MutableRecord {
    return (this.sink as PropertyAccumulator).properties;
  }
}

export class StylePropertyScope {
  constructor(private readonly sink: PropertySink) {}

  background(value: Background): this { return this.property('background', value); }
  border(value: Border): this { return this.property('border', value); }
  shape(value: Shape): this { return this.property('shape', value); }
  fontSize(value: number): this { return this.property('fontSize', value); }
  fontWeight(value: number): this { return this.property('fontWeight', value); }
  lineHeight(value: number): this { return this.property('lineHeight', value); }
  letterSpacing(value: number): this { return this.property('letterSpacing', value); }
  color(value: string): this { return this.property('color', value); }
  textColor(value: string): this { return this.property('textColor', value); }
  textAlign(value: TextAlignment): this { return this.property('textAlign', value); }

  private property(key: string, value: unknown): this {
    this.sink.setProperty(key, value);
    return this;
  }
}

export class ContentPropertyScope {
  constructor(private readonly sink: PropertySink) {}

  text(value: string): this { return this.property('text', value); }
  url(value: string): this { return this.property('url', value); }
  placeholder(value: string): this { return this.property('placeholder', value); }
  maxLength(value: number): this { return this.property('maxLength', value); }
  contentScale(value: 'fit' | 'crop' | 'fillBounds' | 'inside'): this { return this.property('contentScale', value); }
  leading(value: readonly Accessory[]): this { return this.property('leading', [...value]); }
  trailing(value: readonly Accessory[]): this { return this.property('trailing', [...value]); }

  private property(key: string, value: unknown): this {
    this.sink.setProperty(key, value);
    return this;
  }
}

export class BehaviorPropertyScope {
  constructor(private readonly sink: PropertySink) {}

  keyboardType(value: 'text' | 'phone' | 'number' | 'email' | 'password'): this { return this.property('keyboardType', value); }
  binding(key: string): this { this.sink.setExtra('binding', { key }); return this; }
  validation(value: Record<string, unknown>): this { this.sink.setExtra('validation', value); return this; }
  required(message?: string): this {
    return this.mergeValidation({ required: true, ...(message ? { message } : {}) });
  }
  pattern(value: string, message?: string): this {
    return this.mergeValidation({ pattern: value, ...(message ? { message } : {}) });
  }
  actions(value: Record<string, SduiAction>): this { this.sink.setExtra('actions', value); return this; }
  onClick(value: SduiAction): this { return this.event('onClick', value); }
  onLongClick(value: SduiAction): this { return this.event('onLongClick', value); }
  onValueChange(value: SduiAction): this { return this.event('onValueChange', value); }
  onFocus(value: SduiAction): this { return this.event('onFocus', value); }
  onBlur(value: SduiAction): this { return this.event('onBlur', value); }

  private property(key: string, value: unknown): this { this.sink.setProperty(key, value); return this; }
  private event(name: string, value: SduiAction): this {
    const extras = (this.sink as PropertyAccumulator).extras;
    const current = isPlainRecord(extras.actions) ? extras.actions : {};
    this.sink.setExtra('actions', { ...current, [name]: value });
    return this;
  }
  private mergeValidation(patch: Record<string, unknown>): this {
    const extras = (this.sink as PropertyAccumulator).extras;
    const current = isPlainRecord(extras.validation) ? extras.validation : {};
    this.sink.setExtra('validation', { ...current, ...patch });
    return this;
  }
}

export class MetadataPropertyScope {
  constructor(private readonly sink: PropertySink) {}

  semanticRole(value: string): this { this.sink.setProperty('semanticRole', value); return this; }
  metadata(value: Record<string, unknown>): this { this.sink.setExtra('metadata', value); return this; }
  accessibility(value: Record<string, unknown>): this { this.sink.setExtra('accessibility', value); return this; }
  analytics(value: Record<string, unknown>): this { this.sink.setExtra('analytics', value); return this; }
}

export class PropertyAccumulator implements PropertySink {
  readonly properties: MutableRecord = {};
  readonly extras: MutableRecord = {};

  readonly base = new BasePropertyScope(this);
  readonly style = new StylePropertyScope(this);
  readonly content = new ContentPropertyScope(this);
  readonly behavior = new BehaviorPropertyScope(this);
  readonly metadata = new MetadataPropertyScope(this);

  setProperty(key: string, value: unknown): void { this.properties[key] = value; }
  setExtra(key: keyof ElementExtras, value: unknown): void { this.extras[key] = value; }
}

export function deepMergeRecord(base: Readonly<Record<string, unknown>>, override: Readonly<Record<string, unknown>>): Record<string, unknown> {
  const result: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (value === undefined) continue;
    const existing = result[key];
    result[key] = isPlainRecord(existing) && isPlainRecord(value)
      ? deepMergeRecord(existing, value)
      : value;
  }
  return result;
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
