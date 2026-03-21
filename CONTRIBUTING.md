# Contributing

Thanks for contributing to the computer-vision kit.

## Prerequisites

- Node.js 22+
- Python 3.12+
- Git

## First-Time Setup

1. Install root dependencies:

```bash
npm install
```

2. Install frontend dependencies:

```bash
cd frontend
npm install
cd ..
```

3. Install backend dependencies:

```bash
python -m pip install -e ./backend[dev]
```

4. Generate frontend types from the API contract:

```bash
npm run api:types
```

## Local Development

Run both apps from the repo root:

```bash
npm run dev
```

Frontend: `http://localhost:3000`  
Backend: `http://127.0.0.1:8000`

If `backend/.venv` exists, the root scripts will prefer that interpreter automatically.

## Verification

Run these before opening a pull request:

```bash
npm run check:contract
npm run check
```

What they cover:

- `check:contract`: regenerates frontend API types and fails if generated files drift from `docs/openapi.yaml`
- `check`: frontend lint, frontend typecheck, frontend production build, backend Ruff lint, backend tests, backend bytecode compile

If Docker is available locally, you can also verify the production-style images:

```bash
npm run check:images
```

If Go is available locally, you can also lint GitHub Actions workflows:

```bash
npm run check:workflows
```

If Go is available locally, you can also scan tracked git content for secrets:

```bash
npm run check:secrets
```

For a pre-commit style check on staged content, run:

```bash
npm run check:secrets -- --staged
```

If you want a full dependency license inventory locally, run:

```bash
npm run report:licenses
```

That command writes generated reports into `reports/licenses/`.

## Changing the API Contract

If you modify request or response shapes:

1. update `docs/openapi.yaml`
2. update backend schemas and implementation
3. run `npm run api:types`
4. update frontend usage of the generated types
5. run `npm run check:contract`
6. run `npm run check`

## Repo Conventions

- Keep the main story detection-first.
- Reuse the same inference contract for upload, webcam, and later extensions.
- Keep model-specific logic behind the backend vision service boundary.
- Treat `frontend/src/app/docs-preview/` as docs-only seeded preview routes used for README screenshots.

## Pull Request Notes

- Keep changes scoped and explain user-facing impact clearly.
- Mention contract changes explicitly.
- Include screenshots when UI behavior changes.
- Add or update tests when backend behavior changes.

## Maintainer Release Flow

1. Merge pull requests into `main`.
2. Let Release Drafter refresh the draft release and category buckets.
3. Apply `minor` or `major` to a pull request when the default patch bump is not enough.
4. Push a semver tag like `v0.1.0`.
5. Wait for the release workflow to verify the repo, publish GHCR images, and create the GitHub Release.
6. Confirm the release smoke workflow passes against the published images, or dispatch it manually for a tag if you need to re-check a release.

The release notes will also include links to the image provenance attestations generated during the publish workflow.
The release itself will also carry attached SPDX SBOM files for the source tree and the published runner images.

The component labels used by Release Drafter are synced from `.github/labels.json`, and most of the common ones are applied automatically from changed paths.

To run the same image smoke check locally, set `BACKEND_IMAGE` and `FRONTEND_IMAGE`, then run `npm run check:release-smoke`.
