"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { ChevronDown, ScanLine, Settings, Upload, Video, X } from "lucide-react";
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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMirrored, setIsMirrored] = useState(true);
  const [showBoxes, setShowBoxes] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState(50);
  const [detectionInterval, setDetectionInterval] = useState(900);
  const [cameraFacing, setCameraFacing] = useState<"user" | "environment">("user");
  const previewRequestRef = useRef(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const liveRequestRef = useRef(false);

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

  useEffect(() => {
    if (!isCameraActive) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    async function detectFrame() {
      const video = videoRef.current;
      if (!video || !video.videoWidth || !video.videoHeight || liveRequestRef.current) {
        if (!cancelled) timer = setTimeout(detectFrame, 500);
        return;
      }

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      if (!context) return;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      liveRequestRef.current = true;

      try {
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.82));
        if (!blob || cancelled) return;
        const cameraResult = await analyzeImage({ file: new File([blob], "live-camera.jpg", { type: "image/jpeg" }), pipelineId: selectedPipeline });
        if (!cancelled) {
          setResult(cameraResult);
          setError(null);
        }
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : "Live detection stopped.");
          stopCamera();
        }
      } finally {
        liveRequestRef.current = false;
        if (!cancelled) timer = setTimeout(detectFrame, detectionInterval);
      }
    }

    void detectFrame();
    return () => { cancelled = true; clearTimeout(timer); };
  }, [detectionInterval, isCameraActive, selectedPipeline]);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsCameraActive(false);
  }

  async function startCamera() {
    if (connectionMode === "fallback") {
      setConnectionMode("checking");
      const payload = await fetchPipelineCatalog();
      setConnectionMode(payload.source);
      if (payload.source === "fallback") {
        setError("Vision API is offline. Run npm run dev from the repository root, then retry.");
        return;
      }
    }
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: cameraFacing }, audio: false });
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

  async function changeCameraFacing(facing: "user" | "environment") {
    const shouldRestart = isCameraActive;
    stopCamera();
    setCameraFacing(facing);
    if (shouldRestart) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing }, audio: false });
        streamRef.current = stream;
        setIsCameraActive(true);
      } catch {
        setError("Unable to switch camera. Check device availability.");
      }
    }
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
  const visibleDetections = detections.filter((detection) => detection.confidence * 100 >= confidenceThreshold);

  return (
    <section className="relative grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-[2rem] bg-[#f7f8f4] shadow-[0_24px_80px_rgba(42,58,54,0.12)] lg:grid-cols-[220px_minmax(0,1fr)_250px] lg:grid-rows-1 xl:grid-cols-[250px_minmax(0,1fr)_280px]">
      <form className="reveal flex min-h-0 flex-col bg-[#dbe5d8] p-3 [--reveal-delay:40ms] sm:p-4 lg:p-5" onSubmit={handleSubmit}>
        <div className="flex items-center justify-between lg:block">
          <p className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted)] lg:block">Workspace</p>
          <h1 className="text-lg font-semibold tracking-[-0.05em] lg:mt-2 lg:text-2xl">Image lab</h1>
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--muted)] lg:hidden">{connectionMode === "live" ? "API live" : connectionMode === "fallback" ? "API offline" : "Connecting"}</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2.5 lg:mt-6 lg:block lg:space-y-4">
          <label className="block">
            <span className="mb-2 block text-xs font-medium text-[var(--muted)]">Pipeline</span>
            <span className="relative block">
              <select className="h-11 w-full cursor-pointer appearance-none rounded-2xl bg-white/70 py-0 pl-3 pr-10 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]" value={selectedPipeline} onChange={(event) => setSelectedPipeline(event.target.value)}>
                {pipelines.map((pipeline) => <option key={pipeline.id} value={pipeline.id}>{pipeline.name}</option>)}
              </select>
              <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground)]" strokeWidth={2} />
            </span>
          </label>
          <div>
            <span className="mb-2 block text-xs font-medium text-[var(--muted)]">Input</span>
            <div className="grid h-11 grid-cols-2 rounded-2xl bg-white/45 p-1 text-xs font-semibold">
              <button className={`cursor-pointer rounded-xl transition ${inputMode === "upload" ? "bg-white shadow-sm" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`} onClick={() => changeInputMode("upload")} type="button">Upload</button>
              <button className={`cursor-pointer rounded-xl transition ${inputMode === "camera" ? "bg-white shadow-sm" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`} onClick={() => changeInputMode("camera")} type="button">Camera</button>
            </div>
          </div>
          {inputMode === "upload" ? <label className="group col-span-full flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-white/55 px-3 text-center transition hover:bg-white/85 focus-within:ring-2 focus-within:ring-[var(--accent)] lg:min-h-20 lg:flex-col lg:gap-0 lg:rounded-[1.5rem] lg:px-4">
              <Upload aria-hidden="true" className="h-4 w-4 text-[var(--accent)]" /><span className="text-xs font-semibold lg:text-sm">Choose image</span><span className="hidden mt-1 max-w-full truncate text-[11px] text-[var(--muted)] lg:block">{file?.name ?? "PNG, JPG or WEBP"}</span>
              <input accept="image/png,image/jpeg,image/webp" className="sr-only" type="file" onChange={handleFileChange} />
            </label> : <button className={`col-span-full flex h-11 min-w-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl px-3 text-xs font-semibold transition ${isCameraActive ? "bg-[var(--foreground)] text-white hover:bg-[#34433f]" : "bg-white/70 hover:bg-white"}`} onClick={isCameraActive ? stopCamera : () => void startCamera()} type="button">
              <Video aria-hidden="true" className="h-4 w-4 shrink-0" strokeWidth={1.8} />
              {isCameraActive ? "Stop camera" : "Start camera"}
            </button>}
        </div>
        <div className="mt-3 space-y-2 lg:mt-auto lg:space-y-3 lg:pt-5">
          {error ? <p className="rounded-xl bg-[#f5d8ce] px-3 py-2 text-[11px] leading-4 text-[#762f20] lg:rounded-2xl lg:text-xs" role="alert">{error}</p> : null}
          <button className="h-11 w-full rounded-xl bg-[var(--accent)] text-xs font-semibold text-white shadow-[0_12px_24px_rgba(238,105,69,0.24)] transition hover:-translate-y-0.5 hover:bg-[#d95837] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-45 lg:h-12 lg:rounded-full lg:text-sm" disabled={inputMode === "camera" || isPending || !selectedPipeline} type="submit">{inputMode === "camera" ? (isCameraActive ? "Detecting live…" : "Camera is off") : isPending ? "Analyzing…" : "Run analysis"}</button>
          <p className="hidden text-center font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--muted)] lg:block">{connectionMode === "live" ? "Live backend" : connectionMode === "fallback" ? "API offline" : "Connecting"}</p>
        </div>
      </form>

      <div className="reveal flex min-h-0 flex-col p-4 [--reveal-delay:120ms] md:p-5">
        <div className="flex shrink-0 items-center justify-between pb-3">
          <div><p className="text-sm font-semibold">Preview</p><p className="text-[11px] text-[var(--muted)]">Detection overlay</p></div>
          {result ? <span className="rounded-full bg-[var(--lime)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em]">Complete</span> : null}
        </div>
        <div className="vision-preview relative min-h-0 flex-1 overflow-hidden rounded-[1.75rem] bg-[#e7e9e1] p-2">
          {inputMode === "camera" && isCameraActive ? <div className="relative h-full overflow-hidden rounded-[1.25rem] bg-[#17211f]">
            <video ref={videoRef} autoPlay className={`h-full w-full object-contain ${isMirrored ? "scale-x-[-1]" : ""}`} muted playsInline />
            {result && showBoxes ? <svg aria-label="Live detection overlay" className="pointer-events-none absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet" viewBox={`0 0 ${result.image.width} ${result.image.height}`}>
              {visibleDetections.map((detection, index) => { const displayX = isMirrored ? result.image.width - detection.box.x - detection.box.width : detection.box.x; return <g key={`${detection.label}-${index}`}><rect fill="none" height={detection.box.height} rx="8" stroke="#ff7a45" strokeWidth="3" width={detection.box.width} x={displayX} y={detection.box.y} /><rect fill="#17211f" height="28" rx="8" width="118" x={displayX} y={Math.max(4, detection.box.y - 32)} /><text fill="white" fontFamily="monospace" fontSize="12" fontWeight="600" x={displayX + 9} y={Math.max(22, detection.box.y - 13)}>{`${detection.label.slice(0, 11)} ${Math.round(detection.confidence * 100)}%`}</text></g>; })}
            </svg> : null}
            {showLegend ? <div className="absolute left-4 top-4 flex max-w-[70%] flex-wrap gap-2">{visibleDetections.slice(0, 4).map((detection, index) => <span className="rounded-full bg-[#17211f]/85 px-3 py-1.5 font-mono text-[10px] text-white shadow-lg backdrop-blur" key={`${detection.label}-legend-${index}`}><span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-[var(--accent)]" />{detection.label.replaceAll("-", " ")}</span>)}</div> : null}
            <span className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.13em] text-[var(--foreground)] shadow-lg"><span className="h-2 w-2 rounded-full bg-[#58a36d]" />Live</span>
          </div> : <AnalysisPreview fileName={file?.name} previewDimensions={previewDimensions} previewUrl={previewUrl} result={result} />}
        </div>
      </div>

      <aside className="reveal hidden min-h-0 flex-col bg-[#242f2c] p-5 text-white [--reveal-delay:200ms] lg:flex">
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
        </> : <div className="flex flex-1 flex-col justify-center"><ScanLine aria-hidden="true" className="h-10 w-10 text-white/20" strokeWidth={1.4} /><p className="mt-5 text-xl font-medium tracking-[-0.04em]">Results land here.</p><p className="mt-2 text-sm leading-6 text-white/45">Add an image and run the pipeline.</p></div>}
      </aside>

      <button aria-expanded={isSettingsOpen} aria-label={isSettingsOpen ? "Close vision settings" : "Open vision settings"} className="reveal absolute bottom-5 right-5 z-20 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-white text-[var(--foreground)] shadow-[0_12px_36px_rgba(18,31,28,0.24)] transition [--reveal-delay:300ms] hover:rotate-12 hover:bg-[var(--lime)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]" onClick={() => setIsSettingsOpen((open) => !open)} type="button">
        <Settings aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />
      </button>
      {isSettingsOpen ? <div className="reveal absolute bottom-20 right-5 z-20 w-[min(310px,calc(100%-2.5rem))] rounded-[1.75rem] bg-white p-5 shadow-[0_24px_70px_rgba(18,31,28,0.28)]">
        <div className="flex items-center justify-between"><div><p className="text-sm font-semibold">Vision settings</p><p className="text-[11px] text-[var(--muted)]">Tune the live workspace</p></div><button aria-label="Close settings" className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#eef1eb]" onClick={() => setIsSettingsOpen(false)} type="button"><X aria-hidden="true" className="h-4 w-4" /></button></div>
        <div className="mt-5 space-y-4 text-xs">
          <label className="flex items-center justify-between gap-4"><span>Mirror camera</span><input checked={isMirrored} className="h-4 w-4 accent-[var(--accent)]" onChange={(event) => setIsMirrored(event.target.checked)} type="checkbox" /></label>
          <label className="flex items-center justify-between gap-4"><span>Show boxes</span><input checked={showBoxes} className="h-4 w-4 accent-[var(--accent)]" onChange={(event) => setShowBoxes(event.target.checked)} type="checkbox" /></label>
          <label className="flex items-center justify-between gap-4"><span>Show legend</span><input checked={showLegend} className="h-4 w-4 accent-[var(--accent)]" onChange={(event) => setShowLegend(event.target.checked)} type="checkbox" /></label>
          <label className="block"><span className="flex justify-between"><span>Confidence</span><span className="font-mono text-[var(--muted)]">{confidenceThreshold}%</span></span><input className="mt-2 w-full accent-[var(--accent)]" max="90" min="10" step="5" type="range" value={confidenceThreshold} onChange={(event) => setConfidenceThreshold(Number(event.target.value))} /></label>
          <label className="block"><span className="mb-2 block">Detection speed</span><select className="h-10 w-full cursor-pointer appearance-none rounded-xl bg-[#eef1eb] px-3" value={detectionInterval} onChange={(event) => setDetectionInterval(Number(event.target.value))}><option value="500">Fast</option><option value="900">Balanced</option><option value="1600">Battery saver</option></select></label>
          <div><span className="mb-2 block">Camera</span><div className="grid grid-cols-2 gap-2"><button className={`h-10 cursor-pointer rounded-xl ${cameraFacing === "user" ? "bg-[var(--foreground)] text-white" : "bg-[#eef1eb]"}`} onClick={() => void changeCameraFacing("user")} type="button">Front</button><button className={`h-10 cursor-pointer rounded-xl ${cameraFacing === "environment" ? "bg-[var(--foreground)] text-white" : "bg-[#eef1eb]"}`} onClick={() => void changeCameraFacing("environment")} type="button">Back</button></div></div>
        </div>
      </div> : null}
    </section>
  );
}
