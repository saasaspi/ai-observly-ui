---
name: Public website browser readiness
description: Reliable readiness checks for the public site's analytics-enabled pages and animated navigation drawers.
---

Use control readiness and visible UI state, not global network idle, when verifying public website interactions.

**Why:** Background analytics can keep network requests active after the page is usable. Conversely, server-rendered controls can appear before their client handlers are ready, producing false menu failures if clicked immediately.

**How to apply:** Wait for the relevant control to become interactive, then assert the resulting UI state. Allow drawer opening animations to settle before measuring their position. Preserve analytics behavior rather than disabling it to make tests pass.
