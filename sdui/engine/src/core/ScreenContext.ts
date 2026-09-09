export interface ScreenContext {
  readonly requestId?: string;
  readonly locale?: string;
  readonly data?: Readonly<Record<string, unknown>>;
}
