/**
 * Companion clinical modules for SURGCT — shown in the
 * landing page and Settings "About & Suite" tab.
 */

interface ModuleItem {
  name: string;
  badge: string;
  desc: string;
}

const MODULES: ModuleItem[] = [
  {
    name: 'SURGCT AI Radiologist',
    badge: 'Integrated',
    desc: 'Automated dentition metrics, IAN nerve tracking, and bone density Misch classification powered by Gemini AI.',
  },
  {
    name: 'SURGCT Guided Implant Engine',
    badge: 'Active',
    desc: '3D virtual fixture placement with safety safety clearance verification and surgical drill-guide STL generation.',
  },
];

export function OtherProjects() {
  return (
    <div className="grid sm:grid-cols-2 gap-2.5">
      {MODULES.map((m) => (
        <div
          key={m.name}
          className="rounded-none border border-cyan-500/20 bg-slate-900/60 dark:bg-slate-900/80 p-3.5 shadow-sm hover:border-cyan-500/40 transition-all"
        >
          <div className="flex items-center justify-between text-sm font-semibold text-cyan-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-none bg-cyan-400 animate-pulse" />
              <span>{m.name}</span>
            </div>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-none bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
              {m.badge}
            </span>
          </div>
          <p className="mt-1.5 text-xs text-slate-400 leading-snug">{m.desc}</p>
        </div>
      ))}
    </div>
  );
}
