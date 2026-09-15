/**
 * App-wide top row: app title on the left; on the right icon buttons for
 * language selection, dark/light mode, settings and help. The settings and
 * help panels slide in from the right.
 */

import { useEffect, useRef, useState } from 'react';
import { useViewer } from '@/context/ViewerContext';
import { useI18n } from '@/i18n/I18nContext';
import { useTheme } from '@/context/ThemeContext';
import { useLayoutSwitch } from '@/hooks/useLayoutSwitch';
import { LayoutConfigButton } from './LayoutConfigButton';
import { ImageExportModal } from '@/components/panels/ImageExportModal';
import { PdfExportModal } from '@/components/panels/PdfExportModal';
import { exportDrillGuideStl, checkGuide } from '@/core/viewerExports';
import { serializePlan, planFromObject } from '@/core/planIO';
import { loadSample } from '@/core/sampleLoader';
import { getVolumeData } from '@/core/cprEngine';
import { loadScanPolyData, setScanPolyData, polyDataCenter, translation16, IDENTITY16 } from '@/core/scanMesh';
import { SCAN_DEFAULTS, type LayoutMode } from '@/types/dicom';

const LAYOUTS: { id: LayoutMode; labelKey?: string; label?: string }[] = [
  { id: '1x1', labelKey: 'layout.view2d' },
  { id: '1+3', labelKey: 'layout.view3d' },
  { id: 'OPG2+1', labelKey: 'layout.panoramic' },
];

// ── Icons ──────────────────────────────────────────────────────

function HomeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function AIIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a4 4 0 0 0-4 4v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2h-2V6a4 4 0 0 0-4-4z" />
      <circle cx="9" cy="14" r="1" fill="currentColor" />
      <circle cx="15" cy="14" r="1" fill="currentColor" />
      <line x1="12" y1="17" x2="12" y2="17.01" />
    </svg>
  );
}

function HelpIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function NewLoadIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function ScanIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2 2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  );
}

function TopBarButton({
  title, active = false, onClick, children,
}: {
  title: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`
        w-8 h-8 flex items-center justify-center rounded-none transition-colors
        ${active
          ? 'bg-dental-600 text-white'
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'}
      `}
    >
      {children}
    </button>
  );
}

// ── Top bar ────────────────────────────────────────────────────

