"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";

import { AnalysisPreview } from "@/components/analysis-preview";
import { AnalysisResults } from "@/components/analysis-results";
import {
  analyzeImage,
  demoPipelines,
  fetchPipelineCatalog,
  getPreferredPipelineId,
  getApiBaseUrl,
  type AnalyzeResponse,
  type PipelineSummary,
} from "@/lib/api";

export function InferenceConsole() {
  const [pipelines, setPipelines] = useState<PipelineSummary[]>(demoPipelines);
  const [selectedPipeline, setSelectedPipeline] = useState<string>(() =>
    getPreferredPipelineId(demoPipelines),
  );
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewDimensions, setPreviewDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connectionMode, setConnectionMode] = useState<"checking" | "live" | "fallback">(
    "checking",
  );
  const [isPending, startTransition] = useTransition();
  const previewRequestRef = useRef(0);

  useEffect(() => {
    const controller = new AbortController();

    void fetchPipelineCatalog(controller.signal).then((payload) => {
      setPipelines(payload.pipelines);
      setConnectionMode(payload.source);
      setSelectedPipeline((current) =>
        getPreferredPipelineId(payload.pipelines, current),
      );
    });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] ?? null;

    setFile(nextFile);
    setResult(null);
    setError(null);
    setPreviewDimensions(null);

    if (!nextFile) {
      previewRequestRef.current += 1;
      setPreviewUrl((current) => {
        if (current) {
          URL.revokeObjectURL(current);
        }

        return null;
      });
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(nextFile);
    const nextRequestId = previewRequestRef.current + 1;
    previewRequestRef.current = nextRequestId;

    setPreviewUrl((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }

      return nextPreviewUrl;
    });

    const image = new window.Image();
    image.onload = () => {
      if (previewRequestRef.current === nextRequestId) {
        setPreviewDimensions({
          width: image.naturalWidth,
          height: image.naturalHeight,
        });
      }
    };
    image.onerror = () => {
      if (previewRequestRef.current === nextRequestId) {
        setPreviewDimensions(null);
      }
    };
    image.src = nextPreviewUrl;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!file) {
      setError("Choose an image before running the pipeline.");
      return;
    }

    setError(null);

    startTransition(() => {
      void (async () => {
        try {
          const nextResult = await analyzeImage({
            file,
            pipelineId: selectedPipeline,
          });

          setResult(nextResult);
        } catch (submissionError) {
          setResult(null);
          setError(
            submissionError instanceof Error
              ? submissionError.message
              : "Analysis failed.",
          );
        }
      })();
    });
  }

  const currentPipeline =
    pipelines.find((item) => item.id === selectedPipeline) ?? pipelines[0];

  return (
    <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="fade-up rounded-[32px] border border-black/10 bg-white/78 p-6 shadow-[0_32px_90px_rgba(10,20,25,0.12)] backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--foreground)]">
            Vision Console
          </span>
          <span className="rounded-full border border-black/10 px-3 py-1 font-mono text-xs text-black/65">
            {connectionMode === "live"
              ? "live backend"
              : connectionMode === "fallback"
                ? "demo catalog"
                : "checking backend"}
          </span>
        </div>

        <div className="mt-6 space-y-3">
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
            Upload once, get detection boxes, and inspect the contract.
          </h2>
          <p className="max-w-xl text-sm leading-7 text-black/70">
            This is the main happy path for the template: send one image to the FastAPI
            service, get object-style detections back, and render a response shape you
            can keep when you later swap in YOLO, ONNX Runtime, or a hosted model API.
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-black/75">Pipeline</span>
            <select
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-black/30"
              value={selectedPipeline}
              onChange={(event) => setSelectedPipeline(event.target.value)}
            >
              {pipelines.map((pipeline) => (
                <option key={pipeline.id} value={pipeline.id}>
                  {pipeline.name}
                </option>
              ))}
            </select>
          </label>

          <div className="rounded-[24px] border border-dashed border-black/15 bg-[#faf5ed] p-4">
            <label className="flex cursor-pointer flex-col gap-2">
              <span className="text-sm font-medium text-black/75">Upload image</span>
              <input
                accept="image/png,image/jpeg,image/webp"
                className="text-sm text-black/70 file:mr-4 file:rounded-full file:border-0 file:bg-[var(--foreground)] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
                type="file"
                onChange={handleFileChange}
              />
            </label>

            <AnalysisPreview
              fileName={file?.name}
              previewDimensions={previewDimensions}
              previewUrl={previewUrl}
              result={result}
            />
          </div>

          <div className="rounded-[24px] border border-black/10 bg-[#13262e] p-4 text-white">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/55">
                  Detection-First Contract
                </p>
                <p className="mt-2 text-sm text-white/85">{getApiBaseUrl()}/analyze</p>
              </div>
              <button
                className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[#1d1007] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isPending || !selectedPipeline}
                type="submit"
              >
                {isPending ? "Running..." : "Analyze Image"}
              </button>
            </div>
          </div>

          <div className="rounded-[24px] border border-black/10 bg-[#fff4ea] px-4 py-4 text-sm text-black/70">
            <p className="font-semibold text-[var(--foreground)]">Optional webcam mode</p>
            <p className="mt-2 leading-7">
              Once upload analysis feels right, reuse the same API contract from a live
              camera capture flow instead of inventing a second backend path.
            </p>
            <Link
              className="mt-3 inline-flex rounded-full border border-black/10 px-4 py-2 font-medium text-[var(--foreground)] transition hover:bg-black/5"
              href="/webcam"
            >
              Open webcam mode
            </Link>
          </div>

          {currentPipeline ? (
            <div className="rounded-[24px] border border-black/10 bg-white px-4 py-4 text-sm text-black/70">
              <p className="font-semibold text-[var(--foreground)]">{currentPipeline.name}</p>
              <p className="mt-2 leading-7">{currentPipeline.summary}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {currentPipeline.sample_outputs.map((output) => (
                  <span
                    key={output}
                    className="rounded-full bg-[var(--accent-soft)] px-3 py-1 font-mono text-xs text-black/70"
                  >
                    {output}
                  </span>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {currentPipeline.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-black/5 px-3 py-1 font-mono text-xs text-black/60"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {error ? (
            <div className="rounded-[20px] border border-[#d46a4f]/30 bg-[#fff1ec] px-4 py-3 text-sm text-[#8b3b28]">
              {error}
            </div>
          ) : null}
        </form>
      </div>

      <AnalysisResults
        result={result}
        emptyDescription="The response panel is intentionally built around detections first. Once the backend returns boxes, confidence, and metrics, you already have the review surface you need for QA, moderation, or human approval flows."
        emptyEyebrow="Waiting For Detection"
        emptyTitle="Upload a frame and inspect the detection contract."
      />
    </section>
  );
}
