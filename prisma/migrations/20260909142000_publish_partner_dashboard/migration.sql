-- Phase 10: make the canonical authenticated Partner destination deployable from migrations alone.
-- The runtime Partner SDUI registry reads this persisted published document; production must not depend on `prisma db seed`.
INSERT INTO "SduiScreen" (
  "publicId",
  "screenId",
  "targetApp",
  "versionNumber",
  "status",
  "layoutJson",
  "lockVersion",
  "publishedAt",
  "publishedBy",
  "changeDescription",
  "createdAt",
  "updatedAt"
)
VALUES (
  '2cf6f5f5-7380-4a3f-b8e1-29a863418c10',
  'partner_dashboard',
  'PARTNER',
  1,
  'PUBLISHED'::"SduiScreenStatus",
  '{"screenId":"partner_dashboard","schemaVersion":"3.0.0","targetApp":"PARTNER","theme":{"theme":"light","statusBar":"transparent"},"template":{"id":"partner_dashboard_template","type":"default_template","properties":{"orientation":"vertical","fillMaxSize":true,"padding":{"start":24,"top":24,"end":24,"bottom":24}},"components":[{"id":"dashboard_shell","type":"stack_component","properties":{"orientation":"vertical","verticalArrangement":{"type":"spacedBy","spacing":8},"fillMaxWidth":true},"elements":[{"id":"dashboard_title","type":"text","properties":{"text":"Partner Dashboard","fontSize":28,"fontWeight":700,"color":"#101522"}},{"id":"dashboard_status","type":"text","properties":{"text":"Your workspace is ready.","fontSize":15,"fontWeight":400,"color":"#6B7078"}}]}]}}'::jsonb,
  1,
  CURRENT_TIMESTAMP,
  'phase10-migration',
  'Canonical authenticated Partner startup shell',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("screenId", "targetApp", "versionNumber") DO UPDATE
SET
  "status" = EXCLUDED."status",
  "layoutJson" = EXCLUDED."layoutJson",
  "lockVersion" = GREATEST("SduiScreen"."lockVersion", EXCLUDED."lockVersion"),
  "publishedAt" = EXCLUDED."publishedAt",
  "publishedBy" = EXCLUDED."publishedBy",
  "changeDescription" = EXCLUDED."changeDescription",
  "deletedAt" = NULL,
  "updatedAt" = CURRENT_TIMESTAMP;
