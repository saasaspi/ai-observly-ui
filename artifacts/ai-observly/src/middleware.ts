import { NextRequest, NextResponse } from "next/server";

const PRIVATE = /^\/(dashboard|login|signup|onboarding|settings|customers)(\/|$)/;
const INTERNAL = /^\/(api|napi|_next|social)(\/|$)/;
export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const host = (request.headers.get("x-forwarded-host") || request.headers.get("host") || "").split(":")[0].toLowerCase();
  // Enable only after the hosting-level non-www -> www redirect has been removed.
  // Keep auth/API callbacks on the host they were registered against.
  if (process.env.ENABLE_CANONICAL_HOST_REDIRECT === "true" &&
      ["www.aiobservly.com", "aiobservly.replit.app"].includes(host) &&
      !PRIVATE.test(url.pathname) && !INTERNAL.test(url.pathname) &&
      ["GET", "HEAD"].includes(request.method)) {
    return NextResponse.redirect(new URL(url.pathname + url.search, "https://aiobservly.com"), 301);
  }
  const protocol = request.headers.get("x-forwarded-proto");
  if (["aiobservly.com", "www.aiobservly.com"].includes(host) && protocol === "http") {
    return NextResponse.redirect(new URL(url.pathname + url.search, `https://${host}`), 301);
  }
  if (!PRIVATE.test(url.pathname) && !INTERNAL.test(url.pathname) && !/\.[a-z0-9]+$/i.test(url.pathname)) {
    const normalized = url.pathname.toLowerCase().replace(/\/+$/, "") || "/";
    if (url.pathname !== normalized) {
      url.pathname = normalized;
      url.host = request.headers.get("x-forwarded-host")?.split(",")[0].trim() || request.headers.get("host") || url.host;
      return NextResponse.redirect(url, 301);
    }
  }
  const response = NextResponse.next();
  if (PRIVATE.test(url.pathname) || /^\/(api|napi|_next|auth|internal|studio)(\/|$)/.test(url.pathname) || url.pathname === "/features" ||
      (url.pathname.startsWith("/features/") && !/^\/features\/(per-customer-cost-attribution|per-feature-margins-roi|plan-pricing-profitability|ai-savings|ai-response-speed|ai-reliability)\/?$/.test(url.pathname)))
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  else if (url.search) response.headers.set("X-Robots-Tag", "noindex, follow");
  return response;
}
export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.png|apple-touch-icon.png).*)"] };
