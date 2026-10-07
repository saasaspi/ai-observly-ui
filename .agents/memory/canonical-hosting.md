---
name: Canonical domain and hosting
description: Non-www canonical requirement and the external hosting redirect that must be resolved before host redirects are enabled.
---

The requested canonical origin is `https://aiobservly.com`, without www.

**Why:** The technical SEO brief explicitly requires this origin.

**How to apply:** Use this origin for public-page canonicals, sitemap URLs, and structured data. Do not use development or Replit deployment URLs as canonical fallbacks.

The custom domains were observed serving Vercel, with the apex redirecting to www, while the registered Replit deployment serves `aiobservly.replit.app`. These are separate hosting surfaces.

**Why:** Enabling an application-level www-to-apex redirect while the hosting layer redirects apex-to-www creates a loop. Publishing the Replit app alone cannot be assumed to update the custom-domain site.

**How to apply:** Recheck both live domain redirect chains and their hosting before enabling host consolidation. Remove the opposing hosting redirect first, confirm which deployment serves the custom domain, and check external OAuth origins/callback registrations.
