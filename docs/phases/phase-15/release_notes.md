# Phase 15 — Release Notes

## Overview
Phase 15 streamlines the CarBroz monorepo by removing orphan root artifacts and unreferenced empty packages, consolidating shared types into `@carbroz/common`, and updating repository ignore rules.

## Changes Included
- **Package Consolidation**: Merged `@carbroz/types` and `@carbroz/validation` into `@carbroz/common`.
- **Shell Package Deletion**: Removed `cache`, `events`, `messaging`, `observability`, and `performance` package folders.
- **Root Artifact Cleanup**: Removed orphan mock JSONs and root Prisma folder stub.
- **Dependencies Updated**: Cleaned unused workspace references in `apps/backend-api/package.json` and `packages/common/package.json`.

## Compatibility
- 100% backward compatible with existing APIs, database tables, and client contracts.
