/**
 * Safe sessionStorage persistence & non-destructive canvas visibility lifecycle helpers.
 * Designed for mobile browsers (Samsung Internet, Chrome Android, Safari iOS) where
 * screenshots, camera pickers, orientation changes, or visibility transitions can
 * evict GPU canvas buffers or re-mount views.
 */

export function readSessionDraft<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (parsed === null || parsed === undefined) return fallback;
    if (
      typeof fallback === 'object' &&
      fallback !== null &&
      !Array.isArray(fallback) &&
      typeof parsed === 'object' &&
      !Array.isArray(parsed)
    ) {
      return { ...fallback, ...parsed } as T;
    }
    return parsed as T;
  } catch {
    return fallback;
  }
}

export function writeSessionDraft<T>(
  key: string,
  value: T,
  maxChars = 160_000
): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const serialized = JSON.stringify(value);
    if (serialized.length > maxChars) {
      return false;
    }
    window.sessionStorage.setItem(key, serialized);
    return true;
  } catch {
    // Gracefully ignore QuotaExceededError or private-mode storage restrictions
    return false;
  }
}

export function removeSessionDraft(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // Ignored
  }
}

/**
 * Safely stores a lightweight JPEG copy of a user-uploaded portrait in sessionStorage
 * (strictly bounded under maxChars) so screenshots / camera returns / tab restores
 * never lose the user's photo or throw QuotaExceededError.
 */
export function saveSessionImageSafely(
  key: string,
  img: HTMLImageElement,
  maxSide = 760,
  maxChars = 280_000
): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const srcW = img.naturalWidth || img.width;
    const srcH = img.naturalHeight || img.height;
    if (!srcW || !srcH) return false;

    const scale = Math.min(1, maxSide / Math.max(srcW, srcH));
    const targetW = Math.max(60, Math.round(srcW * scale));
    const targetH = Math.max(60, Math.round(srcH * scale));

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, targetW, targetH);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, targetW, targetH);

    const qualities = [0.82, 0.68, 0.52];
    for (const q of qualities) {
      const dataUrl = canvas.toDataURL('image/jpeg', q);
      if (dataUrl.length <= maxChars) {
        window.sessionStorage.setItem(key, dataUrl);
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

export function readSessionImageSafely(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const val = window.sessionStorage.getItem(key);
    if (val && val.startsWith('data:image/')) {
      return val;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Triggers a non-destructive canvas repaint (NEVER resetting user state) when a mobile
 * browser returns from screenshot overlay, app switch, BFCache restore, or orientation change.
 */
export function subscribeCanvasVisibilityRestore(onRestore: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

  let resizeTimer: number | null = null;
  let lastWidth = window.innerWidth;

  const scheduleRepaint = () => {
    if (resizeTimer !== null) {
      window.clearTimeout(resizeTimer);
    }
    resizeTimer = window.setTimeout(() => {
      resizeTimer = null;
      window.requestAnimationFrame(() => {
        onRestore();
      });
    }, 120);
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      scheduleRepaint();
    }
  };

  const handlePageShow = () => {
    scheduleRepaint();
  };

  const handleOrientationChange = () => {
    scheduleRepaint();
  };

  const handleResize = () => {
    // Only schedule lightweight canvas repaint when viewport width actually changes
    // (ignores mobile URL-bar vertical scroll jitter for 60fps performance)
    if (Math.abs(window.innerWidth - lastWidth) >= 24) {
      lastWidth = window.innerWidth;
      scheduleRepaint();
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('pageshow', handlePageShow);
  window.addEventListener('orientationchange', handleOrientationChange);
  window.addEventListener('resize', handleResize, { passive: true });

  return () => {
    if (resizeTimer !== null) {
      window.clearTimeout(resizeTimer);
    }
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('pageshow', handlePageShow);
    window.removeEventListener('orientationchange', handleOrientationChange);
    window.removeEventListener('resize', handleResize);
  };
}
