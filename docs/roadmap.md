# Sign-Language Roadmap

This roadmap answers a specific question:

What is the best way to turn this `Next.js + FastAPI` computer-vision template into a sign-language project without fighting the repo shape?

## Short Answer

For this template, the optimal path is:

1. prototype in `Colab` or a local notebook
2. train a small model on landmarks, not raw images
3. export the model to `ONNX`
4. run inference in the FastAPI backend
5. reuse the existing webcam and upload flows in the frontend
6. keep the API contract stable while the model improves

That is the best fit for this repo when the goal is a usable MVP, especially for:

- a sign alphabet demo
- a small vocabulary of static signs
- a single-user webcam experience

It is not automatically the best path for:

- full sign-language translation
- multi-person scenes
- long video understanding
- mobile-first deployment

## Scope Assumption

This roadmap assumes the first release is:

- one signer
- webcam-first
- real-time or near-real-time
- a limited sign set
- product demo quality before research-grade accuracy

If the target is full language understanding from day one, this roadmap should still be used as the starting path, but you should expect an additional sequence-model and dataset phase later.

## Core Principles

- keep the repo detection-first and inference-first
- do training outside the runtime path
- keep the backend responsible for model loading and output shaping
- keep the frontend focused on capture, review, and feedback
- preserve the API contract as long as possible
- add complexity only when the current phase is clearly limiting you

## Why This Is The Optimal Path Here

This repo already gives you:

- webcam capture
- image upload
- a backend inference service
- a typed API contract
- a review-oriented frontend

The fastest way to make that useful for sign language is not to rebuild the whole stack. It is to swap the starter backend pipeline for a sign-focused pipeline and keep the rest of the product flow intact.

## Recommended Stack

- `MediaPipe Hand Landmarker` for the MVP
- `PyTorch` for training
- `ONNX` as the exported model format
- `ONNX Runtime` for backend serving
- `FastAPI` as the inference boundary
- existing `Next.js` webcam and upload UI for the product layer

Why:

- landmarks are easier to learn from than full frames for a small sign set
- webcam latency is better with local inference than a hosted API
- `ONNX Runtime` is a strong deployment path from training into production
- this fits the current repo without turning it into a research notebook dump

## What Not To Do First

- do not start with `YOLO` as the main recognizer for a single-person webcam demo
- do not start by changing the frontend to run the whole model client-side
- do not jump to full sentence-level sign translation before a static-sign baseline works
- do not mix training notebooks and runtime inference code into the same backend module
- do not add hosted model dependencies unless you are comfortable with latency and cost

## Phase 0: Define The Product Slice

Goal:

- pick a first version of the problem that this template can actually ship

Recommended choice:

- `ASL alphabet` or a `small sign set` of 10 to 30 classes

Deliverables:

- sign list
- class naming convention
- target frame size
- camera assumptions
- simple success metric such as top-1 accuracy plus prediction latency

Exit criteria:

- the team agrees on whether this is `static signs` or `dynamic signs`
- the project has a clear demo target

## Phase 1: Prototype In Colab Or A Notebook

Goal:

- prove that the signs can be separated with a lightweight pipeline

Use:

- `Colab` if you want quick setup and easy sharing
- local notebook if you want tighter control and local files

Tasks:

- collect or import a small labeled dataset
- run `MediaPipe Hand Landmarker`
- extract hand landmarks
- build a baseline classifier in `PyTorch`
- measure accuracy, confusion, and latency

Deliverables:

- one notebook that can reproduce baseline results
- sample confusion matrix
- saved training artifacts

Exit criteria:

- the model is clearly better than guessing
- you know which labels are confused
- you can export the trained model or reproduce the training run

## Phase 2: Separate Training From Runtime

Goal:

- stop treating the notebook as the product

Recommended repo shape:

- `notebooks/` for experiments
- `training/` later if training becomes a real workspace
- backend stays focused on inference only

Tasks:

- document dataset assumptions
- save model version metadata
- define reproducible preprocessing steps
- export the best baseline to `ONNX`

Deliverables:

- `ONNX` model artifact
- preprocessing notes
- label map

Exit criteria:

- the model can be loaded outside the notebook
- preprocessing is stable and documented

## Phase 3: Add A Sign Pipeline To The Backend

Goal:

