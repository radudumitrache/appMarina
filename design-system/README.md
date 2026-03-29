# SeaFarer — Design System
> **Version 2.0** · Education · Clean · Modern · Minimalistic

This folder is the single source of truth for all visual and interaction decisions in the SeaFarer platform.

---

## Index

| # | File | Contents |
|---|---|---|
| 1 | [philosophy.md](philosophy.md) | Design principles, personality attributes, what we are not |
| 2 | [colors.md](colors.md) | Full palette, CSS variables, usage rules |
| 3 | [typography.md](typography.md) | Font stack, type scale, weights, spacing rules |
| 4 | [spacing.md](spacing.md) | Spacing tokens, component padding, layout gutters |
| 5 | [shape.md](shape.md) | Border radius scale and usage rules |
| 6 | [surfaces.md](surfaces.md) | Elevation layers, glassmorphism rules, borders |
| 7 | [motion.md](motion.md) | Duration tokens, easing, keyframes, stagger rules |
| 8 | [components/](components/) | Per-component specs (buttons, cards, inputs, etc.) |
| 9 | [pages/](pages/) | Per-page layout templates |
| 10 | [icons.md](icons.md) | Icon style, sizes, library |
| 11 | [grid.md](grid.md) | Grid and layout rules |
| 12 | [do-dont.md](do-dont.md) | Hard rules — what is and isn't allowed |
| 13 | [migration.md](migration.md) | Old → new variable mapping with rationale |

---

## Quick Reference — CSS Variables

All tokens are defined in `src/index.css`. Abbreviated list:

```css
/* Surfaces */
--bg, --surface-1, --surface-2, --surface-3

/* Borders */
--border, --border-hover

/* Text */
--text, --text-2, --text-3

/* Accents */
--accent, --accent-hover, --accent-dim, --accent-rim
--gold, --gold-dim

/* Semantic */
--success, --error

/* Typography */
--font-brand, --font-ui, --font-mono

/* Shape */
--radius-sm, --radius-md, --radius-lg, --radius-full

/* Motion */
--ease-default, --ease-out
```

---

## Stack

React 18 + Vite + React Router DOM. No UI library — fully custom CSS.

## Pages

| Route | Component | Description |
|---|---|---|
| `/` | `Login` | Full-screen video bg, glass card login |
| `/student/dashboard` | `student/Dashboard` | Bridge bg, 5 nav tiles, student role |
| `/student/lessons` | `student/Lessons` | Sidebar + 4-col lesson grid |
| `/teacher/dashboard` | `teacher/Dashboard` | Bridge bg, 5 nav tiles, instructor role |
| `/admin/dashboard` | `admin/Dashboard` | Bridge bg, 5 nav tiles, admin role |
