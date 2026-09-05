# Production Freeze Tooling

`preflight.mjs` is the permanent, non-destructive local validation entry point for ordinary convergence work.

Run from repository root:

```bash
pnpm freeze:preflight
```

It runs, in fail-fast order:

1. monorepo build;
2. lint;
3. architecture tests;
4. complete Vitest suite.

It deliberately does **not** invoke any `architecture-closeout-*.mjs` transformation/finalization script. Those scripts mutate the candidate tree and remain owned by the canonical closeout executor until final freeze.

Strict transformed production coverage remains a closeout/freeze gate. Do not weaken or replace that gate with this preflight.
