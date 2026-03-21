# Backend

The backend is a FastAPI service designed to be the stable contract layer for a detection-first computer-vision product.

## Responsibilities

- expose typed HTTP endpoints for health, pipeline discovery, and analysis
- make the default sample workflow object detection with bounding boxes
- expose segmentation as an extension through the same inference contract
- validate uploads and normalize errors
- keep model-specific logic behind a small service boundary
- make it easy to swap sample OpenCV processors with heavier inference backends later

## Install

```bash
python -m pip install -e .[dev]
```

## Run

```bash
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

## Test

```bash
python -m ruff check .
python -m pytest
```

The backend test suite now includes committed image fixtures and snapshot-backed API
regression checks for the starter inference routes.
