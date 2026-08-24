import { InferenceConsole } from "@/components/inference-console";

export default function Home() {
  return (
    <main className="min-h-dvh">
      <header className="border-b border-[var(--line)]">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-5 md:px-10">
          <div className="flex items-baseline gap-3">
            <span className="font-semibold tracking-[-0.04em]">Vision/01</span>
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
              Next.js · FastAPI · OpenCV
            </span>
          </div>
          <a
            className="text-sm text-[var(--muted)] transition-colors duration-200 hover:text-[var(--foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
            href="#console"
          >
            Open console ↓
          </a>
        </div>
      </header>

      <section className="mx-auto grid max-w-[1440px] border-b border-[var(--line)] lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
        <div className="px-5 py-16 md:px-10 md:py-24 lg:border-r lg:border-[var(--line)] lg:py-32">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--accent-strong)]">
            Detection workspace / CPU-first
          </p>
          <h1 className="mt-8 max-w-[900px] text-[clamp(3.2rem,8vw,7.6rem)] font-medium leading-[0.84] tracking-[-0.075em]">
            See what the model sees.
          </h1>
          <p className="mt-10 max-w-2xl text-lg leading-8 text-[var(--muted)] md:text-xl">
            A focused image-analysis surface. Upload a frame, run the detection
            contract, and inspect every box without ceremony.
          </p>
        </div>

        <aside className="flex flex-col justify-between bg-[var(--wash)] px-5 py-10 md:px-10 lg:py-14">
          <p className="max-w-sm text-sm leading-7 text-[var(--muted)]">
            The sample pipeline stays deliberately small. Replace the vision layer;
            keep the interface and typed response boundary.
          </p>
          <dl className="mt-16 divide-y divide-[var(--line)] border-y border-[var(--line)] font-mono text-xs uppercase tracking-[0.13em]">
            <div className="flex justify-between py-4">
              <dt className="text-[var(--muted)]">Input</dt>
              <dd>PNG / JPEG / WEBP</dd>
            </div>
            <div className="flex justify-between py-4">
              <dt className="text-[var(--muted)]">Runtime</dt>
              <dd>OpenCV CPU</dd>
            </div>
            <div className="flex justify-between py-4">
              <dt className="text-[var(--muted)]">Output</dt>
              <dd>Typed JSON</dd>
            </div>
          </dl>
        </aside>
      </section>

      <div className="mx-auto max-w-[1440px] px-5 py-16 md:px-10 md:py-24" id="console">
        <div className="mb-10 flex items-end justify-between gap-6 border-b border-[var(--line)] pb-5">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
              Workspace 001
            </p>
            <h2 className="mt-2 text-3xl font-medium tracking-[-0.045em] md:text-5xl">
              Detection console
            </h2>
          </div>
          <span className="hidden h-3 w-3 rounded-full bg-[var(--accent)] md:block" aria-hidden />
        </div>
        <InferenceConsole />
      </div>

      <footer className="border-t border-[var(--line)] px-5 py-6 md:px-10">
        <div className="mx-auto flex max-w-[1360px] justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
          <span>Vision/01</span>
          <span>Built for replacement, not decoration</span>
        </div>
      </footer>
    </main>
  );
}
