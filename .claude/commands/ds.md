You are working on the SeaFarer maritime VR training platform. Before writing or modifying any UI code, read and strictly follow the design system defined in the `design-system/` folder at the project root.

## What to read before starting

Always read these files first — they are the source of truth:

- `design-system/colors.md` — palette, CSS variable tokens, usage rules
- `design-system/typography.md` — fonts (Orbitron wordmark-only, Plus Jakarta Sans UI, IBM Plex Mono data)
- `design-system/spacing.md` — 4px unit system, padding, gutters
- `design-system/shape.md` — radius scale (max 14px)
- `design-system/surfaces.md` — elevation layers, glassmorphism rules, border rules
- `design-system/motion.md` — duration tokens, easing, keyframes, stagger pattern
- `design-system/do-dont.md` — hard rules you must not violate

## For component work, also read

- `design-system/components/buttons.md`
- `design-system/components/inputs.md`
- `design-system/components/nav-tiles.md`
- `design-system/components/navbar.md`
- `design-system/components/sidebar.md`
- `design-system/components/lesson-cards.md`
- `design-system/components/badges.md`
- `design-system/components/progress.md`
- `design-system/components/control-pill.md`

## For page layout work, also read

- `design-system/pages/login.md`
- `design-system/pages/dashboard.md`
- `design-system/pages/lessons.md`
- `design-system/pages/sub-pages.md`

## For implementing the new theme (v1 → v2), read

- `design-system/migration.md`

## Rules to always enforce

1. Use only CSS variables defined in `design-system/colors.md` — never hardcode hex values.
2. Orbitron is used **only** for the `SEAFARER` wordmark. Nowhere else.
3. Glassmorphism (`backdrop-filter: blur`) only on elements floating over photographic backgrounds.
4. No `box-shadow` glow effects on cards or buttons.
5. Maximum border-radius: 14px (`--radius-lg`). No pill buttons.
6. Stagger animations: `Math.min(index, 6) * 0.04s` delay — never exceed 0.28s total.
7. Icons: line-only, `currentColor`, Lucide subset. No filled icons.
8. Role colors: teal = student, gold = teacher, red = admin.

Now proceed with the user's request, applying the design system throughout.
