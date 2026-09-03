import fs from 'node:fs';
import path from 'node:path';

const file = path.resolve('docs/MASTER-BACKEND-CONSTITUTION.md');
if (!fs.existsSync(file)) throw new Error('MASTER-BACKEND-CONSTITUTION.md is required');

let text = fs.readFileSync(file, 'utf8');

const marker = '## 48A. Implementation-first execution law';
if (!text.includes(marker)) {
  const insertionPoint = 'Each move preserves behavior through tests and deletes superseded source once consumers are updated. Compatibility clutter is forbidden unless an explicit compatibility requirement exists.\n\n---\n\n# PART VIII — TESTING AND ENFORCEMENT';
  if (!text.includes(insertionPoint)) throw new Error('Constitution migration-order insertion point not found');

  const policy = `Each move preserves existing intended behavior while superseded source is deleted once consumers are updated. Compatibility clutter is forbidden unless an explicit compatibility requirement exists.\n\n## 48A. Implementation-first execution law\n\nBackend V3 migration is executed in two strictly separated stages.\n\n### Stage A — Complete implementation and test-source construction\n\nStage A is owned by ChatGPT/GitHub implementation work. During Stage A the objective is to finish the complete constitution-defined repository, not to use test execution as an incremental implementation driver.\n\nStage A MUST complete all of the following before the validation campaign begins:\n\n- the physical repository matches the frozen canonical architecture;\n- every package/module/class/interface/use case/repository/adapter/DTO/mapper/provider has exactly one justified canonical owner;\n- all legacy, duplicate, obsolete, compatibility-only, generated and unnecessary source is removed;\n- all imports, public boundaries, workspace identities and dependency directions are canonical;\n- Partner, Customer and Admin access surfaces are structurally isolated;\n- Partner and Customer SDUI remain runtime-driven, scoped and independent;\n- all production implementation required by the architecture migration is present;\n- all required test SOURCE files and test fixtures are created/organized for the later validation campaign;\n- architecture/static repository scanners may be used to inspect topology, duplicates, ownership and forbidden paths, but the executable test suite MUST NOT be used as the implementation agent.\n\nDuring Stage A, Antigravity MUST NOT implement or modify production code. Antigravity is not an architecture or coding agent for this repository.\n\n### Stage B — Validation campaign\n\nStage B begins only after Stage A is explicitly declared IMPLEMENTATION COMPLETE.\n\nAntigravity is used only to execute and report test/validation evidence requested by ChatGPT. Production fixes remain owned by ChatGPT/GitHub implementation work.\n\nValidation then covers, in a deliberate complete campaign, install/lockfile integrity, Prisma validation/generation, TypeScript build/typecheck, lint, architecture tests, unit tests, domain invariants, repository contracts, integration tests, rollback/concurrency tests, HTTP/auth/authz tests, provider adapter tests, SDUI tests, security tests, E2E tests, coverage and final clean-tree verification.\n\nA failed validation never authorizes Antigravity to redesign architecture or implement a fix. It reports evidence; ChatGPT compares the evidence against this constitution and changes the canonical source when required.\n\n### No phase drift\n\nDo not alternate between partial implementation and Antigravity-driven test/fix loops. Finish Stage A first, then perform Stage B comprehensively. New chats and long-running sessions MUST preserve this separation.\n\n---\n\n# PART VIII — TESTING AND ENFORCEMENT`;
  text = text.replace(insertionPoint, policy);
}

if (!text.includes('Test source construction belongs to Stage A')) {
  const testingHeading = '## 49. Testing policy\n\n';
  if (!text.includes(testingHeading)) throw new Error('Testing policy heading not found');
  text = text.replace(testingHeading, `${testingHeading}Test source construction belongs to Stage A. Test execution belongs to Stage B and begins only after the implementation-complete gate in Section 53A is satisfied. Antigravity is an execution/audit tool only; it MUST NOT author production implementation.\n\n`);
}

if (!text.includes('## 53A. Implementation-complete gate before validation')) {
  const featureGate = '## 54. Final architecture freeze criteria\n\n';
  if (!text.includes(featureGate)) throw new Error('Final architecture freeze heading not found');
  const implementationGate = `## 53A. Implementation-complete gate before validation\n\nStage A is IMPLEMENTATION COMPLETE only when repository inspection proves all of the following without relying on executable tests:\n\n- the canonical roots and workspace packages match Sections 5 and 7 exactly;\n- no top-level packages/shared/common/libs compatibility architecture survives;\n- exactly one Foundation kernel, one UI SDK and one SDUI Registry exist;\n- every current source file is classified to an explicit owner;\n- no duplicate class, enum, business repository, use case, DTO authority, provider authority or business module tree survives;\n- no API-owned business use case remains;\n- no Platform-owned business repository remains;\n- no tracked generated build output remains;\n- no legacy SDUI hierarchy or hardcoded screen-name architecture remains;\n- Partner, Customer and Admin API surfaces are separate;\n- Partner/Customer business and SDUI-specific code does not depend on the other product's internals;\n- public boundaries/import directions and workspace dependency graph are canonical and acyclic;\n- all intended architecture-migration production code is structurally present;\n- the complete required test-source inventory for Stage B is present and organized;\n- migration-only scaffolding that is not part of the final product architecture is either removed or explicitly justified as permanent tooling.\n\nOnly after this gate is explicitly satisfied may Stage B validation begin.\n\n## 54. Final architecture freeze criteria\n\n`;
  text = text.replace(featureGate, implementationGate);
}

fs.writeFileSync(file, text);
console.log('Master Constitution implementation-first execution policy finalized.');
