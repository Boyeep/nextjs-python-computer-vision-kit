# nextjs-python-computer-vision-kit

A full-stack starter monorepo for detection-first computer vision products built with Next.js and FastAPI.

It combines a polished frontend, a Python API designed for image-processing workloads, shared root scripts, a documented OpenAPI contract, and a sample detection pipeline that runs on CPU with OpenCV so teams can start shipping product workflows before committing to a heavier model stack.

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Python 3.12+
- FastAPI
- OpenCV
- Docker Compose

## Monorepo Structure

- `frontend/`: Next.js app with a vision-console UI, API client helpers, and generated OpenAPI types
- `backend/`: FastAPI service with health, pipeline catalog, and image-analysis routes
- `docs/`: shared API contract
- `scripts/`: root development and verification scripts
- `.github/`: CI workflow for the template

## Recommended Shape

- architecture: inference-first
- default demo: detection-first
- optional frontend extension: webcam capture
- later backend extension: segmentation
- later workspace/package: training pipeline

This keeps the template easy to understand while still leaving a clean path into more advanced CV workflows.

## Why This Template Exists

Most computer-vision starters are either model notebooks with no product layer or web templates with no real inference shape. This template sits in the middle:

- product-minded frontend by default
- backend structure ready for image upload, preprocessing, and model-serving extensions
- typed API contract between the web app and the inference service
- one-command local development from the repo root

## Quick Start

1. Install Node.js 22+ and Python 3.12+.
2. Run `npm install` in the repo root.
3. Run `npm install` in `frontend/`.
4. Run `python -m pip install -e ./backend[dev]`.
5. Run `npm run api:types`.
6. Run `npm run dev`.

Frontend: `http://localhost:3000`
Backend: `http://127.0.0.1:8000`

## Commands

```bash
npm run dev
npm run dev:down
npm run api:types
npm run check
```

## API Contract

- `docs/openapi.yaml` is the source of truth for the shared HTTP contract.
- `frontend/src/generated/openapi.ts` is generated from that spec with `openapi-typescript`.
- Run `npm run api:types` whenever backend payloads change.

## Sample Pipelines Included

- `starter-detection`: the default object-style detection sample used by the main frontend flow
- `foreground-segmentation`: the first live extension pipeline, returning region polygons and derived boxes
- `document-layout`: document-oriented box extraction for scanning and capture products
- `dominant-color`: metrics-only extension pipeline for QA and analytics

These are intentionally lightweight starter pipelines. They are there to prove the architecture and developer workflow, not to lock you into toy logic. Swap them for YOLO, ONNX Runtime, PyTorch, TensorRT, or a custom service when you are ready.

## What You Get

- reusable Next.js + Python computer-vision monorepo layout
- upload-and-detect frontend starter UI
- optional webcam capture mode that reuses the same inference contract
- first segmentation extension pipeline using the same response boundary
- FastAPI inference endpoint with typed response models
- OpenCV-based sample processing that runs without a GPU
- root scripts for local dev and checks
- GitHub Actions workflow for frontend and backend verification
- Docker Compose dev option

## Notes

- The backend in this starter is CPU-first on purpose so it is easier to clone, run, and extend.
- The main story is intentionally detection-first so the template stays easy to explain and demo.
- The current environment used to build this template did not have Python installed, so the frontend was verified locally but backend execution was prepared rather than run here.
- If you move to heavier vision workloads, add a worker or model-service layer and keep the current API as the contract boundary.

## Next Expansions

- async job queue for long-running inference
- persistent artifact storage
- model registry and experiment tracking
- richer segmentation overlays and mask visualizations
- video ingestion pipelines
- training or experiment workspace in a separate `ml/` or `training/` package
