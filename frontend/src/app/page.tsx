import Link from "next/link";

export default function Home() {
  return (
    <main className="relative h-dvh overflow-hidden bg-[var(--background)] px-5 py-5 md:px-10 md:py-8">
      <div className="pointer-events-none absolute -right-[12vw] -top-[24vw] h-[62vw] w-[62vw] rounded-full bg-[var(--sky)] blur-[2px]" />
      <div className="pointer-events-none absolute -bottom-[30vw] -left-[14vw] h-[58vw] w-[58vw] rounded-full bg-[var(--lime)] opacity-80 blur-[2px]" />
      <div className="relative z-10 mx-auto flex h-full max-w-[1500px] flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between">
          <Link className="text-lg font-semibold tracking-[-0.05em]" href="/">Vision<span className="text-[var(--accent)]">/01</span></Link>
          <nav className="flex items-center gap-2 text-sm font-medium">
            <span className="hidden px-4 text-[var(--muted)] sm:inline">Home</span>
            <Link className="rounded-full bg-white/65 px-5 py-2.5 shadow-[0_8px_30px_rgba(28,45,42,0.08)] backdrop-blur transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]" href="/vision">Open workspace</Link>
          </nav>
        </header>
        <section className="grid min-h-0 flex-1 items-center gap-8 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="fade-up max-w-4xl self-center pb-8">
            <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--accent-strong)]">Computer vision starter</p>
            <h1 className="text-[clamp(3.8rem,9.5vw,9rem)] font-medium leading-[0.8] tracking-[-0.085em]">Look closer.<span className="block text-[var(--accent)]">Build faster.</span></h1>
            <p className="mt-8 max-w-xl text-base leading-7 text-[var(--muted)] md:text-lg">A clean Next.js and FastAPI foundation for turning images into useful signals.</p>
            <div className="mt-8 flex items-center gap-4">
              <Link className="rounded-full bg-[var(--foreground)] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(23,33,31,0.2)] transition hover:-translate-y-0.5 hover:bg-[var(--accent-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]" href="/vision">Analyze an image</Link>
              <span className="hidden font-mono text-xs text-[var(--muted)] sm:inline">PNG · JPG · WEBP</span>
            </div>
          </div>
          <div aria-hidden="true" className="relative hidden h-[min(66vh,650px)] lg:block">
            <div className="absolute inset-[8%_3%_3%_12%] rotate-3 rounded-[4rem] bg-[var(--violet)] shadow-[0_40px_100px_rgba(76,62,120,0.18)]" />
            <div className="absolute inset-[16%_12%_12%_3%] -rotate-3 rounded-[4rem] bg-[var(--peach)] shadow-[0_32px_90px_rgba(153,87,62,0.14)]" />
            <div className="absolute inset-[25%_2%_2%_22%] overflow-hidden rounded-[4rem] bg-[var(--foreground)] shadow-[0_34px_90px_rgba(23,33,31,0.2)]">
              <div className="absolute left-[15%] top-[18%] h-[46%] w-[55%] rounded-[2.2rem] bg-[#dce8de]" />
              <div className="absolute left-[38%] top-[31%] h-[28%] w-[32%] rounded-[1.4rem] ring-2 ring-[var(--accent)] ring-offset-4 ring-offset-[var(--foreground)]" />
              <span className="absolute bottom-[13%] left-[12%] rounded-full bg-white/10 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/65">Object found · 94%</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
