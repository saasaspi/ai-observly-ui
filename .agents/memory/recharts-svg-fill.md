---
name: Recharts SVG fill
description: CSS custom properties don't work as SVG fill values; must use hex + Cell component
---

## Rule
Never use `fill="var(--primary)"` or other CSS custom properties in Recharts SVG elements. SVG `fill` attributes are not CSS properties — they don't resolve CSS variables. Bars will render black (the SVG default).

**Why:** Recharts renders SVG elements directly. The `fill` attribute in SVG is not the same as the CSS `fill` property — it doesn't inherit from CSS custom properties set on parent elements.

**How to apply:**
- Use hardcoded hex colors: `fill="#2563eb"` for primary blue, `fill="#ef4444"` for red
- Use the `Cell` component from recharts (not `<rect>`) for per-bar coloring:
  ```tsx
  import { Cell } from "recharts";
  <Bar dataKey="cost">
    {data.map((entry, i) => <Cell key={i} fill={entry.isSpike ? "#ef4444" : "#2563eb"} />)}
  </Bar>
  ```
- The `cursor` prop on Tooltip accepts CSS vars fine since that's a React inline style, not an SVG attribute
