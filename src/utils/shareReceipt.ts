import { toBlob } from 'html-to-image';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

export type ShareOutcome = 'shared-image' | 'shared-text' | 'downloaded' | 'cancelled';

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

function isCapacitorNative(): boolean {
  const cap = (window as Window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  return typeof cap !== 'undefined' && cap?.isNativePlatform?.() === true;
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]); // strip "data:image/png;base64," prefix
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function shareReceiptImage(
  node: HTMLElement,
  filename: string,
  fallbackText: string
): Promise<ShareOutcome> {
  const blob = await toBlob(node, { pixelRatio: 2, cacheBust: true });
  if (!blob) {
    throw new Error('Capture returned null blob');
  }

  // Native Android: write PNG to cache then share via native intent
  if (isCapacitorNative()) {
    const base64 = await blobToBase64(blob);
    await Filesystem.writeFile({
      path: filename,
      data: base64,
      directory: Directory.Cache,
    });

    const { uri } = await Filesystem.getUri({
      path: filename,
      directory: Directory.Cache,
    });

    try {
      await Share.share({ title: filename, url: uri, dialogTitle: 'Share Receipt' });
      return 'shared-image';
    } catch (err) {
      if (isAbortError(err)) return 'cancelled';
      throw err;
    }
  }

  // Web/desktop: Web Share API with file, fallback to text, then download
  const file = new File([blob], filename, { type: 'image/png' });
  const nav = navigator as typeof navigator & { canShare?: (data: { files?: File[] }) => boolean };

  if (typeof nav.share === 'function' && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], text: fallbackText });
      return 'shared-image';
    } catch (err) {
      if (isAbortError(err)) return 'cancelled';
    }
  }

  if (typeof nav.share === 'function') {
    try {
      await nav.share({ text: fallbackText });
      return 'shared-text';
    } catch (err) {
      if (isAbortError(err)) return 'cancelled';
    }
  }

  downloadBlob(blob, filename);
  return 'downloaded';
}
