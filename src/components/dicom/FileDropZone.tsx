import { useCallback, useRef, useState, type DragEvent, type ChangeEvent } from 'react';
import { useDicomLoader } from '@/hooks/useDicomLoader';
import { useViewer } from '@/context/ViewerContext';
import { useI18n } from '@/i18n/I18nContext';

export function FileDropZone() {
  const { loadFiles, isLoading, loadProgress, error } = useDicomLoader();
  const { dispatch } = useViewer();
  const { t } = useI18n();
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const collectFiles = async (entries: FileSystemEntry[]): Promise<File[]> => {
    const files: File[] = [];

    async function readEntry(entry: FileSystemEntry): Promise<void> {
      if (entry.isFile) {
        const file = await new Promise<File>((resolve, reject) => {
          (entry as FileSystemFileEntry).file(resolve, reject);
        });
        files.push(file);
      } else if (entry.isDirectory) {
        const reader = (entry as FileSystemDirectoryEntry).createReader();
        // readEntries returns results in batches — must loop until empty
        let batch: FileSystemEntry[];
        do {
          batch = await new Promise<FileSystemEntry[]>((resolve, reject) => {
            reader.readEntries(resolve, reject);
          });
          for (const sub of batch) {
            await readEntry(sub);
          }
        } while (batch.length > 0);
      }
    }

    for (const entry of entries) {
      await readEntry(entry);
    }
    return files;
  };

  const handleDrop = useCallback(
    async (e: DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      try {
        // webkitGetAsEntry (recursive folders) is Chromium-only; fall back to
        // the flat file list on Firefox/Safari.
        const entries: FileSystemEntry[] = [];
        const items = e.dataTransfer.items;
        if (items && items.length > 0 && typeof items[0].webkitGetAsEntry === 'function') {
          for (let i = 0; i < items.length; i++) {
            const entry = items[i].webkitGetAsEntry();
            if (entry) entries.push(entry);
          }
        }

        const files = entries.length > 0
          ? await collectFiles(entries)
          : Array.from(e.dataTransfer.files ?? []);
        if (files.length > 0) {
          loadFiles(files);
        }
      } catch (err) {
        dispatch({
          type: 'SET_ERROR',
          payload: t('error.loadError', { msg: err instanceof Error ? err.message : String(err) }),
        });
      }
    },
    [loadFiles, dispatch, t],
  );

  const handleFileInput = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const fileList = e.target.files;
      if (fileList && fileList.length > 0) {
        loadFiles(Array.from(fileList));
      }
    },
    [loadFiles],
  );

  const progressPercent =
    loadProgress && loadProgress.total > 0
      ? Math.round((loadProgress.loaded / loadProgress.total) * 100)
      : 0;

  return (
    <div className="flex items-center justify-center w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative flex flex-col items-center justify-center
          w-full h-80
          border-2 border-dashed rounded-none
          transition-all duration-200 cursor-pointer
          ${
            isDragOver
              ? 'border-white bg-zinc-900 scale-[1.01]'
              : 'border-zinc-700 bg-black/60 hover:border-zinc-500 hover:bg-zinc-950'
          }
        `}
      >
        {/* Files: individual DICOM files */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileInput}
          className="hidden"
          accept=".dcm,.dicom,application/dicom"
        />
        {/* Folder: a whole study/series directory (Chromium: webkitdirectory) */}
        <input
          ref={folderInputRef}
          type="file"
          onChange={handleFileInput}
          className="hidden"
          multiple
          {...({ webkitdirectory: '', directory: '' } as Record<string, string>)}
        />

        {isLoading ? (
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 border-3 border-white border-t-transparent rounded-none animate-spin mb-4" />
            <p className="text-sm font-semibold text-white font-mono">{t('drop.processing')}</p>
            {loadProgress && (
              <div className="mt-3 w-64">
                <div className="flex justify-between text-xs text-zinc-400 mb-1 font-mono">
                  <span>
                    {t('drop.files', { loaded: loadProgress.loaded, total: loadProgress.total })}
                  </span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-none h-1.5">
                  <div
                    className="bg-white h-1.5 rounded-none transition-all duration-150"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <svg
              className="w-12 h-12 text-zinc-400 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="square"
                strokeLinejoin="miter"
                strokeWidth={1.5}
                d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-base font-semibold text-white mb-1 text-center">{t('drop.title')}</p>
            <p className="text-xs text-zinc-400 mb-4 text-center max-w-xs leading-relaxed">
              {t('drop.hint')}
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 text-xs font-semibold rounded-none bg-white text-black hover:bg-zinc-200 transition-colors"
              >
                {t('drop.chooseFiles')}
              </button>
              <button
                type="button"
                onClick={() => folderInputRef.current?.click()}
                className="px-4 py-2 text-xs font-medium rounded-none border border-zinc-600 text-white hover:bg-zinc-900 transition-colors flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.6}
                    d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                </svg>
                {t('drop.chooseFolder')}
              </button>
            </div>
            <p className="text-[11px] text-zinc-500 mt-3 text-center font-mono">{t('drop.format')}</p>
          </>
        )}

        {error && (
          <div className="absolute bottom-4 left-4 right-4 bg-zinc-900 border border-red-500 rounded-none p-3 text-xs text-red-200">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
