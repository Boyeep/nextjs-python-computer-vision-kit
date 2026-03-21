import Image from "next/image";

import { AnalysisResults } from "@/components/analysis-results";
import { docsDemoImagePath, docsWebcamResult } from "@/lib/docs-demo";

export default function DocsPreviewWebcamPage() {
  return (
    <main className="min-h-screen overflow-hidden px-6 py-8 lg:px-10 lg:py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="rounded-[36px] border border-black/10 bg-white/76 px-7 py-8 shadow-[0_32px_90px_rgba(10,20,25,0.12)] backdrop-blur-xl lg:px-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--foreground)]">
              Webcam Preview
            </span>
            <span className="rounded-full border border-black/10 px-3 py-1 font-mono text-xs text-black/60">
              Same API, different input source
            </span>
          </div>

          <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-[-0.05em] text-[var(--foreground)]">
            The webcam extension still looks and feels like the same product.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-black/70">
            Capture is a frontend concern. The review surface, pipeline selection, and
            result shape all stay aligned with the upload flow.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[32px] border border-black/10 bg-white/78 p-6 shadow-[0_32px_90px_rgba(10,20,25,0.12)] backdrop-blur-xl">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--foreground)]">
                Optional Mode
              </span>
              <span className="rounded-full border border-black/10 px-3 py-1 font-mono text-xs text-black/65">
                seeded capture preview
              </span>
            </div>

            <div className="mt-6 space-y-3">
              <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                Reuse the detection contract from a live camera frame.
              </h2>
              <p className="max-w-xl text-sm leading-7 text-black/70">
                This mock state mirrors the public webcam page, but with a seeded frame so
                the docs can show the extension path clearly.
              </p>
            </div>

            <div className="mt-8 space-y-5">
              <div className="rounded-[24px] border border-black/10 bg-white px-4 py-4 text-sm text-black/70">
                <p className="font-semibold text-[var(--foreground)]">Starter Detection</p>
                <p className="mt-2 leading-7">
                  Detection-first sample pipeline that returns object-style boxes and
                  confidence scores.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["object boxes", "confidence scores", "coverage metrics"].map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-[var(--accent-soft)] px-3 py-1 font-mono text-xs text-black/70"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="overflow-hidden rounded-[24px] border border-black/10 bg-[#12242c]">
                <div className="relative aspect-video w-full">
                  <Image
                    alt="Seeded webcam capture preview"
                    className="object-cover"
                    fill
                    sizes="(max-width: 1024px) 100vw, 560px"
                    src={docsDemoImagePath}
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,36,44,0.08),rgba(18,36,44,0.18))]" />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 text-sm text-white/75">
                  <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/45">
                    Camera state: live
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      className="rounded-full bg-[var(--accent)] px-4 py-2 font-medium text-[#1d1007]"
                      type="button"
                    >
                      Restart camera
                    </button>
                    <button
                      className="rounded-full border border-white/15 px-4 py-2 font-medium text-white"
                      type="button"
                    >
                      Stop
                    </button>
                    <button
                      className="rounded-full border border-white/15 bg-white/8 px-4 py-2 font-medium text-white"
                      type="button"
                    >
                      Capture and analyze
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-black/10 bg-[#fff4ea] px-4 py-4 text-sm text-black/70">
                <p className="font-semibold text-[var(--foreground)]">Keep upload as the main path</p>
                <p className="mt-2 leading-7">
                  The starter still teaches image upload first. Webcam stays here as a
                  believable extension once the base contract already feels solid.
                </p>
              </div>
            </div>
          </div>

          <AnalysisResults
            emptyDescription=""
            emptyEyebrow=""
            emptyTitle=""
            result={docsWebcamResult}
          />
        </section>
      </div>
    </main>
  );
}
