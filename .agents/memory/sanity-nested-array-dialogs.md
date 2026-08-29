---
name: Sanity nested array dialogs
description: How to keep nested Docs array-item editors open while Sanity autosaves.
---

For nested Docs content arrays, disable Sanity tree editing and use dialog-style item editing. Keep updates field-scoped rather than replacing an entire object. Buffer Step titles locally and commit them only through an explicit save action.

**Why:** In the Studio version used by this project, tree-editing focus-path updates can navigate back from a nested item after its first autosaved character. Step titles continued to trigger this even in persistent dialogs, so they require a manual field commit.

**How to apply:** Use persistent dialogs for Portable Text object blocks and nested arrays. For Step titles, keep keystrokes local and expose an always-visible save button that commits the completed title once.