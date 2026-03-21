import type { components } from "@/generated/openapi";

export type PipelineSummary = components["schemas"]["PipelineSummary"];
export type AnalyzeResponse = components["schemas"]["AnalyzeResponse"];
export type ErrorResponse = components["schemas"]["ErrorResponse"];

type PipelineCatalogResponse = components["schemas"]["PipelineCatalogResponse"];
type PipelineSource = "live" | "fallback";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  "http://127.0.0.1:8000/api/v1";
export const DEFAULT_PIPELINE_ID = "starter-detection";

export const demoPipelines: PipelineSummary[] = [
  {
    id: "starter-detection",
    name: "Starter Detection",
    summary:
      "Detection-first sample pipeline that returns object-style boxes and confidence scores.",
    tags: ["detection", "default", "cpu"],
    runtime: "opencv-cpu",
    sample_outputs: ["object boxes", "confidence scores", "coverage metrics"],
  },
  {
    id: "foreground-segmentation",
    name: "Foreground Segmentation",
    summary:
      "Segmentation extension pipeline that returns region polygons plus detection-style boxes.",
    tags: ["segmentation", "extension", "cpu"],
    runtime: "opencv-cpu",
    sample_outputs: ["region polygons", "mask coverage", "derived boxes"],
  },
  {
    id: "document-layout",
    name: "Document Layout",
    summary:
      "Document-oriented box extraction for capture, scanning, and kiosk workflows.",
    tags: ["detection", "document", "cpu"],
    runtime: "opencv-cpu",
    sample_outputs: ["quadrilateral candidates", "layout blocks"],
  },
  {
    id: "dominant-color",
    name: "Dominant Color",
    summary:
      "Metrics-only extension pipeline for quality and image analytics workflows.",
    tags: ["analytics", "extension", "cpu"],
    runtime: "opencv-cpu",
    sample_outputs: ["channel metrics", "brightness"],
  },
];

export function getPreferredPipelineId(
  pipelines: PipelineSummary[],
  current?: string,
): string {
  if (current && pipelines.some((item) => item.id === current)) {
    return current;
  }

  return (
    pipelines.find((item) => item.id === DEFAULT_PIPELINE_ID)?.id ??
    pipelines[0]?.id ??
    ""
  );
}

export function getApiBaseUrl(): string {
  return API_BASE_URL;
}

export async function fetchPipelineCatalog(
  signal?: AbortSignal,
): Promise<{ pipelines: PipelineSummary[]; source: PipelineSource }> {
  try {
    const response = await fetch(`${API_BASE_URL}/pipelines`, {
      cache: "no-store",
      signal,
    });

    if (!response.ok) {
      throw new Error("Unable to load pipelines.");
    }

    const payload = (await response.json()) as PipelineCatalogResponse;
    return {
      pipelines: payload.pipelines.length > 0 ? payload.pipelines : demoPipelines,
      source: "live",
    };
  } catch {
    return {
      pipelines: demoPipelines,
      source: "fallback",
    };
  }
}

export async function analyzeImage(input: {
  file: File;
  pipelineId: string;
}): Promise<AnalyzeResponse> {
  const formData = new FormData();
  formData.append("file", input.file);
  formData.append("pipeline_id", input.pipelineId);

  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let message = "Unable to complete analysis.";

    try {
      const payload = (await response.json()) as ErrorResponse;
      if (payload.detail) {
        message = payload.detail;
      }
    } catch {
      message = "Unable to complete analysis.";
    }

    throw new Error(message);
  }

  return (await response.json()) as AnalyzeResponse;
}