- make the trained model available through the template's inference service

Best fit in this repo:

- add a new pipeline in `backend/app/vision/service.py`
- keep model-specific loading behind the vision service boundary
- reuse `backend/app/api/routes/inference.py`

Recommended first pipeline:

- `sign-static`

Tasks:

- load the `ONNX` model in the backend
- run landmark extraction
- run classification
- return typed results
- add tests for the pipeline behavior

Contract guidance:

- preserve the existing response shape where possible
- use detections for hand boxes if available
- use metrics for latency or handedness
- if classification needs first-class output, add a clean typed field in `docs/openapi.yaml` instead of model-specific ad hoc fields

Deliverables:

- working backend sign pipeline
- tests for known fixtures
- updated API contract if needed

Exit criteria:

- the frontend can call the pipeline through the existing endpoint
- the output is typed and documented

## Phase 4: Reuse The Existing Frontend

Goal:

- get value from the template instead of rewriting the UI

Use:

- `frontend/src/components/webcam-console.tsx`
- `frontend/src/components/inference-console.tsx`

Tasks:

- add the new pipeline to the pipeline list
- show the predicted sign prominently
- show confidence and relevant metrics
- optionally render hand boxes or landmarks
- keep the review surface simple

Recommended UX for the first version:

- live prediction
- confidence score
- top alternative prediction
- capture frame button
- clear visual state when confidence is low

Exit criteria:

- a user can open the webcam page and get understandable predictions
- the result panel feels product-shaped, not notebook-shaped

## Phase 5: Add Evaluation And Regression Checks

Goal:

- make the sign pipeline safe to change

Tasks:

- add fixture images or short frame sets
- add snapshot-backed API responses when practical
- measure latency in the backend
- track per-class accuracy outside the runtime path

Deliverables:

- backend tests
- sample evaluation report
- performance notes

Exit criteria:

- you can change the model without guessing whether the app regressed

## Phase 6: Move From Static Signs To Dynamic Signs

Goal:

- support signs that depend on motion over time

When to do this:

- only after the static-sign path is stable

Recommended stack:

- `MediaPipe Holistic` or `hands + pose`
- a sequence model such as `LSTM`, `GRU`, or a small `Transformer`

Tasks:

- collect short sign sequences
- train a temporal model
- decide whether the backend needs a frame window or short clip input
- extend the API carefully if the current single-frame shape is no longer enough

Deliverables:

- `sign-sequence` pipeline
- temporal confidence output
- updated contract if frame windows are introduced

Exit criteria:

- the dynamic model beats the static baseline on motion-dependent signs

## Phase 7: Production Hardening

Goal:

- make the project reliable enough for real demos or deployment

Tasks:

- add model versioning
- improve error handling for camera and input failures
- benchmark CPU and memory usage
- consider GPU or TensorRT only if latency actually requires it
- add observability for inference timing and failure rates

Deliverables:

- versioned model loading
- release notes for model changes
- deployment checklist

Exit criteria:

- the app is repeatable, testable, and stable across environments

## Suggested Milestone Order

1. static-sign scope
2. notebook baseline
3. `ONNX` export
4. backend `sign-static` pipeline
5. webcam UI integration
6. tests and evaluation
7. dynamic-sign extension
8. production hardening

## Decision Rules

- if one webcam user is the target, prefer landmarks before object detection
- if you need full-body or facial context, move from hands-only to holistic features
- if the notebook cannot reproduce results, do not integrate the model yet
- if the frontend needs model-specific fields, add them through OpenAPI, not hidden assumptions
- if latency is good enough on CPU, do not optimize infrastructure early

## Where To Put Things

- experiments: `notebooks/`
- future repeatable training workspace: `training/`
- inference integration: `backend/app/vision/`
- contract updates: `docs/openapi.yaml`
- generated frontend types: `frontend/src/generated/openapi.ts`
- user-facing capture and review UI: `frontend/src/components/`

## Recommended First Release

The best first release for a sign-language adaptation of this template is:

- static signs only
- webcam-first
- one signer
- local inference
- typed backend contract
- visible confidence score
- clear fallback when confidence is low

That is realistic, demonstrable, and aligned with the template's strengths.

## Related Docs

- `docs/sign-language-template.md`
- `docs/tooling.md`
- `soon.md`
