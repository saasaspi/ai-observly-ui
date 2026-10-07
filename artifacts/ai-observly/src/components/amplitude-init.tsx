'use client';

import * as amplitude from '@amplitude/unified';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

let initPromise: Promise<void> | null = null;
let homePageEventQueued = false;
let missingKeyWarningShown = false;

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
    initPromise = amplitude.initAll(apiKey, {
      analytics: { autocapture: true },
      sessionReplay: { sampleRate: 1 },
    });
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
    if (pathname === '/' && !homePageEventQueued) {
      homePageEventQueued = true;
      void initializeAmplitude().then(async (initialized) => {
        if (!initialized) {
          homePageEventQueued = false;
          return;
        }
        await amplitude
          .track('Viewed Home Page', { prompt_version: 'BA400.4' })
          .promise.catch(() => undefined);
      });
      return;
    }

    void initializeAmplitude();
  }, [pathname]);

  return null;
}