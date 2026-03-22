# Sign Language Stack For This Template

This repo is a good fit for a sign-language project, but the best stack depends on what you mean by "sign language."

## Start With The Problem Shape

There are three common versions of this project:

1. `Static hand signs`
   Example: alphabet letters or a small fixed set of hand poses.
2. `Dynamic signs`
   Example: signs that depend on motion over time, not a single frame.
3. `Full sign-language understanding`
   Example: larger vocabularies where hand shape, motion, body pose, and face cues matter together.

The further you move from static poses into real sign language, the less a simple object detector is enough on its own.

## Best Recommendation For This Repo

For this template, the strongest path is:

- `Frontend`: keep using the existing Next.js webcam or upload flow
- `Feature extraction`: use `MediaPipe` hand landmarks first
- `Model training`: use `PyTorch`
- `Inference runtime`: export to `ONNX` and run with `ONNX Runtime` in the backend
- `Backend API`: keep FastAPI as the contract boundary

That gives you a practical stack that is:

- fast enough for demos and hackathons
- easier to train than raw image-to-label models
- more stable than trying to force YOLO into a gesture problem
- compatible with this repo's existing "analyze image or frame and return typed results" shape

## What To Use By Project Type

### 1. Static Sign Demo

Use this when you want:

- alphabet recognition
- a small vocabulary
- one signer in front of a webcam
- a fast MVP

Recommended stack:

- `MediaPipe Hand Landmarker`
- a small classifier on top of hand landmarks
- `PyTorch` for training
- `ONNX Runtime` for backend inference

Why:

- landmarks reduce the amount of visual noise
- you do not need a heavy detector for a single webcam user
- training on landmarks is usually easier than training on raw images

### 2. Dynamic Sign Recognition

Use this when the sign depends on motion across multiple frames.

Recommended stack:

- `MediaPipe Holistic` or at least `hands + pose`
- sequence model such as `LSTM`, `GRU`, or a small `Transformer`
- `PyTorch` for training
- `ONNX Runtime` for serving

Why:

- many signs are not defined by one frame
- temporal context matters
- body and face cues can matter, not only the hand outline

### 3. Larger Or More Realistic Sign-Language Systems

Use this when you want more than a demo and need better linguistic coverage.

Recommended stack:

- `MediaPipe Holistic`
- a sequence model over landmarks and possibly cropped image features
- optional dataset tooling for alignment and labeling
- `ONNX Runtime` or another production runtime

Important note:

If the goal is actual sign language rather than "gesture control," a hands-only pipeline will likely cap out early.

## Where It Fits In This Repo

### Frontend

Use the existing webcam and upload experience as the input layer:

- `frontend/src/components/webcam-console.tsx`
- `frontend/src/components/inference-console.tsx`

That means you can keep the product flow the repo already teaches:

1. capture or upload an image or frame
2. send it to the backend
3. receive typed results
4. render overlays, labels, and metrics

### Backend

The backend is where the actual CV or ML logic should live:

- `backend/app/vision/service.py`
- `backend/app/vision/pipelines.py`
- `backend/app/api/routes/inference.py`

The cleanest extension is to add a new pipeline entry such as:

- `sign-static`
- `sign-sequence`

That keeps the repo's pipeline registry pattern intact.

### Contract

If you change the shape of the response, also update:

- `docs/openapi.yaml`
- `frontend/src/generated/openapi.ts`

If you can keep the response close to the existing typed contract, integration stays easier.

## Recommended Output Shape

For a sign-language MVP in this template, I would return:

- top predicted sign label
- confidence score
- optional hand boxes or landmark-derived regions
- metrics such as handedness, frame count, or latency

For dynamic signs, consider adding:

- sequence window size
- temporal confidence
- optional "still collecting frames" status

Try to avoid coupling the frontend to raw model internals. Keep the backend responsible for translating model output into product-friendly fields.

## When To Use YOLO

`YOLO` is useful when you need detection, such as:

- multiple people in frame
- signer localization in a wide camera view
- hand or person detection before a second-stage recognizer

It is usually not my first recommendation for a single-user webcam sign demo because:

- you still need recognition after detection
- landmarks are often a better representation for sign tasks
- it adds training and inference complexity early

## When To Use A Hosted Model

A hosted model can be useful for:

- quick experiments
- low-ops prototypes
- testing ideas before local deployment

But for sign-language interaction, local inference is often better because of:

- lower latency
- lower recurring cost
- better privacy
- fewer network dependencies during demos

## Suggested Build Order

1. `MVP`
   Add a `sign-static` backend pipeline using hand landmarks and a small classifier.
2. `Webcam loop`
   Reuse the current webcam page and submit captured frames to the same inference endpoint.
3. `Temporal model`
   Add a second pipeline for dynamic signs using short frame sequences.
4. `Contract refinement`
   Expand the API only when the frontend truly needs more than label, confidence, and review metadata.

## Simple Decision Guide

- If you want a fast hackathon demo: `MediaPipe Hand Landmarker + small classifier`
- If you want real-time local inference: `PyTorch -> ONNX -> ONNX Runtime`
- If you want broader sign understanding: `MediaPipe Holistic + sequence model`
- If you need person or hand detection in messy scenes: add `YOLO` as a helper, not the whole solution

## Official References

- MediaPipe Hand Landmarker: <https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker>
- MediaPipe Gesture Recognizer: <https://ai.google.dev/edge/mediapipe/solutions/vision/gesture_recognizer>
- MediaPipe Gesture customization: <https://ai.google.dev/edge/mediapipe/solutions/customization/gesture_recognizer>
- MediaPipe Holistic Landmarker: <https://ai.google.dev/edge/mediapipe/solutions/vision/holistic_landmarker>
- ONNX Runtime docs: <https://onnxruntime.ai/docs/>
- Ultralytics YOLO docs: <https://docs.ultralytics.com/>
