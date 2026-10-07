"use client";
import { useEffect, useState } from "react";
import Script from "next/script";

export function DeferredGoogleAnalytics() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const start = () => setReady(true);
    const timer = window.setTimeout(start, 8000);
    window.addEventListener("pointerdown", start, { once: true, passive: true });
    window.addEventListener("keydown", start, { once: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pointerdown", start);
      window.removeEventListener("keydown", start);
    };
  }, []);
  return ready ? <Script src="https://www.googletagmanager.com/gtag/js?id=G-P93V7K0XZB" strategy="afterInteractive" /> : null;
}
