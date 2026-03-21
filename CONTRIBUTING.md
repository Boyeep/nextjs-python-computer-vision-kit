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
