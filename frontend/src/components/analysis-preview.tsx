"use client";

import Image from "next/image";
import { useState } from "react";

import type { AnalyzeResponse } from "@/lib/api";

type PreviewDimensions = {
  width: number;
  height: number;
};

type AnalysisPreviewProps = {
  previewUrl: string | null;
  fileName?: string;
  previewDimensions: PreviewDimensions | null;
  result: AnalyzeResponse | null;
};

type OverlayKind = "detection" | "segmentation";

type OverlayBadgeProps = {
  x: number;
  y: number;
  label: string;
  confidence: number;
  frame: PreviewDimensions;
  palette: OverlayPalette;
};

type OverlayMode = "both" | "detections" | "segmentations";

type OverlayPalette = {
  accentFill: string;
  badgeFill: string;
  legendFill: string;
  stroke: string;
  textColor: string;
};

const LABEL_PALETTES: OverlayPalette[] = [
  {
    accentFill: "#ffb08d",
    badgeFill: "#fff2ea",
    legendFill: "#ffe2d5",
    stroke: "#ff7a45",
    textColor: "#7b2f16",
  },
  {
    accentFill: "#89e2f7",
    badgeFill: "#e6fbff",
    legendFill: "#daf7ff",
    stroke: "#0ea5b7",
    textColor: "#0d4c5d",
  },
  {
    accentFill: "#ad9bff",
    badgeFill: "#f2efff",
    legendFill: "#ece8ff",
    stroke: "#6f5af8",
    textColor: "#31236f",
  },
  {
    accentFill: "#8bdd9b",
    badgeFill: "#edf9ef",
    legendFill: "#daf3df",
    stroke: "#2f9e44",
    textColor: "#155724",
  },
  {
    accentFill: "#f6a6ff",
    badgeFill: "#fff0fd",
    legendFill: "#fde4fb",
    stroke: "#d946ef",
    textColor: "#6f1f72",
  },
  {
    accentFill: "#ffd67a",
    badgeFill: "#fff8e8",
    legendFill: "#fff1c9",
    stroke: "#f59e0b",
    textColor: "#7a4a00",
  },
  {
    accentFill: "#ff9f9f",
    badgeFill: "#fff1f1",
    legendFill: "#ffe0e0",
    stroke: "#ef4444",
    textColor: "#7c1d1d",
  },
  {
    accentFill: "#9ec3ff",
    badgeFill: "#eef5ff",
    legendFill: "#dbeafe",
    stroke: "#3b82f6",
    textColor: "#173a77",
  },
];

