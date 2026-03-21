# AGENTS

Guidance for coding agents working in this repository.

## Repo Intent

This repo is a product-minded starter for computer-vision apps.

The default story is:

1. upload an image
2. run a detection-first inference pipeline
3. inspect typed detections, metrics, and image metadata
4. extend into segmentation or webcam capture without changing the contract boundary

Keep that shape intact when making changes.

## Repo Map

- `frontend/`: Next.js app, upload flow, webcam flow, docs preview routes, generated API types
- `backend/`: FastAPI service, pipeline registry, validation, response schemas, tests
- `docs/openapi.yaml`: source of truth for the API contract
- `frontend/src/generated/openapi.ts`: generated types from the OpenAPI spec
- `scripts/dev.mjs`: root dev runner for frontend + backend
- `scripts/check.mjs`: root verification entrypoint
- `scripts/check-contract-drift.mjs`: ensures generated API types match the spec

## Working Rules

- Prefer detection-first, inference-first changes over adding disconnected demo paths.
- Keep frontend and backend loosely coupled through the API contract, not direct assumptions.
- If you change response payloads or request shapes, update `docs/openapi.yaml`, regenerate types, and verify both sides.
- Treat `frontend/src/app/docs-preview/` as docs-only seeded demo pages for README screenshots. They should stay stable and lightweight.
- Do not commit `node_modules`, `.venv`, `.next`, caches, or local-only helper files.

## Contract Change Checklist

When changing the API contract:

1. update `docs/openapi.yaml`
2. update backend schemas and route behavior
3. run `npm run api:types`
4. update frontend usage if generated types changed
5. run `npm run check`

## Verification

Use these commands before finishing work:

```bash
npm run check:contract
npm run check:workflows
npm run check
```

## Frontend Note

This repo uses Next.js 16. Do not assume older App Router behavior is still correct. Check current Next.js docs or the local Next.js bundled docs when making framework-sensitive changes.

## Backend Note

The backend sample logic is intentionally CPU-first and easy to replace. Prefer keeping model-specific logic behind the small vision service boundary rather than leaking it into routes.
