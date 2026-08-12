---
name: Google Auth GIS approach
description: Why we use Google Identity Services script directly instead of @react-oauth/google provider
---

## Rule
Do NOT use `GoogleOAuthProvider` from `@react-oauth/google` with an empty clientId. It crashes the entire Next.js app client-side. Instead, load the GIS script (`https://accounts.google.com/gsi/client`) in the layout and call `window.google.accounts.oauth2.initTokenClient` directly in the button component.

**Why:** `@react-oauth/google` initializes the GIS library during provider mount. An empty string clientId causes a 403 from Google's servers during initialization, which throws and kills the React tree. The GIS script approach only calls the API on button click, so graceful degradation (toast when no client ID) works cleanly.

**How to apply:**
- In `layout.tsx`: `<script src="https://accounts.google.com/gsi/client" async defer />`
- In the button component: check `process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID` before calling the GIS API
- No provider wrapper needed — `@react-oauth/google` package can stay installed but its provider should not be used
- When client ID is missing: show a toast, don't attempt OAuth
