/**
 * SURGCT Status Badge — renders offline-ready, privacy-first system badge.
 */

export function GithubStar() {
  return (
    <div className="inline-flex items-center justify-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 px-3.5 py-1 text-xs font-medium shadow-[0_0_15px_rgba(6,182,212,0.15)]">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
      </span>
      <span>SURGCT Core Engine · Local Processing · AI Diagnostic Ready</span>
    </div>
  );
}
