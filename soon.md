# Soon

The next upgrades for this computer-vision kit, ordered roughly from nearest-term wins to larger platform work.

## Product and UX

1. Add a solo-class focus mode so one click can show only one label on the overlay.
2. Add hover linking between legend items and overlay shapes.
3. Bring the full annotated overlay experience to webcam mode, including labels, filters, and PNG export.
4. Add a side-by-side original vs annotated preview mode for easier review.
5. Add video upload support that reuses the same inference contract frame by frame.

## Vision and Backend

1. Add a model adapter layer for YOLO, ONNX Runtime, and hosted inference APIs.
2. Add per-pipeline threshold controls for confidence, box filtering, and segmentation cleanup.
3. Add richer segmentation output options such as mask rasters and polygon smoothing.
4. Add batch inference support for multiple images in one request.
5. Add async jobs for long-running inference workloads.

## Training and Evaluation

1. Create a separate `training/` workspace instead of mixing training into the app runtime.
2. Add dataset config templates for detection and segmentation projects.
3. Add evaluation scripts for sample predictions and regression checking.
4. Add experiment tracking hooks for metrics, artifacts, and model versions.

## Developer Experience and Ops

1. Run backend `pytest` in a real Python-enabled environment and wire it into CI.
2. Add a backend Docker path so the FastAPI service is easy to boot without local Python setup issues.
3. Add fixture images and golden outputs for repeatable API and UI checks.
4. Add environment validation and clearer first-run setup scripts.
5. Add template docs for how to swap the sample OpenCV pipelines with production models.

## Recommended Next Move

If we keep following the current path, the best next upgrade is:

1. webcam overlay parity
2. real model adapter interface
3. backend test execution in CI

That keeps the template feeling product-ready while making it easier to grow beyond the starter OpenCV pipelines.
