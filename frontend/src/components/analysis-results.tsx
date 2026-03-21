import type { AnalyzeResponse } from "@/lib/api";

function formatMetricValue(value: string | number): string {
  if (typeof value === "number") {
    return Number.isInteger(value) ? value.toString() : value.toFixed(2);
  }

  return value;
}

function formatAreaRatio(areaRatio?: number): string | null {
  if (typeof areaRatio !== "number") {
    return null;
  }

  return `${(areaRatio * 100).toFixed(1)}% frame area`;
}

type AnalysisResultsProps = {
  result: AnalyzeResponse | null;
  emptyEyebrow: string;
  emptyTitle: string;
  emptyDescription: string;
};

export function AnalysisResults({
  result,
  emptyEyebrow,
  emptyTitle,
  emptyDescription,
}: AnalysisResultsProps) {
  const showSegmentationSection =
    !!result &&
    (result.segmentations.length > 0 ||
      result.pipeline.tags.includes("segmentation"));

  return (
    <div className="fade-up rounded-[32px] border border-black/10 bg-[#13262e] p-6 text-white shadow-[0_32px_90px_rgba(10,20,25,0.16)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/55">
            Response Shape
          </p>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight">
            Typed detections, segmentations, metrics, and image metadata.
          </h3>
        </div>
        <div className="mesh-orb h-16 w-16 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,195,163,0.9),rgba(255,106,61,0.15))]" />
      </div>

      {result ? (
        <div className="mt-8 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[24px] border border-white/10 bg-white/6 p-4">
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/45">
                Analysis
              </p>
              <p className="mt-4 text-lg font-semibold">{result.analysis_id}</p>
              <p className="mt-2 text-sm text-white/70">
                {result.image.filename} · {result.image.width}x{result.image.height}
              </p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/6 p-4">
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/45">
                Pipeline
              </p>
              <p className="mt-4 text-lg font-semibold">{result.pipeline.name}</p>
              <p className="mt-2 text-sm text-white/70">{result.pipeline.runtime}</p>
            </div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/6 p-5">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/45">
              Metrics
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {result.metrics.map((metric) => (
                <div key={metric.name} className="rounded-[18px] bg-black/10 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/45">
                    {metric.name.replaceAll("_", " ")}
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    {formatMetricValue(metric.value)}
                    {metric.unit ? ` ${metric.unit}` : ""}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {showSegmentationSection ? (
            <div className="rounded-[24px] border border-white/10 bg-white/6 p-5">
              <div className="flex items-center justify-between gap-4">
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/45">
                  Segmentations
                </p>
                <p className="text-sm text-white/55">
                  {result.segmentations.length} region
                  {result.segmentations.length === 1 ? "" : "s"}
                </p>
              </div>

              {result.segmentations.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {result.segmentations.map((region, index) => (
                    <div
                      key={`${region.label}-${index}`}
                      className="rounded-[18px] border border-white/10 bg-black/10 px-4 py-3"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <p className="font-semibold capitalize">
                          {region.label.replaceAll("-", " ")}
                        </p>
                        <p className="font-mono text-sm text-white/65">
                          {(region.confidence * 100).toFixed(1)}%
                        </p>
                      </div>
                      <p className="mt-2 text-sm text-white/65">
                        {region.polygon.length} polygon point
                        {region.polygon.length === 1 ? "" : "s"} · x={region.box.x},
                        y={region.box.y}, w={region.box.width}, h={region.box.height}
                      </p>
                      {formatAreaRatio(region.area_ratio) ? (
                        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/45">
                          {formatAreaRatio(region.area_ratio)}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-[18px] border border-dashed border-white/10 bg-black/10 px-4 py-6 text-sm text-white/60">
                  This segmentation-ready pipeline did not return any large enough
                  regions for the current image.
                </div>
              )}
            </div>
          ) : null}

          <div className="rounded-[24px] border border-white/10 bg-white/6 p-5">
            <div className="flex items-center justify-between gap-4">
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/45">
                Detections
              </p>
              <p className="text-sm text-white/55">
                {result.detections.length} candidate
                {result.detections.length === 1 ? "" : "s"}
              </p>
            </div>

            {result.detections.length > 0 ? (
              <div className="mt-4 space-y-3">
                {result.detections.map((detection, index) => (
                  <div
                    key={`${detection.label}-${index}`}
                    className="rounded-[18px] border border-white/10 bg-black/10 px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-semibold capitalize">
                        {detection.label.replaceAll("-", " ")}
                      </p>
                      <p className="font-mono text-sm text-white/65">
                        {(detection.confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                    <p className="mt-2 text-sm text-white/65">
                      x={detection.box.x}, y={detection.box.y}, w={detection.box.width},
                      h={detection.box.height}
                    </p>
                    {formatAreaRatio(detection.area_ratio) ? (
                      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/45">
                        {formatAreaRatio(detection.area_ratio)}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-[18px] border border-dashed border-white/10 bg-black/10 px-4 py-6 text-sm text-white/60">
                This pipeline returned metrics only. That is useful for analytics or QA
                workflows where the product cares more about signals than boxes.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-8 rounded-[28px] border border-dashed border-white/10 bg-white/4 px-6 py-12">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/45">
            {emptyEyebrow}
          </p>
          <h4 className="mt-4 text-2xl font-semibold tracking-tight">{emptyTitle}</h4>
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/68">
            {emptyDescription}
          </p>
        </div>
      )}
    </div>
  );
}
