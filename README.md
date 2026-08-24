# nextjs-python-computer-vision-kit

[![npm version](https://img.shields.io/npm/v/%40boyeep%2Fnextjs-python-computer-vision-kit)](https://www.npmjs.com/package/@boyeep/nextjs-python-computer-vision-kit) [![npm downloads](https://img.shields.io/npm/dm/%40boyeep%2Fnextjs-python-computer-vision-kit)](https://www.npmjs.com/package/@boyeep/nextjs-python-computer-vision-kit) [![license](https://img.shields.io/npm/l/%40boyeep%2Fnextjs-python-computer-vision-kit)](https://www.npmjs.com/package/@boyeep/nextjs-python-computer-vision-kit)

Create a project directly from npm:

```bash
npx @boyeep/nextjs-python-computer-vision-kit my-vision-app
```


A product-minded monorepo starter for detection-first computer vision apps built with Next.js and FastAPI.

It gives you a polished upload-to-inference UI, a typed OpenAPI contract, and CPU-friendly starter pipelines behind a replaceable service boundary.

<p>
  <a href="#quick-start">Quick start</a> ·
  <a href="#what-you-get">What you get</a> ·
  <a href="./docs/security.md">Security</a>
</p>

## Why This Repo Exists

Most computer-vision starters fall into one of two buckets:

- model notebooks with no product layer
- web templates with no real inference contract

This kit sits in the middle. It starts with a real product flow:

- upload an image
- run a detection-oriented pipeline
- inspect typed boxes, metrics, and image metadata
- keep the same contract when you replace or extend the inference backend

## What You Get

- detection-first starter UX with annotated preview overlays
- inference-first architecture with a separate Next.js frontend and FastAPI backend
- shared OpenAPI contract in `docs/openapi.yaml`
- generated frontend API types from `openapi-typescript`
- first live segmentation extension with polygons, masks, and derived boxes
- CPU-first OpenCV sample pipelines that are easy to replace later
- root dev and verification scripts for a monorepo-style workflow
- GitHub Actions template CI

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Python 3.12+
- FastAPI
- OpenCV
- Docker Compose

## Included Pipelines

- `starter-detection`: default object-style detection flow for the main UI
The starter pipeline is intentionally lightweight. It proves the repo shape and developer workflow without forcing a model stack. Swap it for YOLO, ONNX Runtime, PyTorch, TensorRT, or a hosted inference service when you are ready.

## Repo Shape

- `frontend/`: Next.js app shell, upload flow, and generated API types
- `backend/`: FastAPI service, pipeline registry, validation, and starter image logic
- `docs/`: OpenAPI contract and screenshot assets
- `scripts/`: root development and verification commands
- `.github/`: template CI workflow
- `SECURITY.md`: vulnerability reporting guidance

## Quick Start

1. Install Node.js 22+ and Python 3.12+.
2. Run `npm install` in the repo root.
3. Run `npm install` in `frontend/`.
4. Run `python -m pip install -e ./backend[dev]`.
5. Run `npm run api:types`.
6. Run `npm run dev`.

Frontend: `http://localhost:3000`  
Backend: `http://127.0.0.1:8000`

If you create `backend/.venv`, the root scripts will prefer that interpreter automatically.

## Commands

```bash
npm run dev
npm run dev:down
npm run api:types
npm run check:contract
npm run check:secrets
npm run check:workflows
npm run check
```

## Verification

The root check runs:

- frontend lint
- frontend typecheck
- frontend production build
- backend Ruff lint
- backend `pytest`
- backend `compileall`

`check:secrets` scans tracked git content with a pinned `gitleaks` version via Go.

`check:workflows` lints `.github/workflows/` with a pinned `actionlint` version via Go.

CodeQL code scanning also runs on GitHub for `javascript-typescript`, `python`, and workflow files.

## Contract Notes

- `docs/openapi.yaml` is the source of truth for the HTTP contract.
- `frontend/src/generated/openapi.ts` is generated from that spec.
- Run `npm run api:types` whenever backend payloads change.
- Run `npm run check:contract` to confirm the generated types are committed and in sync.

## Recommended Growth Path

1. Keep the main story detection-first.
2. Introduce a real model adapter behind the existing service boundary.
3. Split training and experimentation into a separate workspace later.

The project documentation lives in [`docs/`](./docs/).

## Repository Standards

- [Security](./docs/security.md)
