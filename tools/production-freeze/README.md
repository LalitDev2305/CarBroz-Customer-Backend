# Production Freeze Tooling

`preflight.mjs` is the permanent, non-destructive local validation entry point for ordinary convergence work after CW2.

Run from repository root:

```bash
pnpm freeze:preflight
```

It runs, fail-fast:

1. exact CW2 physical verifier;
2. CW1/CW2 read-only Constitution regression gate;
3. monorepo build;
4. lint;
5. architecture tests;
6. complete Vitest suite;
7. CW1/CW2 regression gate again after executable validation.

The preflight does not rewrite source, materialize a transformed candidate, generate migration code or invoke dormant source-rewriting closeout producers.

The regression gate is intentionally **not** the final Constitution gate. Later workstreams and final freeze must also run:

```bash
node tools/architecture-closeout-constitution-gate.mjs
```

without `--regression`, and CW6 must prove strict executable production coverage at 100% statements / branches / functions / lines together with all remaining freeze gates.
