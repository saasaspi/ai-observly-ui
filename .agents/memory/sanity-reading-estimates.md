---
name: Sanity reading estimates
description: Why blog reading estimates must account for custom Portable Text tables.
---

Sanity's plain-text extraction does not include all custom block content, notably table cells.

**Why:** Character-based and plain-text estimates produced different reading times on cards and articles containing tables.

**How to apply:** When estimating reading time, account for readable custom blocks and use the same calculation for previews and article pages. Keep body processing server-side rather than sending complete article bodies to search controls.