function getFrameDimensions(
  result: AnalyzeResponse | null,
  previewDimensions: PreviewDimensions | null,
): PreviewDimensions {
  if (result) {
    return {
      width: result.image.width,
      height: result.image.height,
    };
  }

  if (previewDimensions) {
    return previewDimensions;
  }

  return {
    width: 4,
    height: 3,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function hashLabel(label: string): number {
  let hash = 0;

  for (let index = 0; index < label.length; index += 1) {
    hash = (hash << 5) - hash + label.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
}

function getOverlayPalette(label: string): OverlayPalette {
  return LABEL_PALETTES[hashLabel(label) % LABEL_PALETTES.length];
}

function formatOverlayLabel(label: string): string {
  return label.replaceAll("-", " ");
}

function formatConfidence(confidence: number): string {
  return `${(confidence * 100).toFixed(0)}%`;
}

function getBadgeText(label: string, confidence: number): string {
  return `${formatOverlayLabel(label)} ${formatConfidence(confidence)}`;
}

function createDownloadName(fileName?: string): string {
  const fallback = "analysis-preview";
  const source = fileName?.trim() || fallback;
  const sanitized = source.replace(/\.[^.]+$/, "").replace(/[^a-z0-9-_]+/gi, "-");
  return `${sanitized || fallback}-annotated.png`;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to load the preview image."));
    image.src = src;
  });
}

function drawRoundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

function drawOverlayBadgeOnCanvas(
  context: CanvasRenderingContext2D,
  options: {
    x: number;
    y: number;
    label: string;
    confidence: number;
    frame: PreviewDimensions;
    palette: OverlayPalette;
  },
) {
  const { x, y, label, confidence, frame, palette } = options;
  const fontSize = clamp(Math.round(Math.min(frame.width, frame.height) * 0.03), 11, 16);
  const horizontalPadding = clamp(Math.round(fontSize * 0.55), 6, 10);
  const badgeHeight = fontSize + horizontalPadding;
  const text = getBadgeText(label, confidence);

  context.save();
  context.font = `600 ${fontSize}px monospace`;

  const badgeWidth = clamp(
    Math.round(context.measureText(text).width + horizontalPadding * 2),
    70,
    Math.max(70, frame.width - 8),
  );
  const badgeX = clamp(x, 4, Math.max(4, frame.width - badgeWidth - 4));
  const badgeY = clamp(y, 4, Math.max(4, frame.height - badgeHeight - 4));
  const radius = Math.round(fontSize * 0.45);

  drawRoundedRect(context, badgeX, badgeY, badgeWidth, badgeHeight, radius);
  context.fillStyle = palette.badgeFill;
  context.globalAlpha = 0.94;
  context.fill();
  context.globalAlpha = 1;
  context.strokeStyle = palette.stroke;
  context.lineWidth = 2;
  context.stroke();

  context.fillStyle = palette.textColor;
  context.textBaseline = "middle";
  context.fillText(text, badgeX + horizontalPadding, badgeY + badgeHeight / 2);
  context.restore();
}

function getLegendItems(
  result: AnalyzeResponse,
  showDetections: boolean,
  showSegmentations: boolean,
): Array<{
  key: string;
  kind: OverlayKind;
  label: string;
  palette: OverlayPalette;
}> {
  const items: Array<{
    key: string;
    kind: OverlayKind;
    label: string;
    palette: OverlayPalette;
  }> = [];
  const seen = new Set<string>();

  if (showSegmentations) {
    for (const region of result.segmentations) {
      const key = `segmentation:${region.label}`;
      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      items.push({
        key,
        kind: "segmentation",
        label: region.label,
        palette: getOverlayPalette(region.label),
      });
    }
  }

  if (showDetections) {
    for (const detection of result.detections) {
      const key = `detection:${detection.label}`;
      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      items.push({
        key,
        kind: "detection",
        label: detection.label,
        palette: getOverlayPalette(detection.label),
      });
    }
  }

  return items.slice(0, 8);
}

function OverlayBadge({
  x,
  y,
  label,
  confidence,
  frame,
  palette,
}: OverlayBadgeProps) {
  const fontSize = clamp(Math.round(Math.min(frame.width, frame.height) * 0.03), 11, 16);
  const horizontalPadding = clamp(Math.round(fontSize * 0.55), 6, 10);
  const badgeHeight = fontSize + horizontalPadding;
  const text = getBadgeText(label, confidence);
  const badgeWidth = clamp(
    Math.round(text.length * fontSize * 0.62 + horizontalPadding * 2),
    70,
    Math.max(70, frame.width - 8),
  );
  const badgeX = clamp(x, 4, Math.max(4, frame.width - badgeWidth - 4));
  const badgeY = clamp(y, 4, Math.max(4, frame.height - badgeHeight - 4));

  return (
    <g>
      <rect
        fill={palette.badgeFill}
        height={badgeHeight}
        opacity="0.94"
        rx={Math.round(fontSize * 0.45)}
        stroke={palette.stroke}
        strokeWidth="2"
        width={badgeWidth}
        x={badgeX}
        y={badgeY}
      />
      <text
        fill={palette.textColor}
        fontFamily="var(--font-ibm-plex-mono), monospace"
        fontSize={fontSize}
        fontWeight="600"
        x={badgeX + horizontalPadding}
        y={badgeY + badgeHeight / 2 + fontSize * 0.32}
      >
        {text}
      </text>
    </g>
  );
}

export function AnalysisPreview({
  previewUrl,
  fileName,
  previewDimensions,
  result,
}: AnalysisPreviewProps) {
  const [preferredOverlayMode, setPreferredOverlayMode] =
    useState<OverlayMode>("both");
  const [segmentationOpacity, setSegmentationOpacity] = useState(18);
  const [hiddenLegendKeys, setHiddenLegendKeys] = useState<string[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const frame = getFrameDimensions(result, previewDimensions);
  const hasDetections = !!result && result.detections.length > 0;
  const hasSegmentations = !!result && result.segmentations.length > 0;
  const hasOverlay = hasDetections || hasSegmentations;
  const overlayMode =
    preferredOverlayMode === "detections" && !hasDetections
      ? hasSegmentations
        ? "segmentations"
        : "both"
      : preferredOverlayMode === "segmentations" && !hasSegmentations
        ? hasDetections
          ? "detections"
          : "both"
        : preferredOverlayMode;
  const showDetections =
    hasDetections &&
    (overlayMode === "both" || overlayMode === "detections");
  const showSegmentations =
    hasSegmentations &&
    (overlayMode === "both" || overlayMode === "segmentations");
  const segmentationBadgeOffset = clamp(Math.round(frame.height * 0.035), 14, 26);
  const detectionBadgeOffset = clamp(Math.round(frame.height * 0.012), 6, 12);
  const legendItems = result
    ? getLegendItems(result, showDetections, showSegmentations)
    : [];
  const allowedLegendKeySet = new Set(legendItems.map((item) => item.key));
  const hiddenLegendKeySet = new Set(
    hiddenLegendKeys.filter((key) => allowedLegendKeySet.has(key)),
  );

  if (!previewUrl) {
    return (
      <div className="mt-4 rounded-[20px] border border-black/10 bg-white px-4 py-10 text-center text-sm text-black/55">
        Drop in a PNG, JPG, or WebP file to preview it here. After analysis, detection
        boxes and segmentation polygons will render on top of the image.
      </div>
    );
  }

  function isLegendItemVisible(key: string): boolean {
    return !hiddenLegendKeySet.has(key);
  }

  function toggleLegendItem(key: string) {
    setHiddenLegendKeys((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key],
    );
  }

  function showAllLegendItems() {
    setHiddenLegendKeys([]);
  }

  async function handleDownload() {
    if (!result || !hasOverlay || !previewUrl) {
      return;
    }

    setIsDownloading(true);
    setDownloadError(null);

    try {
      const image = await loadImage(previewUrl);
      const canvas = document.createElement("canvas");
      canvas.width = result.image.width;
      canvas.height = result.image.height;

      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error("Unable to create an export canvas.");
      }

      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      if (showSegmentations) {
        for (const region of result.segmentations) {
          if (!isLegendItemVisible(`segmentation:${region.label}`)) {
            continue;
          }

          const palette = getOverlayPalette(region.label);
          context.save();
          context.beginPath();
          region.polygon.forEach((point, index) => {
            if (index === 0) {
              context.moveTo(point.x, point.y);
              return;
            }

            context.lineTo(point.x, point.y);
          });
          context.closePath();
          context.fillStyle = palette.accentFill;
          context.globalAlpha = segmentationOpacity / 100;
          context.fill();
          context.globalAlpha = 1;
          context.strokeStyle = palette.stroke;
          context.lineJoin = "round";
          context.lineWidth = 3;
          context.stroke();
          context.restore();

          drawOverlayBadgeOnCanvas(context, {
            x: region.box.x,
            y: region.box.y - segmentationBadgeOffset,
            label: region.label,
            confidence: region.confidence,
            frame,
            palette,
          });
        }
      }

      if (showDetections) {
        for (const detection of result.detections) {
          if (!isLegendItemVisible(`detection:${detection.label}`)) {
            continue;
          }

          const palette = getOverlayPalette(detection.label);
          context.save();
          context.strokeStyle = palette.stroke;
          context.lineWidth = 3;
          context.setLineDash([12, 8]);
          drawRoundedRect(
            context,
            detection.box.x,
            detection.box.y,
            detection.box.width,
            detection.box.height,
            8,
          );
          context.stroke();
          context.restore();

          drawOverlayBadgeOnCanvas(context, {
            x: detection.box.x,
            y: detection.box.y + detectionBadgeOffset,
            label: detection.label,
            confidence: detection.confidence,
            frame,
            palette,
          });
        }
      }

      const downloadUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = createDownloadName(fileName);
      link.click();
    } catch (error) {
      setDownloadError(
        error instanceof Error ? error.message : "Unable to export the annotated preview.",
      );
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="mt-4 overflow-hidden rounded-[20px] border border-black/10 bg-white">
      <div
        className="relative bg-[linear-gradient(135deg,#fbf4ea_0%,#f4ede2_100%)]"
        style={{ aspectRatio: `${frame.width} / ${frame.height}` }}
      >
        <Image
          alt={fileName ?? "Selected preview"}
          className="object-contain"
          fill
          sizes="(max-width: 1024px) 100vw, 560px"
          src={previewUrl}
          unoptimized
        />

        {hasOverlay ? (
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            preserveAspectRatio="xMidYMid meet"
            viewBox={`0 0 ${frame.width} ${frame.height}`}
          >
            {showSegmentations
              ? result.segmentations.map((region, index) => (
                  (() => {
                    if (!isLegendItemVisible(`segmentation:${region.label}`)) {
                      return null;
                    }

                    const palette = getOverlayPalette(region.label);

                    return (
                      <g key={`${region.label}-${index}-polygon`}>
                        <polygon
                          fill={palette.accentFill}
                          fillOpacity={segmentationOpacity / 100}
                          points={region.polygon
                            .map((point) => `${point.x},${point.y}`)
                            .join(" ")}
                          stroke={palette.stroke}
                          strokeLinejoin="round"
                          strokeWidth="3"
                        />
                        <OverlayBadge
                          confidence={region.confidence}
                          frame={frame}
                          label={region.label}
                          palette={palette}
                          x={region.box.x}
                          y={region.box.y - segmentationBadgeOffset}
                        />
                      </g>
                    );
                  })()
                ))
              : null}

            {showDetections
              ? result.detections.map((detection, index) => (
                  (() => {
                    if (!isLegendItemVisible(`detection:${detection.label}`)) {
                      return null;
                    }

                    const palette = getOverlayPalette(detection.label);

                    return (
                      <g key={`${detection.label}-${index}-box`}>
                        <rect
                          fill="none"
                          height={detection.box.height}
                          rx="8"
                          stroke={palette.stroke}
                          strokeDasharray="12 8"
                          strokeWidth="3"
                          width={detection.box.width}
                          x={detection.box.x}
                          y={detection.box.y}
                        />
                        <OverlayBadge
                          confidence={detection.confidence}
                          frame={frame}
                          label={detection.label}
                          palette={palette}
                          x={detection.box.x}
                          y={detection.box.y + detectionBadgeOffset}
                        />
                      </g>
                    );
                  })()
                ))
              : null}
          </svg>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/8 px-4 py-3 text-xs text-black/60">
        <div className="flex flex-wrap items-center gap-3">
          {legendItems.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {legendItems.map((item) => (
                <button
                  key={item.key}
                  className="inline-flex items-center rounded-full border px-3 py-1 font-mono text-[11px] transition hover:translate-y-[-1px]"
                  onClick={() => toggleLegendItem(item.key)}
                  type="button"
                  style={{
                    backgroundColor: isLegendItemVisible(item.key)
                      ? item.palette.legendFill
                      : "#f5f2ec",
                    borderColor: `${item.palette.stroke}55`,
                    color: isLegendItemVisible(item.key)
                      ? item.palette.textColor
                      : "#7d7467",
                    opacity: isLegendItemVisible(item.key) ? 1 : 0.55,
                  }}
                >
                  <span
                    className="mr-2 inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: item.palette.stroke }}
                  />
                  {formatOverlayLabel(item.label)}
                  <span className="ml-2 uppercase opacity-65">
                    {item.kind === "segmentation" ? "mask" : "box"}
                  </span>
                </button>
              ))}

              {hiddenLegendKeys.length > 0 ? (
                <button
                  className="rounded-full border border-black/10 bg-white px-3 py-1 font-mono text-[11px] transition hover:bg-black/5"
                  onClick={showAllLegendItems}
                  type="button"
                >
                  show all
                </button>
              ) : null}
            </div>
          ) : (
            <span className="rounded-full border border-black/10 bg-white px-3 py-1 font-mono text-[11px]">
              legend appears after analysis
            </span>
          )}

          {hasOverlay ? (
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-wrap gap-2">
                <button
                  className={`rounded-full px-3 py-1 font-mono transition ${
                    overlayMode === "both"
                      ? "bg-[var(--foreground)] text-white"
                      : "border border-black/10 bg-white text-black/60 hover:bg-black/5"
                  }`}
                  onClick={() => setPreferredOverlayMode("both")}
                  type="button"
                >
                  both
                </button>
                <button
                  className={`rounded-full px-3 py-1 font-mono transition ${
                    overlayMode === "detections"
                      ? "bg-[#0d4c5d] text-white"
                      : "border border-black/10 bg-white text-black/60 hover:bg-black/5"
                  }`}
                  disabled={!hasDetections}
                  onClick={() => setPreferredOverlayMode("detections")}
                  type="button"
                >
                  detections
                </button>
                <button
                  className={`rounded-full px-3 py-1 font-mono transition ${
                    overlayMode === "segmentations"
                      ? "bg-[#7b2f16] text-white"
                      : "border border-black/10 bg-white text-black/60 hover:bg-black/5"
                  }`}
                  disabled={!hasSegmentations}
                  onClick={() => setPreferredOverlayMode("segmentations")}
                  type="button"
                >
                  segmentations
                </button>
              </div>

              {hasSegmentations ? (
                <label className="flex items-center gap-3 rounded-full border border-black/10 bg-white px-3 py-1 font-mono text-[11px] uppercase tracking-[0.16em] text-black/60">
                  <span>mask opacity {segmentationOpacity}%</span>
                  <input
                    className="h-1.5 w-24 accent-[#ff7a45]"
                    max="60"
                    min="5"
                    onChange={(event) =>
                      setSegmentationOpacity(Number(event.target.value))
                    }
                    type="range"
                    value={segmentationOpacity}
                  />
                </label>
              ) : null}

              <button
                className="rounded-full border border-black/10 bg-white px-3 py-1 font-mono transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!hasOverlay || isDownloading}
                onClick={handleDownload}
                type="button"
              >
                {isDownloading ? "exporting..." : "download png"}
              </button>
            </div>
          ) : null}
        </div>
        <div className="flex flex-col items-end gap-1">
          <p className="font-mono">
            {result
              ? `${result.image.width}x${result.image.height}`
              : previewDimensions
                ? `${previewDimensions.width}x${previewDimensions.height}`
                : "preview"}
          </p>
          {downloadError ? (
            <p className="max-w-[220px] text-right text-[11px] text-[#8b3b28]">
              {downloadError}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
