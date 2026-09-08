export type DiagnosticEnvironmentSource = Readonly<Record<string, string | undefined>>;

/**
 * Detailed console diagnostics are intentionally limited to CarBroz Development and Staging.
 *
 * CARBROZ_ENVIRONMENT is the product deployment environment and may be `staging` while NODE_ENV remains
 * `production` so dependencies still run with production semantics. When it is absent, NODE_ENV is used as
 * a backwards-compatible local fallback. Tests and Production never enable detailed request/response logs.
 */
export function isDetailedDiagnosticLoggingEnabled(
  source: DiagnosticEnvironmentSource = process.env,
): boolean {
  const explicit = source.CARBROZ_ENVIRONMENT?.trim().toLowerCase();
  if (explicit) return explicit === 'development' || explicit === 'staging';

  const nodeEnvironment = (source.NODE_ENV ?? 'development').trim().toLowerCase();
  return nodeEnvironment === 'development';
}
