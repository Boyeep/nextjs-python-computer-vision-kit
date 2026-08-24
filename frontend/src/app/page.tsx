import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function Home() {
  return (
    <main className="relative h-dvh overflow-hidden bg-[var(--background)] px-5 py-5 md:px-10 md:py-8">
      <div className="pointer-events-none absolute -right-[12vw] -top-[24vw] h-[62vw] w-[62vw] rounded-full bg-[var(--sky)] blur-[2px]" />
      <div className="pointer-events-none absolute -bottom-[30vw] -left-[14vw] h-[58vw] w-[58vw] rounded-full bg-[var(--lime)] opacity-80 blur-[2px]" />
      <div className="relative z-10 mx-auto flex h-full max-w-[1500px] flex-col">
        <header className="reveal flex h-14 shrink-0 items-center justify-between">
          <Link className="text-lg font-semibold tracking-[-0.05em]" href="/">Vision<span className="text-[var(--accent)]">/01</span></Link>
          <nav className="flex items-center gap-2 text-sm font-medium">
            <span className="hidden px-4 text-[var(--muted)] sm:inline">Home</span>
            <Link className="rounded-full bg-white/65 px-5 py-2.5 shadow-[0_8px_30px_rgba(28,45,42,0.08)] backdrop-blur transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]" href="/vision">Open workspace</Link>
          </nav>
        </header>
        <section className="grid min-h-0 flex-1 items-center gap-8 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="max-w-4xl self-center pb-8">
            <p className="reveal mb-6 font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--accent-strong)] [--reveal-delay:80ms]">Computer vision starter</p>
            <h1 className="reveal text-[clamp(3.8rem,9.5vw,9rem)] font-medium leading-[0.8] tracking-[-0.085em] [--reveal-delay:150ms]">Look closer.<span className="block text-[var(--accent)]">Build faster.</span></h1>
            <p className="reveal mt-8 max-w-xl text-base leading-7 text-[var(--muted)] [--reveal-delay:240ms] md:text-lg">A clean Next.js and FastAPI foundation for turning images into useful signals.</p>
            <div className="reveal mt-8 flex items-center gap-4 [--reveal-delay:310ms]">
              <Link className="rounded-full bg-[var(--foreground)] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(23,33,31,0.2)] transition hover:-translate-y-0.5 hover:bg-[#26332f] hover:shadow-[0_18px_38px_rgba(23,33,31,0.24)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]" href="/vision">Analyze an image <ArrowUpRight aria-hidden="true" className="ml-1 inline h-4 w-4" /></Link>
              <span className="hidden font-mono text-xs text-[var(--muted)] sm:inline">PNG · JPG · WEBP</span>
            </div>
          </div>
          <div className="reveal relative hidden h-[min(66vh,650px)] lg:block [--reveal-delay:220ms]">
            <div className="absolute inset-[8%_3%_3%_12%] rotate-3 rounded-[4rem] bg-[var(--violet)] shadow-[0_40px_100px_rgba(76,62,120,0.18)]" />
            <div className="absolute inset-[16%_12%_12%_3%] -rotate-3 rounded-[4rem] bg-[var(--peach)] shadow-[0_32px_90px_rgba(153,87,62,0.14)]" />
            <div className="absolute inset-[25%_2%_2%_22%] overflow-hidden rounded-[4rem] bg-[var(--foreground)] shadow-[0_34px_90px_rgba(23,33,31,0.2)]">
              <Image alt="Hand landmark detection example" className="object-cover" fill priority sizes="(min-width: 1024px) 42vw, 0px" src="/images/example.png" />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
