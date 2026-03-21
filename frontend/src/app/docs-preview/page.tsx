import { AnalysisPreview } from "@/components/analysis-preview";
import { AnalysisResults } from "@/components/analysis-results";
import { docsDemoImagePath, docsPreviewResult } from "@/lib/docs-demo";

export default function DocsPreviewPage() {
  return (
    <main className="min-h-screen overflow-hidden px-6 py-8 lg:px-10 lg:py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="rounded-[36px] border border-black/10 bg-white/76 px-7 py-8 shadow-[0_32px_90px_rgba(10,20,25,0.12)] backdrop-blur-xl lg:px-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--foreground)]">
              Docs Preview
            </span>
            <span className="rounded-full border border-black/10 px-3 py-1 font-mono text-xs text-black/60">
              Detection + segmentation showcase
            </span>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.05em] text-[var(--foreground)]">
                Screenshot-ready preview of the kit&apos;s main product path.
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-black/70">
                One static scene, one typed response shape, and the same polished overlay
                UI the public starter ships with.
              </p>
            </div>

            <div className="grid gap-3 rounded-[28px] border border-black/10 bg-[#13262e] p-5 text-white">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/45">
                  Included in the template
                </p>
                <p className="mt-3 text-lg font-semibold tracking-tight">
                  Upload workflow, overlay controls, typed results, and the first
                  segmentation extension.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {["starter-detection", "foreground-segmentation", "webcam mode"].map(
                  (item) => (
                    <span
                      key={item}
                      className="rounded-full border border-white/10 bg-white/8 px-3 py-1 font-mono text-[11px] text-white/72"
                    >
                      {item}
                    </span>
                  ),
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[32px] border border-black/10 bg-white/78 p-6 shadow-[0_32px_90px_rgba(10,20,25,0.12)] backdrop-blur-xl">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--foreground)]">
                Vision Console
              </span>
              <span className="rounded-full border border-black/10 px-3 py-1 font-mono text-xs text-black/65">
                seeded demo state
              </span>
            </div>

            <div className="mt-6 space-y-3">
              <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                Upload once, inspect detections, and keep the contract stable.
              </h2>
              <p className="max-w-xl text-sm leading-7 text-black/70">
                The docs preview uses a seeded response so the overlay, legend,
                segmentation controls, and review panel all stay screenshot-friendly.
              </p>
            </div>

            <AnalysisPreview
              fileName={docsPreviewResult.image.filename}
              previewDimensions={null}
              previewUrl={docsDemoImagePath}
              result={docsPreviewResult}
            />
          </div>

          <AnalysisResults
            emptyDescription=""
            emptyEyebrow=""
            emptyTitle=""
            result={docsPreviewResult}
          />
        </section>
      </div>
    </main>
  );
}
