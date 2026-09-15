/**
 * Minimal & Professional Clinical Start Screen — SURGCT
 * Clean, distraction-free monochrome black & white interface with sharp pointed corners.
 */

import { useState } from 'react';
import { FileDropZone } from './FileDropZone';
import { useI18n } from '@/i18n/I18nContext';
import { useViewer } from '@/context/ViewerContext';
import { loadSample } from '@/core/sampleLoader';

const CAPABILITIES = [
  { title: 'Multi-Planar Reformation', desc: 'Axial, Sagittal, Coronal' },
  { title: 'Curved Planar Reformation', desc: 'Panoramic Dental Arch' },
  { title: '3D Volume Rendering', desc: 'Bone Density & Soft Tissue' },
  { title: 'Guided Implant CAD', desc: 'Fixture & Drill Guide STL' },
  { title: 'AI Diagnostics', desc: 'Maxillofacial Analytics' },
  { title: '100% Client-Side', desc: 'Zero HIPAA/GDPR Uploads' },
];

export function LandingPage() {
  const { t } = useI18n();
  const { dispatch } = useViewer();
  const [samplePct, setSamplePct] = useState<number | null>(null);

  const openSample = async () => {
    setSamplePct(0);
    try {
      const { study, volumeId, windowLevel } = await loadSample('/sample', (p) => setSamplePct(p));
      dispatch({ type: 'SET_STUDY', payload: study });
      dispatch({ type: 'SET_WINDOW_LEVEL', payload: windowLevel });
      dispatch({ type: 'SET_VOLUME_ID', payload: volumeId });
    } catch (err) {
      console.error('[sample] load failed', err);
      window.alert(t('newload.sampleError'));
      setSamplePct(null);
    }
  };

  return (
    <div className="relative h-full overflow-y-auto bg-black text-white flex flex-col justify-between">
      <div className="relative z-10 max-w-5xl w-full mx-auto px-6 py-10 sm:py-14 flex flex-col gap-10">
        {/* ── Header ───────────────────────────────────────── */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none bg-zinc-900 border border-zinc-700 text-white text-xs font-mono tracking-wider">
            <span className="w-1.5 h-1.5 bg-white rounded-none" />
            SURGCT CLINICAL CT PLATFORM
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Surgical CT Diagnostic &amp; Planning Suite
          </h1>

          <p className="max-w-2xl text-sm sm:text-base text-zinc-400 leading-relaxed font-normal">
            High-performance volumetric CT reconstruction, interactive multi-planar reformatting, panoramic arch tracing, and guided implant surgical planning.
          </p>
        </div>

        {/* ── Action Cards Grid (Pointed Corners) ──────────── */}
        <div className="grid md:grid-cols-2 gap-6 items-stretch">
          {/* Card 1: Sample Case (Pointed Corners, No Green Border) */}
          <div className="relative flex flex-col justify-between p-6 sm:p-8 rounded-none bg-zinc-950 border border-zinc-800 hover:border-zinc-500 transition-all group shadow-none">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-none bg-zinc-900 border border-zinc-700 flex items-center justify-center text-white">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" strokeLinejoin="miter">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-none bg-zinc-900 border border-zinc-700 text-zinc-300 text-[10px] font-mono font-bold tracking-wider">
                  <span className="w-1.5 h-1.5 bg-white rounded-none" />
                  PRE-LOADED CT SAMPLE
                </div>
              </div>

              <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
                Sample Volumetric Study
                <span className="text-[10px] font-mono text-zinc-400 font-normal">· Mandible / Maxilla</span>
              </h2>

              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Load a high-resolution 3D maxillofacial dataset (~16 MB) with interactive MPR, panoramic dental arch curve, and implant scenario pre-configured.
              </p>
            </div>

            <div className="pt-6">
              <button
                onClick={openSample}
                disabled={samplePct !== null}
                data-testid="load-sample"
                className="w-full py-3 px-4 rounded-none bg-white hover:bg-zinc-200 text-black font-semibold text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-none"
              >
                {samplePct !== null ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-none animate-spin" />
                    <span>Loading Sample ({samplePct}%)...</span>
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    <span>Load Clinical Sample (16 MB)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Card 2: Local Study DropZone (Pointed Corners) */}
          <div className="flex flex-col justify-between p-6 sm:p-8 rounded-none bg-zinc-950 border border-zinc-800 hover:border-zinc-500 transition-all shadow-none">
            <FileDropZone />
          </div>
        </div>

        {/* ── Capabilities Strip (Pointed Corners) ─────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {CAPABILITIES.map((cap, i) => (
            <div
              key={i}
              className="p-3 rounded-none bg-zinc-950 border border-zinc-800 flex flex-col gap-1 text-center"
            >
              <span className="text-xs font-semibold text-white">{cap.title}</span>
              <span className="text-[10px] text-zinc-400 font-mono">{cap.desc}</span>
            </div>
          ))}
        </div>

        {/* ── Privacy & Regulatory Disclaimer (No lock icon, Pointed Corners) */}
        <div className="p-4 rounded-none bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-400 flex items-start gap-3">
          <div className="w-2 h-2 mt-1 bg-white rounded-none shrink-0" />
          <div className="space-y-1">
            <p className="text-white font-semibold">Local &amp; Private — Zero Data Uploaded</p>
            <p className="leading-relaxed">
              All DICOM parsing, multi-planar reconstruction, volume rendering, and CSG guide generation are executed entirely client-side in your local browser engine. No patient data or scan files are ever transmitted to any external server.
            </p>
          </div>
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────────── */}
      <div className="relative z-10 py-4 px-6 border-t border-zinc-900 text-center text-xs text-zinc-500 font-mono">
        SURGCT · Surgical CT &amp; AI Diagnostic Platform
      </div>

      {/* Darken + progress bar overlay while the sample loads (Pointed Corners) */}
      {samplePct !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center">
          <div className="w-80 p-6 rounded-none bg-zinc-950 border border-zinc-700 text-center space-y-4 shadow-2xl">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-none animate-spin mx-auto" />
            <div>
              <h3 className="text-sm font-semibold text-white">{t('sample.loading')}</h3>
              <p className="text-xs text-zinc-400 mt-1 font-mono">Decompressing volumetric DICOM slices...</p>
            </div>
            <div className="w-full h-1.5 rounded-none bg-zinc-800 overflow-hidden">
              <div
                className="h-1.5 rounded-none bg-white transition-all duration-150"
                style={{ width: `${samplePct}%` }}
              />
            </div>
            <p className="text-white text-lg font-mono font-semibold tabular-nums">{samplePct}%</p>
          </div>
        </div>
      )}
    </div>
  );
}
