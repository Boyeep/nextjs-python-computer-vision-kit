# nextjs-python-computer-vision-kit

A product-minded monorepo starter for detection-first computer vision apps built with Next.js and FastAPI.

It gives you a polished upload-to-inference UI, a typed OpenAPI contract, CPU-friendly starter pipelines, and a clean path into webcam capture, segmentation, and heavier model backends later.

<p>
  <a href="#quick-start">Quick start</a> ·
  <a href="#screenshots">Screenshots</a> ·
  <a href="#what-you-get">What you get</a> ·
  <a href="./CONTRIBUTING.md">Contributing</a> ·
  <a href="./SECURITY.md">Security</a> ·
  <a href="./soon.md">Roadmap</a>
</p>

## Screenshots

![Vision console screenshot](docs/assets/vision-console.png)

![Webcam extension screenshot](docs/assets/webcam-extension.png)

## Why This Repo Exists

Most computer-vision starters fall into one of two buckets:

- model notebooks with no product layer
- web templates with no real inference contract

This kit sits in the middle. It starts with a real product flow:

- upload an image
- run a detection-oriented pipeline
- inspect typed boxes, metrics, and image metadata
- keep the same contract when you add segmentation or webcam capture later

## What You Get

- detection-first starter UX with annotated preview overlays
- inference-first architecture with a separate Next.js frontend and FastAPI backend
- shared OpenAPI contract in `docs/openapi.yaml`
- generated frontend API types from `openapi-typescript`
- optional webcam extension that reuses the same API surface
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
- `foreground-segmentation`: first extension pipeline with polygons plus derived boxes
- `document-layout`: document-style region extraction for capture and scanning products
- `dominant-color`: metrics-only example for QA and analytics workflows

These pipelines are intentionally lightweight. They prove the repo shape and developer workflow without forcing you into toy logic forever. Swap them for YOLO, ONNX Runtime, PyTorch, TensorRT, or a hosted inference service when you are ready.

## Repo Shape

- `frontend/`: Next.js app shell, upload flow, webcam flow, and generated API types
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
npm run check:images
npm run report:licenses
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

`check:images` is separate and intended for environments where a Docker daemon is available.

`report:licenses` generates local npm and Python license inventories in `reports/licenses/`.

`check:secrets` scans tracked git content with a pinned `gitleaks` version via Go.

`check:workflows` lints `.github/workflows/` with a pinned `actionlint` version via Go.

CodeQL code scanning also runs on GitHub for `javascript-typescript`, `python`, and workflow files.

A separate GitHub workflow generates license-report artifacts for the root workspace, frontend workspace, and backend Python environment.

An SBOM workflow also publishes SPDX artifacts for the repository source plus the frontend and backend runner images.

## Releases

- Release Drafter keeps a draft release updated from merged pull requests on `main` and can auto-label incoming pull requests by path.
- Path-based labels help sort PRs into frontend, backend, CI/CD, docs, and maintenance categories automatically.
- Release Drafter defaults to a patch bump unless a maintainer applies `minor` or `major` to the pull request.
- Pushing a tag like `v0.1.0` triggers the release workflow.
- That workflow verifies the tagged commit, publishes backend/frontend images to GHCR, and creates a GitHub Release with generated notes.
- The release workflow also generates build-provenance attestations for the published GHCR images and links them from the release notes.
- The GitHub Release also includes attached SPDX SBOM assets for the source tree and both runner images.
- A follow-up smoke workflow pulls those published GHCR images and checks backend health, a real inference request, and the frontend shell before you treat the release as healthy.
- Maintainers can re-run the same check manually with `BACKEND_IMAGE=... FRONTEND_IMAGE=... npm run check:release-smoke`.

## Contract Notes

- `docs/openapi.yaml` is the source of truth for the HTTP contract.
- `frontend/src/generated/openapi.ts` is generated from that spec.
- Run `npm run api:types` whenever backend payloads change.
- Run `npm run check:contract` to confirm the generated types are committed and in sync.

## Recommended Growth Path

1. Keep the main story detection-first.
2. Add webcam polish once upload mode feels strong.
3. Add segmentation depth without changing the response boundary.
4. Introduce a real model adapter layer.
5. Split training and experimentation into a separate workspace later.

The short public roadmap lives in [soon.md](./soon.md).
