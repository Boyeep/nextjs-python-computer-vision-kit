"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";

import { AnalysisResults } from "@/components/analysis-results";
import {
  analyzeImage,
  demoPipelines,
  fetchPipelineCatalog,
  getPreferredPipelineId,
  type AnalyzeResponse,
  type PipelineSummary,
} from "@/lib/api";

type CameraState = "idle" | "starting" | "live" | "blocked" | "unsupported";

export function WebcamConsole() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [pipelines, setPipelines] = useState<PipelineSummary[]>(demoPipelines);
  const [selectedPipeline, setSelectedPipeline] = useState<string>(() =>
    getPreferredPipelineId(demoPipelines),
  );
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraState, setCameraState] = useState<CameraState>("idle");
  const [connectionMode, setConnectionMode] = useState<"checking" | "live" | "fallback">(
    "checking",
  );
  const [isPending, startTransition] = useTransition();

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

  function stopCamera() {
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  async function startCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraState("unsupported");
      setError("This browser does not support webcam capture.");
      return;
    }

    setCameraState("starting");
    setError(null);

    try {
      stopCamera();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraState("live");
    } catch {
      setCameraState("blocked");
      setError("Camera access was blocked or is unavailable on this device.");
    }
  }

  async function captureFrameAsFile(): Promise<File> {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      throw new Error("Camera feed is not ready yet.");
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Unable to create a canvas capture context.");
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (value) => {
          if (value) {
            resolve(value);
            return;
          }

          reject(new Error("Unable to capture a webcam frame."));
        },
        "image/jpeg",
        0.92,
      );
    });

    return new File([blob], `webcam-${Date.now()}.jpg`, {
      type: "image/jpeg",
    });
  }

  function handleAnalyzeFrame() {
    setError(null);

    startTransition(() => {
      void (async () => {
        try {
          const file = await captureFrameAsFile();
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
              : "Webcam capture failed.",
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
            Optional Mode
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
            Reuse the detection contract from a live camera frame.
          </h2>
          <p className="max-w-xl text-sm leading-7 text-black/70">
            Webcam mode stays intentionally secondary. It proves you can capture a frame
            in the browser and still send it through the same inference endpoint instead
            of splitting your app into two incompatible flows.
          </p>
        </div>

        <div className="mt-8 space-y-5">
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

          <div className="overflow-hidden rounded-[24px] border border-black/10 bg-[#12242c]">
            <video
              ref={videoRef}
              autoPlay
              className="aspect-video w-full bg-black object-cover"
              muted
              playsInline
            />
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 text-sm text-white/75">
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/45">
                Camera state: {cameraState}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  className="rounded-full bg-[var(--accent)] px-4 py-2 font-medium text-[#1d1007] transition hover:translate-y-[-1px]"
                  onClick={startCamera}
                  type="button"
                >
                  {cameraState === "live" ? "Restart camera" : "Enable camera"}
                </button>
                <button
                  className="rounded-full border border-white/15 px-4 py-2 font-medium text-white transition hover:bg-white/8"
                  onClick={stopCamera}
                  type="button"
                >
                  Stop
                </button>
                <button
                  className="rounded-full border border-white/15 px-4 py-2 font-medium text-white transition hover:bg-white/8 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={cameraState !== "live" || isPending}
                  onClick={handleAnalyzeFrame}
                  type="button"
                >
                  {isPending ? "Analyzing..." : "Capture and analyze"}
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-black/10 bg-[#fff4ea] px-4 py-4 text-sm text-black/70">
            <p className="font-semibold text-[var(--foreground)]">Keep upload as the main path</p>
            <p className="mt-2 leading-7">
              Public templates are easier to understand when image upload is still the
              default. Webcam mode is here to prove the architecture stretches naturally
              once the main detection flow already feels solid.
            </p>
            <Link
              className="mt-3 inline-flex rounded-full border border-black/10 px-4 py-2 font-medium text-[var(--foreground)] transition hover:bg-black/5"
              href="/"
            >
              Back to upload mode
            </Link>
          </div>

          {currentPipeline ? (
            <div className="rounded-[24px] border border-black/10 bg-white px-4 py-4 text-sm text-black/70">
              <p className="font-semibold text-[var(--foreground)]">{currentPipeline.name}</p>
              <p className="mt-2 leading-7">{currentPipeline.summary}</p>
            </div>
          ) : null}

          {error ? (
            <div className="rounded-[20px] border border-[#d46a4f]/30 bg-[#fff1ec] px-4 py-3 text-sm text-[#8b3b28]">
              {error}
            </div>
          ) : null}
        </div>
      </div>

      <AnalysisResults
        result={result}
        emptyDescription="Enable the camera, capture one frame, and compare the returned boxes and metrics to the upload flow. The point is not a second product path. The point is one reusable contract."
        emptyEyebrow="Waiting For Webcam Capture"
        emptyTitle="Start the camera and capture a detection frame."
      />
    </section>
  );
}
