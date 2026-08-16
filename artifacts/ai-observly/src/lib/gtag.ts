/** Safely fire a GA4 named event. No-op on the server or when GA4 hasn't loaded. */
export function fireEvent(name: string) {
  if (typeof window !== "undefined" && typeof (window as { gtag?: Function }).gtag === "function") {
    (window as { gtag: Function }).gtag("event", name);
  }
}
