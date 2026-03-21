from datetime import UTC, datetime
from uuid import uuid4

import cv2
import numpy as np

from app.config import Settings
from app.schemas import (
    AnalyzeResponse,
    BoundingBox,
    Detection,
    ImageMetadata,
    Metric,
    PolygonPoint,
    PipelineSummary,
    SegmentationRegion,
)
from app.vision.pipelines import PipelineDefinition


class UnknownPipelineError(ValueError):
    pass


class InvalidImageError(ValueError):
    pass


def _contour_to_polygon(contour: np.ndarray) -> list[PolygonPoint]:
    perimeter = cv2.arcLength(contour, True)
    polygon = cv2.approxPolyDP(contour, 0.02 * perimeter, True)

    if len(polygon) < 3:
        x, y, width, height = cv2.boundingRect(contour)
        return [
            PolygonPoint(x=x, y=y),
            PolygonPoint(x=x + width, y=y),
            PolygonPoint(x=x + width, y=y + height),
            PolygonPoint(x=x, y=y + height),
        ]

    return [
        PolygonPoint(x=int(point[0][0]), y=int(point[0][1]))
        for point in polygon[:24]
    ]


def _starter_detection(image: np.ndarray) -> tuple[list[dict], list[dict], list[dict]]:
    grayscale = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(grayscale, (5, 5), 0)
    edges = cv2.Canny(blurred, 60, 140)
    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    image_area = image.shape[0] * image.shape[1]
    detections = []
    largest_area_ratio = 0.0

    for contour in sorted(contours, key=cv2.contourArea, reverse=True):
        x, y, width, height = cv2.boundingRect(contour)
        area_ratio = (width * height) / image_area
        if area_ratio < 0.01:
            continue

        largest_area_ratio = max(largest_area_ratio, area_ratio)
        label = "primary-object" if area_ratio >= 0.12 else "object-candidate"
        detections.append(
            {
                "label": label,
                "confidence": min(0.98, round(0.42 + area_ratio * 2.8, 3)),
                "box": BoundingBox(x=x, y=y, width=width, height=height),
                "area_ratio": round(area_ratio, 4),
            }
        )

    metrics = [
        {
            "name": "edge_density",
            "value": round(float(np.count_nonzero(edges)) / image_area, 4),
        },
        {"name": "object_candidates", "value": len(detections)},
        {"name": "largest_detection_ratio", "value": round(largest_area_ratio, 4)},
    ]

    return detections, [], metrics


def _document_layout(image: np.ndarray) -> tuple[list[dict], list[dict], list[dict]]:
    grayscale = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    thresholded = cv2.adaptiveThreshold(
        grayscale,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY_INV,
        21,
        9,
    )
    contours, _ = cv2.findContours(
        thresholded,
        cv2.RETR_EXTERNAL,
        cv2.CHAIN_APPROX_SIMPLE,
    )

    image_area = image.shape[0] * image.shape[1]
    detections = []
    rectangular_regions = 0

    for contour in sorted(contours, key=cv2.contourArea, reverse=True):
        perimeter = cv2.arcLength(contour, True)
        polygon = cv2.approxPolyDP(contour, 0.02 * perimeter, True)
        x, y, width, height = cv2.boundingRect(polygon)
        area_ratio = (width * height) / image_area
        if area_ratio < 0.02:
            continue

        label = "document-candidate" if len(polygon) == 4 else "layout-block"
        if len(polygon) == 4:
            rectangular_regions += 1

        detections.append(
            {
                "label": label,
                "confidence": min(0.97, round(0.5 + area_ratio * 2.0, 3)),
                "box": BoundingBox(x=x, y=y, width=width, height=height),
                "area_ratio": round(area_ratio, 4),
            }
        )

    metrics = [
        {"name": "rectangular_regions", "value": rectangular_regions},
        {"name": "layout_candidates", "value": len(detections)},
    ]

    return detections, [], metrics


def _foreground_segmentation(
    image: np.ndarray,
) -> tuple[list[dict], list[dict], list[dict]]:
    grayscale = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(grayscale, (7, 7), 0)
    _, thresholded = cv2.threshold(
        blurred,
        0,
        255,
        cv2.THRESH_BINARY + cv2.THRESH_OTSU,
    )

    inverse = cv2.bitwise_not(thresholded)
    candidates = [thresholded, inverse]
    image_area = image.shape[0] * image.shape[1]

    best_mask = thresholded
    best_score = -1.0

    for candidate in candidates:
        cleaned = cv2.morphologyEx(
            candidate,
            cv2.MORPH_OPEN,
            np.ones((5, 5), dtype=np.uint8),
        )
        contours, _ = cv2.findContours(
            cleaned,
            cv2.RETR_EXTERNAL,
            cv2.CHAIN_APPROX_SIMPLE,
        )
        significant = [
            contour
            for contour in contours
            if cv2.contourArea(contour) / image_area >= 0.02
        ]
        score = sum(cv2.contourArea(contour) for contour in significant) / image_area
        if score > best_score:
            best_score = score
            best_mask = cleaned

    contours, _ = cv2.findContours(
        best_mask,
        cv2.RETR_EXTERNAL,
        cv2.CHAIN_APPROX_SIMPLE,
    )

    detections = []
    segmentations = []
    coverage_ratio = 0.0

    for contour in sorted(contours, key=cv2.contourArea, reverse=True):
        area_ratio = cv2.contourArea(contour) / image_area
        if area_ratio < 0.02:
            continue

        x, y, width, height = cv2.boundingRect(contour)
        polygon = _contour_to_polygon(contour)
        label = "primary-mask" if area_ratio >= 0.12 else "segment-region"
        confidence = min(0.97, round(0.5 + area_ratio * 2.0, 3))
        box = BoundingBox(x=x, y=y, width=width, height=height)

        detections.append(
            {
                "label": label,
                "confidence": confidence,
                "box": box,
                "area_ratio": round(area_ratio, 4),
            }
        )
        segmentations.append(
            {
                "label": label,
                "confidence": confidence,
                "polygon": polygon,
                "box": box,
                "area_ratio": round(area_ratio, 4),
            }
        )
        coverage_ratio += area_ratio

    metrics = [
        {"name": "segmented_regions", "value": len(segmentations)},
        {"name": "segmented_coverage", "value": round(min(coverage_ratio, 1.0), 4)},
    ]

    return detections, segmentations, metrics


