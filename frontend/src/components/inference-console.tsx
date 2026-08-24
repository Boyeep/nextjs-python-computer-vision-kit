"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { AnalysisPreview } from "@/components/analysis-preview";
import { analyzeImage, demoPipelines, fetchPipelineCatalog, getPreferredPipelineId, type AnalyzeResponse, type PipelineSummary } from "@/lib/api";

export function InferenceConsole() {
  const [pipelines, setPipelines] = useState<PipelineSummary[]>(demoPipelines);
  const [selectedPipeline, setSelectedPipeline] = useState(() => getPreferredPipelineId(demoPipelines));
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewDimensions, setPreviewDimensions] = useState<{ width: number; height: number } | null>(null);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connectionMode, setConnectionMode] = useState<"checking" | "live" | "fallback">("checking");
  const [isPending, startTransition] = useTransition();
  const [inputMode, setInputMode] = useState<"upload" | "camera">("upload");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const previewRequestRef = useRef(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    void fetchPipelineCatalog(controller.signal).then((payload) => {
      setPipelines(payload.pipelines);
      setConnectionMode(payload.source);
      setSelectedPipeline((current) => getPreferredPipelineId(payload.pipelines, current));
    });
    return () => controller.abort();
  }, []);

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  useEffect(() => () => streamRef.current?.getTracks().forEach((track) => track.stop()), []);

  useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isCameraActive]);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsCameraActive(false);
  }

  async function startCamera() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setIsCameraActive(true);
    } catch {
      setError("Camera access failed. Check your browser permission.");
    }
  }

  function changeInputMode(mode: "upload" | "camera") {
    if (mode === "upload") stopCamera();
    setInputMode(mode);
    setError(null);
  }

  function captureFrame() {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const capturedFile = new File([blob], `camera-${Date.now()}.jpg`, { type: "image/jpeg" });
      const nextPreviewUrl = URL.createObjectURL(capturedFile);
      setFile(capturedFile);
      setResult(null);
      setPreviewDimensions({ width: canvas.width, height: canvas.height });
      setPreviewUrl((current) => { if (current) URL.revokeObjectURL(current); return nextPreviewUrl; });
      stopCamera();
    }, "image/jpeg", 0.92);
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] ?? null;
    setFile(nextFile); setResult(null); setError(null); setPreviewDimensions(null);
    previewRequestRef.current += 1;
    if (!nextFile) {
      setPreviewUrl((current) => { if (current) URL.revokeObjectURL(current); return null; });
      return;
    }
    const nextRequestId = previewRequestRef.current;
    const nextPreviewUrl = URL.createObjectURL(nextFile);
    setPreviewUrl((current) => { if (current) URL.revokeObjectURL(current); return nextPreviewUrl; });
    const image = new window.Image();
    image.onload = () => { if (previewRequestRef.current === nextRequestId) setPreviewDimensions({ width: image.naturalWidth, height: image.naturalHeight }); };
    image.src = nextPreviewUrl;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) { setError("Choose an image first."); return; }
    setError(null);
    startTransition(() => { void analyzeImage({ file, pipelineId: selectedPipeline }).then(setResult).catch((cause) => { setResult(null); setError(cause instanceof Error ? cause.message : "Analysis failed."); }); });
  }

  const detections = result?.detections ?? [];
  const segmentations = result?.segmentations ?? [];

  return (
    <section className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-[2rem] bg-[#f7f8f4] shadow-[0_24px_80px_rgba(42,58,54,0.12)] lg:grid-cols-[220px_minmax(0,1fr)_250px] lg:grid-rows-1 xl:grid-cols-[250px_minmax(0,1fr)_280px]">
      <form className="flex min-h-0 flex-col bg-[#dbe5d8] p-4 md:p-5 max-lg:grid max-lg:grid-cols-[1fr_1.4fr_auto] max-lg:items-center max-lg:gap-4" onSubmit={handleSubmit}>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">Workspace</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.05em]">Image lab</h1>
        </div>
        <div className="mt-6 space-y-4 max-lg:mt-0 max-lg:grid max-lg:grid-cols-2 max-lg:gap-3 max-lg:space-y-0">
          <label className="block">
            <span className="mb-2 block text-xs font-medium text-[var(--muted)]">Pipeline</span>
            <span className="relative block">
              <select className="h-11 w-full cursor-pointer appearance-none rounded-2xl bg-white/70 py-0 pl-3 pr-10 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]" value={selectedPipeline} onChange={(event) => setSelectedPipeline(event.target.value)}>
                {pipelines.map((pipeline) => <option key={pipeline.id} value={pipeline.id}>{pipeline.name}</option>)}
              </select>
              <svg aria-hidden="true" className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground)]" fill="none" viewBox="0 0 24 24"><path d="m7 10 5 5 5-5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
            </span>
          </label>
          <div>
            <span className="mb-2 block text-xs font-medium text-[var(--muted)]">Input</span>
            <div className="grid h-11 grid-cols-2 rounded-2xl bg-white/45 p-1 text-xs font-semibold">
              <button className={`cursor-pointer rounded-xl transition ${inputMode === "upload" ? "bg-white shadow-sm" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`} onClick={() => changeInputMode("upload")} type="button">Upload</button>
              <button className={`cursor-pointer rounded-xl transition ${inputMode === "camera" ? "bg-white shadow-sm" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`} onClick={() => changeInputMode("camera")} type="button">Camera</button>
            </div>
          </div>
          {inputMode === "upload" ? <label className="group col-span-full flex min-h-20 cursor-pointer flex-col items-center justify-center rounded-[1.5rem] bg-white/55 px-4 text-center transition hover:bg-white/85 focus-within:ring-2 focus-within:ring-[var(--accent)] max-lg:min-h-11 max-lg:flex-row max-lg:gap-2">
              <span className="text-xl text-[var(--accent)]">＋</span><span className="text-sm font-semibold">Choose image</span><span className="mt-1 max-w-full truncate text-[11px] text-[var(--muted)]">{file?.name ?? "PNG, JPG or WEBP"}</span>
              <input accept="image/png,image/jpeg,image/webp" className="sr-only" type="file" onChange={handleFileChange} />
            </label> : <button className="col-span-full h-12 cursor-pointer rounded-full bg-white/65 text-sm font-semibold transition hover:bg-white" onClick={isCameraActive ? captureFrame : () => void startCamera()} type="button">{isCameraActive ? "Capture frame" : "Start camera"}</button>}
        </div>
        <div className="mt-auto space-y-3 pt-5 max-lg:mt-0 max-lg:pt-0">
          {error ? <p className="rounded-2xl bg-[#f5d8ce] px-3 py-2 text-xs text-[#762f20]" role="alert">{error}</p> : null}
          <button className="h-12 w-full rounded-full bg-[var(--accent)] text-sm font-semibold text-white shadow-[0_12px_24px_rgba(238,105,69,0.24)] transition hover:-translate-y-0.5 hover:bg-[#d95837] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)] disabled:opacity-45" disabled={isPending || !selectedPipeline} type="submit">{isPending ? "Analyzing…" : "Run analysis"}</button>
          <p className="text-center font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--muted)]">{connectionMode === "live" ? "Live backend" : connectionMode === "fallback" ? "Demo catalog" : "Connecting"}</p>
        </div>
      </form>

      <div className="flex min-h-0 flex-col p-4 md:p-5">
        <div className="flex shrink-0 items-center justify-between pb-3">
          <div><p className="text-sm font-semibold">Preview</p><p className="text-[11px] text-[var(--muted)]">Detection overlay</p></div>
          {result ? <span className="rounded-full bg-[var(--lime)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em]">Complete</span> : null}
        </div>
        <div className="vision-preview relative min-h-0 flex-1 overflow-hidden rounded-[1.75rem] bg-[#e7e9e1] p-2">
          {inputMode === "camera" && isCameraActive ? <><video ref={videoRef} autoPlay className="h-full w-full rounded-[1.25rem] bg-[#17211f] object-contain" muted playsInline /><button className="absolute bottom-5 left-1/2 h-14 w-14 -translate-x-1/2 cursor-pointer rounded-full bg-white p-1 shadow-xl transition hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]" aria-label="Capture frame" onClick={captureFrame} type="button"><span className="block h-full w-full rounded-full bg-[var(--accent)]" /></button></> : <AnalysisPreview fileName={file?.name} previewDimensions={previewDimensions} previewUrl={previewUrl} result={result} />}
        </div>
      </div>

      <aside className="hidden min-h-0 flex-col bg-[#242f2c] p-5 text-white lg:flex">
        <div className="flex items-center justify-between"><div><p className="text-sm font-semibold">Results</p><p className="text-[11px] text-white/45">Latest run</p></div><span className="h-2.5 w-2.5 rounded-full bg-[var(--accent)]" /></div>
        {result ? <>
          <div className="mt-7 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/7 p-3"><p className="text-2xl font-semibold">{detections.length}</p><p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-white/45">Boxes</p></div>
            <div className="rounded-2xl bg-white/7 p-3"><p className="text-2xl font-semibold">{segmentations.length}</p><p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-white/45">Masks</p></div>
          </div>
          <div className="mt-6 min-h-0 space-y-2 overflow-hidden">
            {[...detections, ...segmentations].slice(0, 5).map((item, index) => <div className="flex items-center justify-between rounded-2xl bg-white/6 px-3 py-3" key={`${item.label}-${index}`}><span className="truncate text-sm capitalize">{item.label.replaceAll("-", " ")}</span><span className="font-mono text-xs text-white/55">{Math.round(item.confidence * 100)}%</span></div>)}
          </div>
          <div className="mt-auto rounded-2xl bg-[var(--violet)] p-3 text-[var(--foreground)]"><p className="truncate text-xs font-semibold">{result.pipeline.name}</p><p className="mt-1 font-mono text-[9px] uppercase tracking-[0.12em] opacity-60">{result.image.width} × {result.image.height}</p></div>
        </> : <div className="flex flex-1 flex-col justify-center"><span className="text-5xl font-light text-white/18">↗</span><p className="mt-5 text-xl font-medium tracking-[-0.04em]">Results land here.</p><p className="mt-2 text-sm leading-6 text-white/45">Add an image and run the pipeline.</p></div>}
      </aside>
    </section>
  );
}
