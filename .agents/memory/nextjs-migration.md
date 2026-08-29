---
name: Next.js Migration — AI Observly
description: Key decisions from converting AI Observly from React Vite to Next.js 15 App Router
---

## Summary
AI Observly was fully migrated from React Vite + wouter to Next.js 15 App Router.

## Critical: /api/* path conflict
The `api-server` artifact in this monorepo owns the `/api` path in the Replit proxy. Any `fetch('/api/...')` call from the Next.js app browser code gets intercepted by the api-server (returning 404), NOT by Next.js's own API routes. Fix: all Next.js internal API routes must use a prefix other than `/api/` — this project uses `/napi/`. Files live in `src/app/napi/*/route.ts` and `src/lib/api.ts` calls `/napi/...`.

**Why:** Replit path-based routing at the proxy level takes precedence over Next.js internal routing.

**How to apply:** Any new Next.js API route must go under `src/app/napi/`, not `src/app/api/`.

## Stale .next cache causes 500s after heavy refactors
When many new pages/components are added in one session, the dev server can serve from a stale `.next` chunk manifest and throw `Cannot find module './NNN.js'` 500s. Running `next build` while `next dev` is active can also replace chunks in the shared `.next` directory. Always restart the web workflow after a production build; if the error persists, clear `.next` and restart.

**Why:** Next.js dev mode caches chunk IDs; adding many new imports shifts IDs, making old cached references invalid.

**How to apply:** Restart the web workflow after every production build. After large file changes, clear `.next` and restart before deeper debugging if missing-module 500s persist.

## React type split and Radix primitives
The workspace currently resolves incompatible React type versions. The global typecheck reports JSX incompatibilities for otherwise working Radix components.

**Why:** Replacing an accessible primitive with a hand-built substitute to silence these errors can regress focus management, while changing React types is a broad project-wide migration.

**How to apply:** Reuse the existing runtime-tested UI primitives. If a new isolated surface must remain free of added diagnostics, contain the type mismatch at a local compatibility boundary rather than weakening interaction behavior.

## recharts SSR note
recharts works fine in `"use client"` pages (Next.js still hydrates them server-side). No `dynamic(() => import(...), { ssr: false })` needed as long as all chart-containing components carry `"use client"`.

## Key decisions

**Why:** User explicitly requested Next.js App Router migration.

**Architecture:**
- All pages are `"use client"` (they all use React hooks / useState)
- `src/app/` directory with file-based routing
- API routes in `src/app/api/*/route.ts` returning mock data
- `localStorage` for auth state (`ai_observly_authed`) and custom features/plans — no database
- `src/lib/api.ts` uses `fetch('/api/...')` for server data; localStorage for features/plans

**Package changes:**
- Added: `next@^15.3.0`, `@tailwindcss/postcss` (replaces `@tailwindcss/vite`)
- Removed: `vite`, `@vitejs/plugin-react`, `wouter`
- Tailwind v4 stays — CSS entry point is `src/app/globals.css` using `@import "tailwindcss"`

**Routing changes:**
- `import { Link } from "wouter"` → `import Link from "next/link"`
- `import { useLocation } from "wouter"` → `import { usePathname } from "next/navigation"`
- `const [, setLocation] = useLocation()` → `const router = useRouter()` + `router.push(path)`

**Hydration:**
- `docs/page.tsx` uses `useEffect` + `useState` to check localStorage auth (avoids SSR hydration mismatch)
- `typeof window !== 'undefined'` patterns must be wrapped in `useEffect`

**Config files:**
- `next.config.mjs`: `allowedDevOrigins: ["*.replit.dev", ...]` to suppress cross-origin warning
- `postcss.config.mjs`: uses `@tailwindcss/postcss`
- `tsconfig.json`: bundler resolution, next plugin, `@/*` paths to `./src/*`

**Production:**
- artifact.toml production `run = "pnpm --filter @workspace/ai-observly run start"` (next start)
- Build: `pnpm --filter @workspace/ai-observly run build` (next build)
- No longer static serving

**Deleted files:**
- `vite.config.ts`, `src/main.tsx`, `src/App.tsx`, `src/index.css`, `src/pages/` (entire directory)
