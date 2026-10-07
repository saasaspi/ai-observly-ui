'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

let initPromise: Promise<void> | null = null;
let homePageEventQueued = false;
let missingKeyWarningShown = false;
const loadAmplitude = () => import('@amplitude/unified');

export async function initializeAmplitude(): Promise<boolean> {
  const apiKey = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;

  if (!apiKey) {
    if (!missingKeyWarningShown) {
      console.warn('Amplitude API key missing — analytics disabled');
      missingKeyWarningShown = true;
    }
    return false;
  }

  if (!initPromise) {
    initPromise = loadAmplitude().then(amplitude => amplitude.initAll(apiKey, {
      analytics: { autocapture: true },
      sessionReplay: { sampleRate: 1 },
    }));
  }

  try {
    await initPromise;
    return true;
  } catch {
    initPromise = null;
    return false;
  }
}

export function AmplitudeInit() {
  const pathname = usePathname();

  useEffect(() => {
    const initialize = () => {
    if (pathname === '/' && !homePageEventQueued) {
      homePageEventQueued = true;
      void initializeAmplitude().then(async (initialized) => {
        if (!initialized) {
          homePageEventQueued = false;
          return;
        }
        const amplitude = await loadAmplitude();
        await amplitude
          .track('Viewed Home Page', { prompt_version: 'BA400.4' })
          .promise.catch(() => undefined);
      });
      return;
    }

    void initializeAmplitude();
    };
    // Keep analytics off the critical rendering path; custom-event callers can
    // still initialize immediately through initializeAmplitude().
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      initialize();
    };
    const timer = window.setTimeout(start, 8000);
    window.addEventListener('pointerdown', start, { once: true, passive: true });
    window.addEventListener('keydown', start, { once: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('pointerdown', start);
      window.removeEventListener('keydown', start);
    };
  }, [pathname]);

  return null;
}