import type { AnalyzeResponse } from "@/lib/api";

export const docsDemoImagePath = "/docs/sample-scene.png";

export const docsPreviewResult = {
  analysis_id: "analysis_demo_preview",
  pipeline: {
    id: "foreground-segmentation",
    name: "Foreground Segmentation",
    summary:
      "Segmentation extension pipeline that returns region polygons plus detection-style boxes.",
    tags: ["segmentation", "extension", "cpu"],
    runtime: "opencv-cpu",
    sample_outputs: ["region polygons", "mask coverage", "derived boxes"],
  },
  image: {
    filename: "sample-scene.png",
    content_type: "image/png",
    width: 1440,
    height: 900,
  },
  detections: [
    {
      label: "primary-object",
      confidence: 0.96,
      box: { x: 86, y: 116, width: 620, height: 648 },
      area_ratio: 0.309,
    },
    {
      label: "object-candidate",
      confidence: 0.82,
      box: { x: 872, y: 154, width: 296, height: 296 },
      area_ratio: 0.0676,
    },
    {
      label: "segment-region",
      confidence: 0.73,
      box: { x: 924, y: 456, width: 292, height: 330 },
      area_ratio: 0.0743,
    },
  ],
  segmentations: [
    {
      label: "primary-mask",
      confidence: 0.95,
      polygon: [
        { x: 90, y: 120 },
        { x: 700, y: 120 },
        { x: 700, y: 760 },
        { x: 90, y: 760 },
      ],
      box: { x: 90, y: 120, width: 610, height: 640 },
      area_ratio: 0.3012,
    },
    {
      label: "segment-region",
      confidence: 0.79,
      polygon: [
        { x: 930, y: 575 },
        { x: 1125, y: 455 },
        { x: 1210, y: 735 },
      ],
      box: { x: 930, y: 455, width: 280, height: 280 },
      area_ratio: 0.0518,
    },
    {
      label: "segment-region",
      confidence: 0.7,
      polygon: [
        { x: 256, y: 624 },
        { x: 311, y: 562 },
        { x: 442, y: 544 },
        { x: 529, y: 594 },
        { x: 554, y: 676 },
        { x: 502, y: 724 },
        { x: 376, y: 719 },
        { x: 279, y: 681 },
      ],
      box: { x: 255, y: 545, width: 300, height: 180 },
      area_ratio: 0.0417,
    },
  ],
  metrics: [
    { name: "object_candidates", value: 3 },
    { name: "largest_detection_ratio", value: 0.309 },
    { name: "segmented_regions", value: 3 },
    { name: "segmented_coverage", value: 0.3947 },
    { name: "edge_density", value: 0.0842 },
  ],
  generated_at: "2026-03-22T07:14:00.000Z",
} satisfies AnalyzeResponse;

export const docsWebcamResult = {
  analysis_id: "analysis_demo_webcam",
  pipeline: {
    id: "starter-detection",
    name: "Starter Detection",
    summary:
      "Detection-first sample pipeline that returns object-style boxes and confidence scores.",
    tags: ["detection", "default", "cpu"],
    runtime: "opencv-cpu",
    sample_outputs: ["object boxes", "confidence scores", "coverage metrics"],
  },
  image: {
    filename: "webcam-capture.jpg",
    content_type: "image/jpeg",
    width: 1440,
    height: 900,
  },
  detections: [
    {
      label: "primary-object",
      confidence: 0.94,
      box: { x: 118, y: 136, width: 590, height: 622 },
      area_ratio: 0.2828,
    },
    {
      label: "object-candidate",
      confidence: 0.8,
      box: { x: 874, y: 168, width: 284, height: 284 },
      area_ratio: 0.0622,
    },
    {
      label: "object-candidate",
      confidence: 0.74,
      box: { x: 926, y: 462, width: 286, height: 322 },
      area_ratio: 0.071,
    },
  ],
  segmentations: [],
  metrics: [
    { name: "object_candidates", value: 3 },
    { name: "largest_detection_ratio", value: 0.2828 },
    { name: "edge_density", value: 0.0773 },
  ],
  generated_at: "2026-03-22T07:19:00.000Z",
} satisfies AnalyzeResponse;
