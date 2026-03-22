# Tooling For This Template

This template is built around one stable idea:

1. the frontend captures an image or frame
2. the backend runs inference
3. the API returns typed results
4. the frontend renders those results without knowing model internals

That means the best tools are the ones that fit this contract cleanly.

## Good Tool Categories For This Repo

### 1. CV And Inference Libraries

#### OpenCV

Best for:

- image preprocessing
- thresholding
- contour extraction
- box and polygon generation
- lightweight CPU-first pipelines

Fit in this repo:

- already used in `backend/app/vision/service.py`
- ideal for starter logic and quick preprocessing before a real model

#### MediaPipe

Best for:

- hand landmarks
- pose landmarks
- face landmarks
- gesture-style interaction
- sign-language prototypes

Fit in this repo:

- strong option when the project moves from generic detection into human motion or hand understanding
- especially useful for webcam-driven experiences

#### ONNX Runtime

Best for:

- serving trained models locally
- CPU or GPU inference without shipping a full training stack to production
- stable deployment after training elsewhere

Fit in this repo:

- one of the best upgrades from the current OpenCV sample pipelines
- works well behind the existing FastAPI service boundary

#### PyTorch

Best for:

- training custom models
- experimenting with sequence models
- research-friendly development

Fit in this repo:

- strongest choice for training
- often paired with export to ONNX for serving

#### Ultralytics YOLO

Best for:

- object detection
- hand or person localization
- segmentation variants when the task is detection-heavy

Fit in this repo:

- good when the product really is detection-first
- useful as a first stage before a second model
- not always the best first tool for sign-language recognition

#### TensorRT

Best for:

- high-performance NVIDIA deployment
- lower latency once the model path is already stable

Fit in this repo:

- better as a later optimization than an early template choice

### 2. API And Contract Tooling

#### OpenAPI

Best for:

- keeping frontend and backend aligned
- documenting request and response shapes
- making model swaps safer

Fit in this repo:

- central to the current architecture
- the source of truth is `docs/openapi.yaml`

#### openapi-typescript

Best for:

- generating frontend types from the backend contract

Fit in this repo:

- already used through `frontend/src/generated/openapi.ts`
- should be rerun whenever the contract changes

### 3. Frontend Product Layer

#### Next.js

Best for:

- app shell
- file upload flows
- webcam UI
- review and QA interfaces

Fit in this repo:

- already provides the user-facing product layer
- should stay decoupled from model-specific logic

#### React

Best for:

- interactive result rendering
- overlays
- metrics panels
- webcam state and upload state

### 4. Backend Serving Layer

#### FastAPI

Best for:

- inference endpoints
- validation
- typed response models
- keeping model code behind a stable HTTP boundary

Fit in this repo:

- already the core backend
- the right place for model loading and inference orchestration

## Recommended Tool Combinations

### A. Detection Product

Use:

- `OpenCV` for simple CPU starter logic
- `YOLO` when you need real object detection
- `ONNX Runtime` for serving exported models
- `FastAPI + OpenAPI` for the contract

### B. Sign-Language MVP

Use:

- `MediaPipe Hand Landmarker`
- `PyTorch` for training
- `ONNX Runtime` for inference
- `FastAPI + OpenAPI`
- existing `Next.js` webcam flow

### C. Dynamic Sign Recognition

Use:

- `MediaPipe Holistic`
- `PyTorch` sequence model
- `ONNX Runtime`
- `FastAPI + OpenAPI`

### D. Analytics Or Quality Pipelines

Use:

- `OpenCV`
- `NumPy`
- existing metrics-oriented response shape

## Tool Choices By Question

- `Do I need a heavy ML model yet?`
  Use `OpenCV` first if the task is simple and deterministic.
- `Do I need detection boxes?`
  Use `YOLO` if classical CV is no longer enough.
- `Do I need landmarks, pose, or hand structure?`
  Use `MediaPipe`.
- `Do I need custom training?`
  Use `PyTorch`.
- `Do I want local serving after training?`
  Use `ONNX Runtime`.
- `Do I want the frontend to stay stable while models change?`
  Keep using `OpenAPI` and generated types.

## What To Avoid Early

- pushing raw model logic into the frontend
- tightly coupling UI components to one specific model output
- changing the response contract without updating `docs/openapi.yaml`
- adding a hosted API dependency for real-time features before you understand the latency tradeoff
- using YOLO for every vision problem just because it is popular

## Where These Tools Plug Into The Repo

- `frontend/`
  UI, upload, webcam capture, results rendering
- `backend/app/api/routes/`
  HTTP entrypoints
- `backend/app/vision/`
  model and pipeline logic
- `docs/openapi.yaml`
  contract source of truth
- `frontend/src/generated/openapi.ts`
  generated frontend types

## Practical Recommendation

If you are extending this template today:

- keep `Next.js + FastAPI + OpenAPI` as-is
- use `OpenCV` for preprocessing and utility steps
- choose `MediaPipe` for landmarks and gesture-like tasks
- choose `YOLO` for detection-heavy tasks
- train in `PyTorch`
- deploy inference with `ONNX Runtime`

That combination keeps the repo teachable, modular, and close to production patterns without making a hackathon project too heavy too early.

## Official References

- OpenCV: <https://opencv.org/>
- MediaPipe: <https://ai.google.dev/edge/mediapipe/solutions/guide>
- ONNX Runtime: <https://onnxruntime.ai/docs/>
- PyTorch: <https://pytorch.org/docs/stable/index.html>
- Ultralytics YOLO: <https://docs.ultralytics.com/>
- FastAPI: <https://fastapi.tiangolo.com/>
- Next.js: <https://nextjs.org/docs>
- OpenAPI: <https://swagger.io/specification/>
