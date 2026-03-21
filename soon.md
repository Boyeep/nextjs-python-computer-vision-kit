# Soon

Short public roadmap for the next upgrades to this computer-vision kit.

## Now

These are the highest-leverage next steps for the public template.

1. Bring the full overlay experience to webcam mode, including labels, filters, and export.
2. Add backend CI that runs the Python test suite in a real Python-enabled environment.
3. Add fixture images and golden outputs so API and UI behavior stay easy to verify.

## Next

These upgrades make the starter more useful for real teams without changing the repo's shape.

1. Add a model adapter layer for YOLO, ONNX Runtime, and hosted inference APIs.
2. Add per-pipeline controls for confidence thresholds, box filtering, and segmentation cleanup.
3. Add solo-class focus and hover linking in the preview overlay.
4. Add a side-by-side original vs annotated review mode.

## Later

These are larger product and platform expansions once the starter path feels mature.

1. Add batch inference for multiple images in one request.
2. Add async jobs for long-running inference workloads.
3. Add video ingestion that reuses the same contract frame by frame.
4. Add artifact storage and richer export flows.

## Separate Workspace

Training should stay adjacent to the app, not mixed into the runtime path.

1. Create a dedicated `training/` workspace.
2. Add dataset config templates for detection and segmentation.
3. Add evaluation and regression scripts for sample predictions.
4. Add experiment tracking hooks for metrics, artifacts, and model versions.

## Recommended Sequence

If you are extending the repo from here, the cleanest order is:

1. webcam overlay parity
2. backend CI + fixture-based verification
3. model adapter interface

That keeps the repo product-shaped while making it much easier to grow beyond the starter OpenCV pipelines.
