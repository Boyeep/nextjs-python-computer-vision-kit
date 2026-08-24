"use client";

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
    <section className="grid border-y border-[var(--line)] lg:grid-cols-[0.92fr_1.08fr]">
      <div className="fade-up py-8 lg:border-r lg:border-[var(--line)] lg:pr-10">
        <div className="flex flex-wrap items-center gap-3">
          <span className="border-l-2 border-[var(--accent)] pl-3 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--foreground)]">
            Vision Console
          </span>
          <span className="font-mono text-xs text-[var(--muted)]">
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
              className="min-h-12 w-full border-x-0 border-t-0 border-b border-[var(--line)] bg-transparent px-0 py-3 text-sm outline-none transition-colors focus:border-[var(--accent)]"
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

          <div className="border-y border-[var(--line)] py-5">
            <label className="flex cursor-pointer flex-col gap-2">
              <span className="text-sm font-medium text-black/75">Upload image</span>
              <input
                accept="image/png,image/jpeg,image/webp"
                className="min-h-12 text-sm text-[var(--muted)] file:mr-4 file:min-h-11 file:cursor-pointer file:border-0 file:bg-[var(--foreground)] file:px-5 file:py-2 file:text-sm file:font-medium file:text-white file:transition-colors file:hover:bg-[var(--accent-strong)]"
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

          <div className="bg-[var(--foreground)] px-5 py-4 text-white">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/55">
                  Detection-First Contract
                </p>
                <p className="mt-2 text-sm text-white/85">{getApiBaseUrl()}/analyze</p>
              </div>
              <button
                className="min-h-12 bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#d95837] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isPending || !selectedPipeline}
                type="submit"
              >
                {isPending ? "Running..." : "Analyze Image"}
              </button>
            </div>
          </div>

          {currentPipeline ? (
            <div className="border-l border-[var(--line)] pl-4 text-sm text-[var(--muted)]">
              <p className="font-semibold text-[var(--foreground)]">{currentPipeline.name}</p>
              <p className="mt-2 leading-7">{currentPipeline.summary}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {currentPipeline.sample_outputs.map((output) => (
                  <span
                    key={output}
                    className="border-b border-[var(--accent)] py-1 font-mono text-xs text-[var(--foreground)]"
                  >
                    {output}
                  </span>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {currentPipeline.tags.map((tag) => (
                  <span
                    key={tag}
                    className="py-1 font-mono text-xs text-[var(--muted)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {error ? (
            <div className="border-l-2 border-[var(--accent)] bg-[#f5ddd4] px-4 py-3 text-sm text-[#762f20]" role="alert">
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
