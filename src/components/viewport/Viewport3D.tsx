import { useEffect, useRef, useCallback, useState } from 'react';
import { getRenderingEngine, Enums, setVolumesForViewports, type Types } from '@cornerstonejs/core';
import { setupTools, addViewportTo3DToolGroup } from '@/core/toolManager';
import { RENDERING_ENGINE_ID, VP_3D } from '@/core/constants';
import { useViewer } from '@/context/ViewerContext';
import { useI18n } from '@/i18n/I18nContext';
import { ViewportOverlay } from './ViewportOverlay';
import { Implant3DActors } from './Implant3DActors';
import { ScanActors } from './ScanActors';
import { Slice3DActors } from './Slice3DActors';
import { OrientationLabel } from './OrientationLabel';
import { SLICE_AXES, type SliceAxis } from '@/core/slice3D';
import type { Implant3DLayers } from '@/core/implant3D';
import {
  applyColormap3D,
  applyQuality3D,
  applyVolumeStyle,
  VOLUME_3D_COLORMAPS,
  type Volume3DQuality,
  type Volume3DColormap,
} from '@/core/volume3DPreset';

const QUALITIES: Volume3DQuality[] = ['low', 'medium', 'high'];

const COLORMAP_SWATCHES: Record<Volume3DColormap, string> = {
  grayscale: 'bg-gradient-to-r from-black via-zinc-500 to-white',
  warm: 'bg-gradient-to-r from-red-600 via-orange-500 to-amber-300',
  cool: 'bg-gradient-to-r from-blue-700 via-cyan-500 to-cyan-200',
  spectral: 'bg-gradient-to-r from-purple-600 via-emerald-400 to-yellow-400',
  inverted: 'bg-gradient-to-r from-white via-zinc-500 to-black',
};

interface Viewport3DProps {
  volumeId: string;
}

