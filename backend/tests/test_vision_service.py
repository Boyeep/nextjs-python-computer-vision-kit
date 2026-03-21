import cv2
import numpy as np

from app.config import Settings
from app.vision.service import analyze_image


def test_starter_detection_pipeline_returns_metrics() -> None:
    canvas = np.zeros((240, 320, 3), dtype=np.uint8)
    cv2.rectangle(canvas, (30, 30), (280, 180), (255, 255, 255), thickness=-1)

    success, encoded = cv2.imencode(".jpg", canvas)
    assert success

    result = analyze_image(
        image_bytes=encoded.tobytes(),
        filename="synthetic.jpg",
        content_type="image/jpeg",
        pipeline_id="starter-detection",
        settings=Settings(),
    )

    assert result.pipeline.id == "starter-detection"
    assert result.image.width == 320
    assert result.segmentations == []
    assert any(metric.name == "edge_density" for metric in result.metrics)


def test_foreground_segmentation_pipeline_returns_regions() -> None:
    canvas = np.zeros((240, 320, 3), dtype=np.uint8)
    cv2.circle(canvas, (160, 120), 70, (255, 255, 255), thickness=-1)

    success, encoded = cv2.imencode(".jpg", canvas)
    assert success

    result = analyze_image(
        image_bytes=encoded.tobytes(),
        filename="segmentation.jpg",
        content_type="image/jpeg",
        pipeline_id="foreground-segmentation",
        settings=Settings(),
    )

    assert result.pipeline.id == "foreground-segmentation"
    assert len(result.segmentations) >= 1
    assert result.segmentations[0].polygon
    assert any(metric.name == "segmented_regions" for metric in result.metrics)
