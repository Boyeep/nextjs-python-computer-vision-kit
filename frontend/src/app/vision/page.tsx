import Link from "next/link";
import { InferenceConsole } from "@/components/inference-console";

export default function VisionPage() {
  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-[#e9ede7] px-3 pb-3 pt-3 sm:px-5 sm:pb-5 sm:pt-4">
      <header className="mx-auto flex h-14 w-full max-w-[1600px] shrink-0 items-center justify-between px-2">
        <div className="flex items-center gap-7">
          <Link className="text-lg font-semibold tracking-[-0.05em]" href="/">Vision<span className="text-[var(--accent)]">/01</span></Link>
          <nav className="hidden items-center gap-1 rounded-full bg-white/50 p-1 text-sm sm:flex">
            <Link className="rounded-full px-4 py-2 text-[var(--muted)] transition hover:text-[var(--foreground)]" href="/">Home</Link>
            <span className="rounded-full bg-white px-4 py-2 font-medium shadow-sm">Computer vision</span>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-2 rounded-full bg-white/55 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)] md:flex"><span className="h-2 w-2 rounded-full bg-[#58a36d]" /> API ready</span>
          <Link className="rounded-full bg-[var(--foreground)] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[var(--accent-strong)]" href="/">Exit</Link>
        </div>
      </header>
      <div className="mx-auto min-h-0 w-full max-w-[1600px] flex-1"><InferenceConsole /></div>
    </main>
  );
}
