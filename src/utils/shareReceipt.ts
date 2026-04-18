import { toBlob } from 'html-to-image';

export type ShareOutcome = 'shared-image' | 'shared-text' | 'downloaded' | 'cancelled';

interface Navigator {
  canShare?: (data: { files?: File[] }) => boolean;
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === 'AbortError';
}

/**
 * Capture a DOM node as PNG and share via Web Share Level 2.
 * Falls back progressively: files → text → download.
 * Returns the outcome so callers can toast appropriately.
 * Throws only on capture failure; share failures are handled internally.
 */
export async function shareReceiptImage(
  node: HTMLElement,
  filename: string,
  fallbackText: string
): Promise<ShareOutcome> {
  const blob = await toBlob(node, { pixelRatio: 2, cacheBust: true });
  if (!blob) {
    throw new Error('Capture returned null blob');
  }

  const file = new File([blob], filename, { type: 'image/png' });
  const nav = navigator as Navigator & typeof navigator;

  if (typeof nav.share === 'function' && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], text: fallbackText });
      return 'shared-image';
    } catch (err) {
      if (isAbortError(err)) return 'cancelled';
      // fall through to text share
    }
  }

  if (typeof nav.share === 'function') {
    try {
      await nav.share({ text: fallbackText });
      return 'shared-text';
    } catch (err) {
      if (isAbortError(err)) return 'cancelled';
      // fall through to download
    }
  }

  downloadBlob(blob, filename);
  return 'downloaded';
}