export function Viewport3D({ volumeId }: Viewport3DProps) {
  const { t } = useI18n();
  const { state, dispatch } = useViewer();
  const elementRef = useRef<HTMLDivElement>(null);
  const colorMenuRef = useRef<HTMLDivElement>(null);
  const enabledRef = useRef(false);
  const destroyedRef = useRef(false);
  const activePreset = state.display.preset3d;
  const [activeQuality, setActiveQuality] = useState<Volume3DQuality>(state.display.quality3d);
  const [activeColormap, setActiveColormap] = useState<Volume3DColormap>(state.display.colormap3d);
  const [colorOpen, setColorOpen] = useState(false);
  const [ready, setReady] = useState(false); // volume loaded → safe to add actors
  const [layers3D, setLayers3D] = useState<Implant3DLayers>({ implant: true, sleeve: true, axis: true });
  const [sliceAxes, setSliceAxes] = useState<Record<SliceAxis, boolean>>({ AXIAL: true, SAGITTAL: true, CORONAL: true });
  const sliceRebuild = 0;

  useEffect(() => {
    if (!colorOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (colorMenuRef.current && !colorMenuRef.current.contains(e.target as Node)) {
        setColorOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [colorOpen]);

  const handleResize = useCallback(() => {
    const engine = getRenderingEngine(RENDERING_ENGINE_ID);
    engine?.resize(true, false);
  }, []);

  // Enable the 3D viewport
  useEffect(() => {
    const element = elementRef.current;
    const engine = getRenderingEngine(RENDERING_ENGINE_ID);
    if (!element || !engine) return;

    destroyedRef.current = false;
    setupTools();

    engine.enableElement({
      viewportId: VP_3D,
      type: Enums.ViewportType.VOLUME_3D,
      element,
      defaultOptions: {
        orientation: Enums.OrientationAxis.CORONAL,
      },
    });
    addViewportTo3DToolGroup(VP_3D, RENDERING_ENGINE_ID);
    enabledRef.current = true;

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(element);

    return () => {
      destroyedRef.current = true;
      resizeObserver.disconnect();
      if (enabledRef.current) {
        try {
          engine.disableElement(VP_3D);
        } catch {
          // engine may already be destroyed
        }
        enabledRef.current = false;
      }
    };
  }, [handleResize]);

  // Load volume and apply preset
  useEffect(() => {
    if (!volumeId || !enabledRef.current) return;

    const engine = getRenderingEngine(RENDERING_ENGINE_ID);
    if (!engine) return;

    let cancelled = false;
    setReady(false);

    async function loadVolume() {
      try {
        await setVolumesForViewports(
          engine!,
          [{ volumeId, blendMode: Enums.BlendModes.COMPOSITE }],
          [VP_3D],
        );
        if (cancelled || destroyedRef.current) return;

        const viewport = engine!.getViewport(VP_3D) as Types.IVolumeViewport;
        if (!viewport) return;

        applyVolumeStyle(viewport, { preset: activePreset, colormap: activeColormap, quality: activeQuality, wl: state.windowLevel });
        viewport.resetCamera({ resetPan: true, resetZoom: true, resetToCenter: true });
        // Start slightly rotated (not dead-on frontal) so enabling two slice
        // planes doesn't hide everything behind an edge-on plane.
        try {
          const cam = (viewport as any).getRenderer?.()?.getActiveCamera?.();
          if (cam) {
            cam.azimuth(30);
            cam.elevation(20);
            cam.orthogonalizeViewUp?.();
            (viewport as any).getRenderer?.()?.resetCameraClippingRange?.();
          }
        } catch { /* camera not ready */ }
        viewport.render();
        // Volume is in the scene — implant actors can be safely added now
        setReady(true);
      } catch (err) {
        if (!cancelled && !destroyedRef.current) {
          console.error('[SURGCT] Failed to set volume on 3D viewport:', err);
        }
      }
    }

    loadVolume();

    return () => {
      cancelled = true;
      setReady(false);
    };
  }, [volumeId, activePreset]);

  // Re-apply colormap and quality without reloading the volume
  useEffect(() => {
    if (!ready) return;
    const engine = getRenderingEngine(RENDERING_ENGINE_ID);
    const viewport = engine?.getViewport(VP_3D) as Types.IVolumeViewport | undefined;
    if (!viewport) return;
    const actor = (viewport as any).getDefaultActor?.()?.actor;
    if (actor) {
      applyColormap3D(actor, activeColormap, state.windowLevel);
      applyQuality3D(actor, activeQuality);
      viewport.render();
    }
  }, [state.windowLevel, activePreset, activeColormap, activeQuality, ready]);

  const handleQualityChange = useCallback((q: Volume3DQuality) => {
    setActiveQuality(q);
    dispatch({ type: 'SET_DISPLAY', payload: { quality3d: q } });
    const engine = getRenderingEngine(RENDERING_ENGINE_ID);
    const viewport = engine?.getViewport(VP_3D) as Types.IVolumeViewport | undefined;
    if (viewport) {
      const actor = (viewport as any).getDefaultActor?.()?.actor;
      if (actor) {
        applyQuality3D(actor, q);
        viewport.render();
      }
    }
  }, [dispatch]);

  const handleColormapChange = useCallback((c: Volume3DColormap) => {
    setActiveColormap(c);
    dispatch({ type: 'SET_DISPLAY', payload: { colormap3d: c } });
    const engine = getRenderingEngine(RENDERING_ENGINE_ID);
    const viewport = engine?.getViewport(VP_3D) as Types.IVolumeViewport | undefined;
    if (viewport) {
      const actor = (viewport as any).getDefaultActor?.()?.actor;
      if (actor) {
        applyColormap3D(actor, c, state.windowLevel);
        viewport.render();
      }
    }
  }, [dispatch, state.windowLevel]);

  const handleZoom = useCallback((factor: number) => {
    const engine = getRenderingEngine(RENDERING_ENGINE_ID);
    const viewport = engine?.getViewport(VP_3D) as Types.IVolumeViewport | undefined;
    if (!viewport) return;
    try {
      const vtkCam = (viewport as any).getRenderer?.()?.getActiveCamera?.();
      if (vtkCam) {
        vtkCam.zoom(factor);
        (viewport as any).getRenderer?.()?.resetCameraClippingRange?.();
        viewport.render();
      }
    } catch (err) {
      console.warn('[SURGCT] 3D zoom error:', err);
    }
  }, []);

  const handleResetZoom = useCallback(() => {
    const engine = getRenderingEngine(RENDERING_ENGINE_ID);
    const viewport = engine?.getViewport(VP_3D) as Types.IVolumeViewport | undefined;
    if (!viewport) return;
    try {
      viewport.resetCamera({ resetPan: true, resetZoom: true, resetToCenter: true });
      const vtkCam = (viewport as any).getRenderer?.()?.getActiveCamera?.();
      if (vtkCam) {
        (viewport as any).getRenderer?.()?.resetCameraClippingRange?.();
      }
      viewport.render();
    } catch (err) {
      console.warn('[SURGCT] 3D reset camera error:', err);
    }
  }, []);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden flex items-center justify-center select-none" data-vp="3D" data-vp-title="3D">
      <div
        ref={elementRef}
        className="w-full h-full"
        onContextMenu={(e) => e.preventDefault()}
      />

      <ViewportOverlay sliceIndex={0} totalSlices={0} viewKey="3D" />

      {/* Implant / sleeve / axis 3D meshes (added once the volume is loaded) */}
      {ready && <Implant3DActors layers={layers3D} />}
      {ready && <ScanActors />}
      {ready && <Slice3DActors axes={sliceAxes} preset={activePreset} rebuildKey={sliceRebuild} />}

      {/* 3D label */}
      <OrientationLabel text="3D" viewKey="3D" />

      {/* Separate 3D Layers checkbox box at bottom-right positioned just above the nav bar */}
      {state.volumeId && (
        <div
          className={`absolute ${
            state.layoutMode === '1x1' ? 'bottom-20' : 'bottom-11'
          } right-3 z-30 flex flex-col gap-1.5 px-2.5 py-2 rounded-none bg-slate-950/90 backdrop-blur-md border border-slate-700 shadow-2xl select-none`}
        >
          <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-1 font-semibold">
            3D Layers
          </div>
          <div className="flex flex-col gap-1">
            {([
              ['implant', t('view3d.implant')],
              ['sleeve', t('view3d.sleeve')],
              ['axis', t('view3d.axis')],
            ] as [keyof Implant3DLayers, string][]).map(([key, label]) => (
              <label
                key={key}
                className="flex items-center gap-1.5 text-[10px] text-slate-200 hover:text-white cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={layers3D[key]}
                  onChange={(e) => setLayers3D((p) => ({ ...p, [key]: e.target.checked }))}
                  className="accent-white w-3.5 h-3.5 rounded-none"
                />
                <span className="whitespace-nowrap font-medium">{label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Expanded bottom control bar: Quality · Colormap · Slice planes · Zoom / Unzoom (No sliding) */}
      {state.volumeId && (
        <div
          className={`absolute ${
            state.layoutMode === '1x1' ? 'bottom-12' : 'bottom-2'
          } left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 whitespace-nowrap rounded-none bg-slate-950/90 backdrop-blur-md border border-slate-700 shadow-2xl shrink-0`}
        >
          {/* Quality: low / medium / high */}
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[9px] sm:text-[10px] text-slate-400 select-none hidden sm:inline">{t('view3d.quality')}</span>
            {QUALITIES.map((q) => (
              <button
                key={q}
                onClick={() => handleQualityChange(q)}
                className={`px-1.5 py-0.5 rounded-none text-[9px] sm:text-[10px] font-semibold transition-colors border ${
                  activeQuality === q ? 'bg-white text-black border-white' : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                {t(`quality.${q}`)}
              </button>
            ))}
          </div>

          <span className="w-px h-3.5 bg-slate-700 shrink-0" />

          {/* Vertical Colormap choosing menu */}
          <div className="relative shrink-0" ref={colorMenuRef}>
            <button
              onClick={() => setColorOpen((o) => !o)}
              title={t('view3d.color')}
              className="flex items-center gap-1.5 px-2 py-1 rounded-none text-[10px] sm:text-[11px] text-slate-200 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-500 transition-colors whitespace-nowrap"
            >
              <div className={`w-3 h-3 rounded-none border border-slate-600 shrink-0 ${COLORMAP_SWATCHES[activeColormap]}`} />
              <span className="whitespace-nowrap font-medium">{t(`colormap.${activeColormap}`)}</span>
              <svg className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${colorOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {colorOpen && (
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-44 rounded-none bg-slate-950/98 backdrop-blur-md border border-slate-700 shadow-2xl p-1.5 z-50 flex flex-col gap-1">
                <div className="px-2 py-1 text-[9px] font-mono text-slate-400 uppercase tracking-wider border-b border-slate-800 mb-0.5 font-semibold">
                  Colormap
                </div>
                {VOLUME_3D_COLORMAPS.map((c) => (
                  <button
                    key={c}
                    onClick={() => { handleColormapChange(c); setColorOpen(false); }}
                    className={`w-full flex items-center justify-between px-2 py-1.5 text-[11px] font-mono rounded-none transition-all ${
                      activeColormap === c
                        ? 'bg-white text-black font-bold shadow-sm'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span>{t(`colormap.${c}`)}</span>
                    <div className={`w-5 h-2.5 rounded-none border ${activeColormap === c ? 'border-black' : 'border-slate-700'} ${COLORMAP_SWATCHES[c]}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <span className="w-px h-3.5 bg-slate-700 shrink-0" />

          {/* Slice-plane toggles */}
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[9px] sm:text-[10px] text-slate-400 select-none hidden sm:inline">{t('view3d.slices')}</span>
            {SLICE_AXES.map((axis) => (
              <button
                key={axis}
                onClick={() => setSliceAxes((p) => ({ ...p, [axis]: !p[axis] }))}
                title={t(`view.${axis.toLowerCase()}`)}
                className={`px-1.5 py-0.5 rounded-none text-[9px] sm:text-[10px] font-semibold transition-colors border ${
                  sliceAxes[axis] ? 'bg-white text-black border-white' : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                {axis[0]}
              </button>
            ))}
          </div>

          <span className="w-px h-3.5 bg-slate-700 shrink-0" />

          {/* 3D Zoom & Unzoom Controls */}
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[9px] sm:text-[10px] text-slate-400 select-none hidden sm:inline">Zoom</span>
            <button
              onClick={() => handleZoom(1.2)}
              title="Zoom In (3D)"
              className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-none text-xs font-bold bg-slate-900 text-slate-200 border border-slate-700 hover:bg-slate-800 hover:text-white transition-colors"
            >
              +
            </button>
            <button
              onClick={() => handleZoom(0.8)}
              title="Zoom Out / Unzoom (3D)"
              className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-none text-xs font-bold bg-slate-900 text-slate-200 border border-slate-700 hover:bg-slate-800 hover:text-white transition-colors"
            >
              −
            </button>
            <button
              onClick={handleResetZoom}
              title="Reset 3D Zoom & View"
              className="px-1.5 h-5 sm:h-6 flex items-center justify-center rounded-none text-[9px] sm:text-[10px] font-mono text-slate-300 bg-slate-900 border border-slate-700 hover:bg-slate-800 hover:text-white transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