export function TopBar() {
  const { state, dispatch } = useViewer();
  const { t } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const handleLayoutChange = useLayoutSwitch();
  const [exportOpen, setExportOpen] = useState(false);
  const [imageExportOpen, setImageExportOpen] = useState(false);
  const [pdfExportOpen, setPdfExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const [newLoadOpen, setNewLoadOpen] = useState(false);
  const newLoadRef = useRef<HTMLDivElement>(null);
  const planInputRef = useRef<HTMLInputElement>(null);

  const savePlan = () => {
    const plan = serializePlan(state, {
      savedAt: new Date().toISOString(),
      studyInstanceUID: state.study?.studyInstanceUID ?? null,
      patientId: state.study?.patientId ?? null,
    });
    const blob = new Blob([JSON.stringify(plan, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `dental_plan_${new Date().toISOString().slice(0, 10)}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    setExportOpen(false);
  };

  const scanInputRef = useRef<HTMLInputElement>(null);
  const [guideBusy, setGuideBusy] = useState(false);

  const hasGuided = state.implants.some(i => i.guided?.enabled);

  /** Build and download the printable drill guide (STL) via CSG (manifold-3d). */
  const exportGuide = async () => {
    setExportOpen(false);
    if (!state.scans.some(s => s.visible) && !window.confirm(t('guide.confirmNoScan'))) return;
    const issues = checkGuide(state);
    if (issues.length > 0) {
      const lines = issues.map((i) => {
        const mark = i.severity === 'error' ? '⛔' : '⚠️';
        return `${mark} ${t(`guideCheck.${i.code}`)}${i.detail ? ` (${i.detail})` : ''}`;
      });
      const hasError = issues.some((i) => i.severity === 'error');
      const prompt = `${t(hasError ? 'guideCheck.errorIntro' : 'guideCheck.warnIntro')}\n\n${lines.join('\n')}\n\n${t('guideCheck.proceed')}`;
      if (!window.confirm(prompt)) return;
    }
    setGuideBusy(true);
    try {
      const { ok, warnings } = await exportDrillGuideStl(state);
      if (!ok) { window.alert(t('guide.noImplants')); return; }
      if (warnings.includes('scan-not-watertight')) window.alert(t('guide.warnScan'));
      if (warnings.includes('housing-disconnected')) window.alert(t('guide.warnDisconnected'));
    } catch (err) {
      console.error('[guide] export failed', err);
      window.alert(t('guide.error'));
    } finally {
      setGuideBusy(false);
    }
  };

  const importScan = async (file: File) => {
    const pd = await loadScanPolyData(file);
    if (!pd) {
      window.alert(t('scan.invalid'));
      return;
    }
    const id = `scan_${Date.now()}`;
    setScanPolyData(id, pd);
    let transform = IDENTITY16;
    const vol = state.volumeId ? getVolumeData(state.volumeId) : null;
    if (vol) {
      const sc = polyDataCenter(pd);
      const sp = [1 / vol.invSx, 1 / vol.invSy, 1 / vol.invSz];
      const vc = [
        vol.origin[0] + (vol.dims[0] - 1) * sp[0] / 2,
        vol.origin[1] + (vol.dims[1] - 1) * sp[1] / 2,
        vol.origin[2] + (vol.dims[2] - 1) * sp[2] / 2,
      ];
      transform = translation16(vc[0] - sc[0], vc[1] - sc[1], vc[2] - sc[2]);
    }
    const def = SCAN_DEFAULTS.oral;
    dispatch({
      type: 'ADD_SCAN',
      payload: {
        id,
        name: file.name.replace(/\.[^.]+$/, ''),
        type: 'oral',
        color: def.color,
        opacity: def.opacity,
        visible: true,
        transform,
        fileName: file.name,
      },
    });
  };

  const loadPlanFile = async (file: File) => {
    try {
      const obj = JSON.parse(await file.text());
      const data = planFromObject(obj);
      if (!data) {
        window.alert(t('plan.invalid'));
        return;
      }
      const uid = obj.studyInstanceUID;
      if (uid && state.study && uid !== state.study.studyInstanceUID && !window.confirm(t('plan.mismatch'))) {
        return;
      }
      dispatch({ type: 'LOAD_PLAN', payload: data });
    } catch {
      window.alert(t('plan.invalid'));
    }
  };

  // Close the export dropdown on outside click
  useEffect(() => {
    if (!exportOpen) return;
    const handler = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }
    };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, [exportOpen]);

  // Close the new-load dropdown on outside click
  useEffect(() => {
    if (!newLoadOpen) return;
    const handler = (e: MouseEvent) => {
      if (newLoadRef.current && !newLoadRef.current.contains(e.target as Node)) setNewLoadOpen(false);
    };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, [newLoadOpen]);

  return (
    <div className="relative z-40 flex items-center justify-between px-4 py-1.5 bg-white/95 border-b border-slate-200 dark:bg-slate-900/95 dark:border-slate-800 backdrop-blur-sm">
      {guideBusy && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-3 bg-black/60 select-none">
          <div className="w-12 h-12 border-4 border-dental-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-dental-200 text-xl font-semibold [text-shadow:_0_1px_4px_rgb(0_0_0)]">
            {t('guide.building')}
          </span>
        </div>
      )}
      <button
        onClick={() => { if (state.study) dispatch({ type: 'RESET' }); }}
        title={state.study ? t('topbar.newLoad') : 'Home'}
        className="flex items-center justify-center w-8 h-8 rounded-none text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
      >
        <HomeIcon />
      </button>

      {/* Center: layout switcher (+ view modes in 1x1) */}
      {state.study ? (
        <div className="flex items-center gap-1">
          {LAYOUTS.map(l => (
            <button
              key={l.id}
              onClick={() => handleLayoutChange(l.id)}
              className={`
                px-2 py-1 text-xs rounded-none font-mono transition-colors
                ${state.layoutMode === l.id
                  ? 'bg-dental-600 text-white'
                  : 'bg-slate-100/70 text-slate-600 hover:bg-slate-200 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:bg-slate-700'}
              `}
              title={t('toolbar.layout', { label: l.labelKey ? t(l.labelKey) : l.label! })}
            >
              {l.labelKey ? t(l.labelKey) : l.label}
            </button>
          ))}
          {(state.layoutMode === '1+3' || state.layoutMode === 'OPG2+1') && <LayoutConfigButton />}
        </div>
      ) : (
        <div className="text-xs font-semibold text-slate-400 tracking-wider font-mono">
          SURGCT
        </div>
      )}

      <div className="flex items-center gap-1">
        {/* New load dropdown: Import Scan (STL/OBJ/PLY) + Load Sample (soon) */}
        {state.study && (
          <div className="relative" ref={newLoadRef}>
            <button
              onClick={() => setNewLoadOpen(o => !o)}
              title={t('topbar.newLoad')}
              className="h-8 px-2 flex items-center gap-1.5 rounded-none text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
            >
              <NewLoadIcon />
              <span className="text-xs">{t('topbar.newLoad')}</span>
            </button>
            {newLoadOpen && (
              <div className="absolute right-0 top-9 z-50 w-44 bg-white/95 border border-slate-200 rounded-none shadow-xl py-1 dark:bg-slate-800/95 dark:border-slate-700 backdrop-blur-sm">
                <button
                  onClick={() => { setNewLoadOpen(false); scanInputRef.current?.click(); }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                >
                  <ScanIcon />
                  {t('scan.import')}
                </button>
                <button
                  onClick={async () => {
                    setNewLoadOpen(false);
                    try {
                      const { study, volumeId, windowLevel } = await loadSample();
                      dispatch({ type: 'SET_STUDY', payload: study });
                      dispatch({ type: 'SET_WINDOW_LEVEL', payload: windowLevel });
                      dispatch({ type: 'SET_VOLUME_ID', payload: volumeId });
                    } catch (err) {
                      console.error('[sample] load failed', err);
                      window.alert(t('newload.sampleError'));
                    }
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                >
                  <ScanIcon />
                  {t('newload.loadSample')}
                </button>
              </div>
            )}
            <input
              ref={scanInputRef}
              type="file"
              accept=".stl,.obj,.ply,model/stl,model/obj"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void importScan(f);
                e.target.value = '';
              }}
            />
          </div>
        )}

        {/* Export dropdown */}
        {state.study && (
          <div className="relative" ref={exportRef}>
            <button
              onClick={() => setExportOpen(o => !o)}
              title={t('export.button')}
              className="h-8 px-2 flex items-center gap-1.5 rounded-none text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
            >
              <DownloadIcon />
              <span className="text-xs">{t('export.button')}</span>
            </button>
            {exportOpen && (
              <div className="absolute right-0 top-9 z-50 w-44 bg-white/95 border border-slate-200 rounded-none shadow-xl py-1 dark:bg-slate-800/95 dark:border-slate-700 backdrop-blur-sm">
                <button
                  onClick={() => { setExportOpen(false); setImageExportOpen(true); }}
                  className="w-full px-3 py-1.5 text-xs text-left text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                >
                  {t('export.saveImage')}
                </button>
                <button
                  onClick={() => { setExportOpen(false); setPdfExportOpen(true); }}
                  className="w-full px-3 py-1.5 text-xs text-left text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                >
                  {t('export.savePdf')}
                </button>
                <button
                  onClick={exportGuide}
                  disabled={!hasGuided}
                  title={hasGuided ? undefined : t('guide.noImplants')}
                  className="w-full px-3 py-1.5 text-xs text-left text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 disabled:text-gray-400 dark:disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
                >
                  {t('guide.export')}
                </button>
                <div className="my-1 border-t border-gray-200 dark:border-gray-700" />
                <button
                  onClick={savePlan}
                  className="w-full px-3 py-1.5 text-xs text-left text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                >
                  {t('plan.save')}
                </button>
                <button
                  onClick={() => { setExportOpen(false); planInputRef.current?.click(); }}
                  className="w-full px-3 py-1.5 text-xs text-left text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                >
                  {t('plan.load')}
                </button>
              </div>
            )}
            <input
              ref={planInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void loadPlanFile(f);
                e.target.value = '';
              }}
            />
          </div>
        )}

        {/* Dark / light mode */}
        <TopBarButton title={t('topbar.theme')} onClick={toggleTheme}>
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </TopBarButton>

        {/* SURGCT AI Assistant button — always available */}
        <button
          onClick={() => dispatch({ type: 'TOGGLE_PANEL', payload: 'ai' })}
          title="SURGCT Gemini Dental AI Assistant"
          className={`h-8 px-2.5 flex items-center gap-1.5 rounded-none text-xs font-semibold transition-all ${
            state.activePanel === 'ai'
              ? 'bg-cyan-500 text-slate-950 shadow-glow-sm'
              : 'bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/60 hover:text-cyan-200'
          }`}
        >
          <AIIcon />
          <span className="hidden sm:inline">AI Diagnostics</span>
        </button>

        {/* Settings & help — only once a study is open */}
        {state.study && (
          <>
            <TopBarButton
              title={t('topbar.settings')}
              active={state.activePanel === 'settings'}
              onClick={() => dispatch({ type: 'TOGGLE_PANEL', payload: 'settings' })}
            >
              <GearIcon />
            </TopBarButton>

            <TopBarButton
              title={t('topbar.help')}
              active={state.activePanel === 'help'}
              onClick={() => dispatch({ type: 'TOGGLE_PANEL', payload: 'help' })}
            >
              <HelpIcon />
            </TopBarButton>
          </>
        )}
      </div>

      <ImageExportModal open={imageExportOpen} onClose={() => setImageExportOpen(false)} />
      <PdfExportModal open={pdfExportOpen} onClose={() => setPdfExportOpen(false)} />
    </div>
  );
}
