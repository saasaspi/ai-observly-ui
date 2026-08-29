---
name: Sanity nested array dialogs
description: How to keep nested Docs array-item editors open while Sanity autosaves.
---

For nested Docs content arrays, disable Sanity tree editing and use dialog-style item editing. Keep updates field-scoped rather than replacing an entire object.

**Why:** In the Studio version used by this project, tree-editing focus-path updates can navigate back from a nested item after its first autosaved character. Persistent legacy dialogs remain mounted across autosave updates.

**How to apply:** Use this for Portable Text object blocks and their nested arrays, including steps and code variants, whenever authors must remain in the editor until they explicitly close it.