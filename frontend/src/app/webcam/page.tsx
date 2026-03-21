import { WebcamConsole } from "@/components/webcam-console";

export default function WebcamPage() {
  return (
    <main className="relative flex-1 overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="mesh-orb absolute left-[7%] top-20 h-44 w-44 rounded-full bg-[radial-gradient(circle_at_35%_35%,rgba(255,203,176,0.9),rgba(255,122,69,0.1))]" />
        <div className="mesh-orb absolute right-[12%] top-28 h-56 w-56 rounded-full bg-[radial-gradient(circle_at_35%_35%,rgba(84,144,166,0.25),rgba(84,144,166,0.03))]" />
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8 lg:px-10 lg:py-10">
        <section className="fade-up rounded-[36px] border border-black/10 bg-white/74 p-7 shadow-[0_32px_90px_rgba(10,20,25,0.12)] backdrop-blur-xl lg:p-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--foreground)]">
              Webcam Extension
            </span>
            <span className="rounded-full border border-black/10 px-3 py-1 font-mono text-xs text-black/60">
              Same API, different input source
            </span>
          </div>

          <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-[-0.05em] text-[var(--foreground)] sm:text-6xl">
            Webcam mode is an extension, not the template main story.
          </h1>

          <p className="mt-6 max-w-3xl text-base leading-8 text-black/70 sm:text-lg">
            The repo stays detection-first with image upload as the clearest onboarding
            path. This page just proves that once the contract is clean, capturing a live
            frame in the browser becomes a frontend concern instead of a backend rewrite.
          </p>
        </section>

        <WebcamConsole />
      </div>
    </main>
  );
}
