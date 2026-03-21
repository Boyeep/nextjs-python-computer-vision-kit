import Link from "next/link";

import { InferenceConsole } from "@/components/inference-console";

const pillars = [
  {
    title: "Detection-First Demo",
    description:
      "Start with upload, detection boxes, and a review panel instead of trying to explain every CV workflow at once.",
  },
  {
    title: "Inference-First Contract",
    description:
      "Keep frontend and backend aligned through one inference contract that survives model changes later.",
  },
  {
    title: "Optional Webcam Mode",
    description:
      "Add live camera capture as a frontend extension after upload works well, instead of making it the repo's main story.",
  },
];

const repoAreas = [
  {
    path: "frontend/",
    detail: "Next.js app shell, upload workflow, and generated API types.",
  },
  {
    path: "backend/",
    detail: "FastAPI service, pipeline registry, image validation, and OpenCV starter logic.",
  },
  {
    path: "docs/",
    detail: "OpenAPI source of truth for contracts between the interface and the inference layer.",
  },
  {
    path: "scripts/",
    detail: "Root commands for local dev and verification, mirroring the monorepo kit ergonomics.",
  },
];

export default function Home() {
  return (
    <main className="relative flex-1 overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="mesh-orb absolute left-[6%] top-16 h-48 w-48 rounded-full bg-[radial-gradient(circle_at_35%_35%,rgba(255,203,176,0.95),rgba(255,122,69,0.12))]" />
        <div className="mesh-orb absolute right-[10%] top-40 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_35%_35%,rgba(84,144,166,0.28),rgba(84,144,166,0.02))]" />
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8 lg:px-10 lg:py-10">
        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="fade-up rounded-[36px] border border-black/10 bg-white/74 p-7 shadow-[0_32px_90px_rgba(10,20,25,0.12)] backdrop-blur-xl lg:p-10">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--foreground)]">
                Monorepo Starter
              </span>
              <span className="rounded-full border border-black/10 px-3 py-1 font-mono text-xs text-black/60">
                Next.js + FastAPI + OpenCV
              </span>
            </div>

            <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-[-0.05em] text-[var(--foreground)] sm:text-6xl">
              A detection-first computer vision kit with room to grow.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-black/70 sm:text-lg">
              The starter keeps one clear happy path: upload an image, run detection,
              inspect boxes and metrics, and keep the same contract when you switch to
              the built-in segmentation extension, add webcam capture, or move to a
              heavier model backend.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                className="rounded-full bg-[var(--foreground)] px-5 py-3 text-sm font-semibold text-white transition hover:translate-y-[-1px]"
                href="#console"
              >
                Explore Vision Console
              </a>
              <Link
                className="rounded-full border border-black/10 px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-black/5"
                href="/webcam"
              >
                Optional Webcam Mode
              </Link>
              <span className="rounded-full border border-black/10 px-5 py-3 font-mono text-sm text-black/60">
                Root commands: `dev`, `check`, `api:types`
              </span>
            </div>
          </div>

          <div className="fade-up rounded-[36px] border border-black/10 bg-[#13262e] p-7 text-white shadow-[0_32px_90px_rgba(10,20,25,0.16)] [animation-delay:120ms] lg:p-10">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/45">
              Starter Qualities
            </p>
            <div className="mt-6 space-y-5">
              <div className="rounded-[22px] border border-white/10 bg-white/6 p-5">
                <p className="text-sm text-white/60">Architecture</p>
                <p className="mt-2 text-xl font-semibold tracking-tight">
                  Web app and inference API stay separate, but develop together.
                </p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/6 p-5">
                <p className="text-sm text-white/60">Vision posture</p>
                <p className="mt-2 text-xl font-semibold tracking-tight">
                  Detection is the default demo, with CPU-first sample logic so the repo stays cloneable and teachable.
                </p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/6 p-5">
                <p className="text-sm text-white/60">Upgrade path</p>
                <p className="mt-2 text-xl font-semibold tracking-tight">
                  Add webcam and segmentation later without changing the contract boundary.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {pillars.map((pillar, index) => (
            <article
              key={pillar.title}
              className="fade-up rounded-[28px] border border-black/10 bg-white/72 p-5 shadow-[0_24px_70px_rgba(10,20,25,0.08)] backdrop-blur-xl"
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-black/50">
                0{index + 1}
              </p>
              <h2 className="mt-3 text-xl font-semibold tracking-tight text-[var(--foreground)]">
                {pillar.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-black/68">
                {pillar.description}
              </p>
            </article>
          ))}
        </section>

        <div id="console">
          <InferenceConsole />
        </div>

        <section className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="fade-up rounded-[32px] border border-black/10 bg-[#fff7ee] p-6 shadow-[0_24px_70px_rgba(10,20,25,0.08)]">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-black/45">
              Why It Feels Like A Kit
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--foreground)]">
              The repo is organized for iteration, not just inference.
            </h2>
            <p className="mt-4 text-sm leading-7 text-black/68">
              The point is to help you ship a computer-vision product faster. That means
              the sample processing is only one layer. The bigger win is having a place
              for contracts, scripts, UI patterns, and deployable app structure from day
              one.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {repoAreas.map((area, index) => (
              <article
                key={area.path}
                className="fade-up rounded-[28px] border border-black/10 bg-white/76 p-5 shadow-[0_24px_70px_rgba(10,20,25,0.08)] backdrop-blur-xl"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <p className="font-mono text-sm text-black/48">{area.path}</p>
                <p className="mt-3 text-base leading-7 text-black/72">{area.detail}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
