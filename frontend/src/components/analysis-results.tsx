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
    <div className="fade-up bg-[#17211f] px-5 py-8 text-white lg:px-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/55">
            Response Shape
          </p>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight">
            Typed detections, metrics, and image metadata.
          </h3>
        </div>
        <span className="h-3 w-3 bg-[var(--accent)]" aria-hidden />
      </div>

      {result ? (
        <div className="mt-8 space-y-6">
          <div className="grid border-y border-white/15 sm:grid-cols-2">
            <div className="py-5 sm:border-r sm:border-white/15 sm:pr-5">
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/45">
                Analysis
              </p>
              <p className="mt-4 text-lg font-semibold">{result.analysis_id}</p>
              <p className="mt-2 text-sm text-white/70">
                {result.image.filename} · {result.image.width}x{result.image.height}
              </p>
            </div>
            <div className="py-5 sm:pl-5">
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/45">
                Pipeline
              </p>
              <p className="mt-4 text-lg font-semibold">{result.pipeline.name}</p>
              <p className="mt-2 text-sm text-white/70">{result.pipeline.runtime}</p>
            </div>
          </div>

          <div className="border-b border-white/15 pb-6">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/45">
              Metrics
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {result.metrics.map((metric) => (
                <div key={metric.name} className="border-l border-white/20 pl-4 py-1">
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

          <div className="border-b border-white/15 pb-6">
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
                    className="border-t border-white/10 py-4"
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
        <div className="mt-8 border-y border-white/15 py-16">
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
