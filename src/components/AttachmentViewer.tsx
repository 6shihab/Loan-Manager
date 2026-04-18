import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Download, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { getAttachment } from '../utils/storageDB';

export interface AttachmentEntry {
  id: string;
  label: string;
}

interface AttachmentViewerProps {
  attachments: AttachmentEntry[];
  onClose: () => void;
}

interface LoadedAttachment {
  id: string;
  label: string;
  url: string;
  name: string;
  type: string;
  size: number;
  isImage: boolean;
}

export function AttachmentViewer({ attachments, onClose }: AttachmentViewerProps) {
  const [loaded, setLoaded] = useState<LoadedAttachment[]>([]);
  const [missing, setMissing] = useState<AttachmentEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const urls: string[] = [];

    (async () => {
      const found: LoadedAttachment[] = [];
      const notFound: AttachmentEntry[] = [];

      for (const entry of attachments) {
        const file = await getAttachment(entry.id);
        if (!file) {
          notFound.push(entry);
          continue;
        }
        const url = URL.createObjectURL(file);
        urls.push(url);
        found.push({
          id: entry.id,
          label: entry.label,
          url,
          name: file.name || 'attachment',
          type: file.type || 'application/octet-stream',
          size: file.size,
          isImage: (file.type || '').startsWith('image/'),
        });
      }

      if (cancelled) {
        urls.forEach((u) => URL.revokeObjectURL(u));
        return;
      }

      setLoaded(found);
      setMissing(notFound);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [attachments]);

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="w-full max-w-lg max-h-[90vh] flex flex-col bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">
            Attachments
          </h2>
          <button
            onClick={onClose}
            className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400">
              <Loader2 className="animate-spin mb-2" size={28} />
              <span className="text-sm">Loading attachments...</span>
            </div>
          )}

          {!loading && loaded.length === 0 && missing.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400 text-sm">
              No attachments found.
            </div>
          )}

          {loaded.map((att) => (
            <div
              key={att.id}
              className="rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden bg-gray-50 dark:bg-gray-800/60"
            >
              <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                <div className="min-w-0">
                  <div className="text-xs font-semibold uppercase tracking-wider text-indigo-500 dark:text-fuchsia-400">
                    {att.label}
                  </div>
                  <div className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                    {att.name}
                  </div>
                  <div className="text-xs text-gray-400">
                    {att.type || 'unknown'} · {formatSize(att.size)}
                  </div>
                </div>
                <a
                  href={att.url}
                  download={att.name}
                  className="ml-3 flex items-center gap-1 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-fuchsia-500/10 dark:text-fuchsia-400 text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-fuchsia-500/20 transition-colors shrink-0"
                >
                  <Download size={14} /> Save
                </a>
              </div>

              <div className="p-3 flex items-center justify-center">
                {att.isImage ? (
                  <img
                    src={att.url}
                    alt={att.name}
                    className="max-h-[55vh] max-w-full rounded-lg object-contain bg-black/5 dark:bg-black/30"
                  />
                ) : att.type === 'application/pdf' ? (
                  <iframe
                    src={att.url}
                    title={att.name}
                    className="w-full h-[55vh] rounded-lg bg-white"
                  />
                ) : (
                  <a
                    href={att.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-col items-center justify-center w-full py-10 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-fuchsia-400 transition"
                  >
                    <FileText size={40} className="mb-2" />
                    <span className="text-sm font-medium">Open file</span>
                  </a>
                )}
              </div>
            </div>
          ))}

          {missing.map((m) => (
            <div
              key={m.id}
              className="flex items-start gap-2 rounded-2xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 px-4 py-3 text-amber-700 dark:text-amber-300 text-sm"
            >
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold">{m.label}</div>
                <div className="text-xs opacity-80">
                  File no longer available in local storage.
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
