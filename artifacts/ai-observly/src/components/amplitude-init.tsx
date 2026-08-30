'use client';

import * as amplitude from '@amplitude/unified';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

let initPromise: Promise<void> | null = null;
let homePageEventQueued = false;
let missingKeyWarningShown = false;

export function AmplitudeInit() {
  const pathname = usePathname();

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;

    if (!apiKey) {
      if (!missingKeyWarningShown) {
        console.warn('Amplitude API key missing — analytics disabled');
        missingKeyWarningShown = true;
      }
      return;
    }

    if (!initPromise) {
      initPromise = amplitude.initAll(apiKey, {
        analytics: { autocapture: true },
        sessionReplay: { sampleRate: 1 },
      });
    }

    if (pathname === '/' && !homePageEventQueued) {
      homePageEventQueued = true;
      amplitude.track('Viewed Home Page', { prompt_version: 'BA400.4' });
    }
  }, [pathname]);

  return null;
}