def _dominant_color(image: np.ndarray) -> tuple[list[dict], list[dict], list[dict]]:
    rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    means = rgb.mean(axis=(0, 1))
    brightness = float(means.mean())
    dominant_channel = ["red", "green", "blue"][int(np.argmax(means))]

    metrics = [
        {"name": "dominant_channel", "value": dominant_channel},
        {"name": "mean_red", "value": round(float(means[0]), 2)},
        {"name": "mean_green", "value": round(float(means[1]), 2)},
        {"name": "mean_blue", "value": round(float(means[2]), 2)},
        {"name": "brightness", "value": round(brightness, 2), "unit": "0-255"},
    ]

    return [], [], metrics


PIPELINE_REGISTRY: dict[str, PipelineDefinition] = {
    "starter-detection": PipelineDefinition(
        id="starter-detection",
        name="Starter Detection",
        summary="Detection-first sample pipeline that returns object-style boxes and confidence scores.",
        tags=["detection", "default", "cpu"],
        runtime="opencv-cpu",
        sample_outputs=["object boxes", "confidence scores", "coverage metrics"],
        handler=_starter_detection,
    ),
    "document-layout": PipelineDefinition(
        id="document-layout",
        name="Document Layout",
        summary="Document-oriented box extraction for capture, scanning, and kiosk workflows.",
        tags=["detection", "document", "cpu"],
        runtime="opencv-cpu",
        sample_outputs=["quadrilateral candidates", "layout blocks"],
        handler=_document_layout,
    ),
    "foreground-segmentation": PipelineDefinition(
        id="foreground-segmentation",
        name="Foreground Segmentation",
        summary="Segmentation extension pipeline that returns region polygons plus detection-style boxes.",
        tags=["segmentation", "extension", "cpu"],
        runtime="opencv-cpu",
        sample_outputs=["region polygons", "mask coverage", "derived boxes"],
        handler=_foreground_segmentation,
    ),
    "dominant-color": PipelineDefinition(
        id="dominant-color",
        name="Dominant Color",
        summary="Metrics-only extension pipeline for quality and image analytics workflows.",
        tags=["analytics", "extension", "cpu"],
        runtime="opencv-cpu",
        sample_outputs=["channel metrics", "brightness"],
        handler=_dominant_color,
    ),
}


def list_pipelines() -> list[PipelineSummary]:
    return [
        PipelineSummary(
            id=item.id,
            name=item.name,
            summary=item.summary,
            tags=item.tags,
            runtime=item.runtime,
            sample_outputs=item.sample_outputs,
        )
        for item in PIPELINE_REGISTRY.values()
    ]


def analyze_image(
    *,
    image_bytes: bytes,
    filename: str,
    content_type: str,
    pipeline_id: str,
    settings: Settings,
) -> AnalyzeResponse:
    pipeline = PIPELINE_REGISTRY.get(pipeline_id)
    if pipeline is None:
        raise UnknownPipelineError(f"Unknown pipeline '{pipeline_id}'.")

    if len(image_bytes) > settings.max_upload_size_mb * 1024 * 1024:
        raise InvalidImageError(
            f"Upload exceeds the {settings.max_upload_size_mb} MB limit."
        )

    buffer = np.frombuffer(image_bytes, dtype=np.uint8)
    image = cv2.imdecode(buffer, cv2.IMREAD_COLOR)
    if image is None:
        raise InvalidImageError("Unable to decode the uploaded image.")

    raw_detections, raw_segmentations, raw_metrics = pipeline.handler(image)
    limited_detections = raw_detections[: settings.sample_max_detections]
    limited_segmentations = raw_segmentations[: settings.sample_max_detections]

    return AnalyzeResponse(
        analysis_id=f"analysis_{uuid4().hex[:12]}",
        pipeline=PipelineSummary(
            id=pipeline.id,
            name=pipeline.name,
            summary=pipeline.summary,
            tags=pipeline.tags,
            runtime=pipeline.runtime,
            sample_outputs=pipeline.sample_outputs,
        ),
        image=ImageMetadata(
            filename=filename,
            content_type=content_type,
            width=int(image.shape[1]),
            height=int(image.shape[0]),
        ),
        detections=[
            Detection(
                label=item["label"],
                confidence=item["confidence"],
                box=item["box"],
                area_ratio=item.get("area_ratio"),
            )
            for item in limited_detections
        ],
        segmentations=[
            SegmentationRegion(
                label=item["label"],
                confidence=item["confidence"],
                polygon=item["polygon"],
                box=item["box"],
                area_ratio=item.get("area_ratio"),
            )
            for item in limited_segmentations
        ],
        metrics=[
            Metric(
                name=item["name"],
                value=item["value"],
                unit=item.get("unit"),
            )
            for item in raw_metrics
        ],
        generated_at=datetime.now(UTC),
    )
