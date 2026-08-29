---
name: Sanity nested array dialogs
description: How to keep nested Docs array-item editors open while Sanity autosaves.
---

For nested Docs content arrays, disable Sanity tree editing and use dialog-style item editing. Keep updates field-scoped rather than replacing an entire object. Buffer Step titles, Code Variant fields, and image alt text locally and commit them only through explicit save actions.

**Why:** In the Studio version used by this project, tree-editing focus-path updates can navigate back from a nested item after its first autosaved character. Step titles, multi-field Code Variants, and nested image alt text require manual commits so authors can finish a complete value before the parent array updates.

**How to apply:** Use persistent dialogs for Portable Text object blocks and nested arrays. For Step titles, Code Variants, and Docs image alt text, keep keystrokes local and expose always-visible save buttons that commit the completed value once.