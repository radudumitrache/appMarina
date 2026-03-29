# Color System

## Base Palette — Deep Ocean Blue

Dark enough for long training sessions, with enough blue-saturation to feel maritime rather than generic dark-mode.

```
--color-base-950   #060b14   page background
--color-base-900   #0b1220   elevated surface (cards, panels)
--color-base-800   #111b2e   interactive surface (hover state bg)
--color-base-700   #1a2740   subtle fills, inputs
--color-base-600   #253550   borders, dividers (primary)
--color-base-500   #3a4f6a   borders (hover), muted icons
--color-base-400   #6b83a0   placeholder text, disabled states
--color-base-300   #9db0c5   secondary text, captions
--color-base-200   #c8d8e8   body text
--color-base-100   #e4edf6   primary text, headings
--color-base-50    #f0f5fa   maximum contrast text
```

---

## Accent — Seafoam Teal

The single primary action color. Used for CTAs, active states, and key data points.
**Never use it decoratively.**

```
--color-teal-400   #0fd4b8   hover / lighter state
--color-teal-500   #0bbda4   primary accent  →  --accent
--color-teal-600   #08a38e   pressed / darker state
--color-teal-glow  rgba(11, 189, 164, 0.12)   tinted surface on hover
--color-teal-rim   rgba(11, 189, 164, 0.22)   border on hover/focus
```

---

## Secondary — Brass Gold

Used **only** for: warnings, locked states, instructor-specific elements, and key highlights.
Never competes with teal in the same component.

```
--color-gold-400   #f0b84a   light state
--color-gold-500   #d9a030   primary gold  →  --gold
--color-gold-dim   rgba(217, 160, 48, 0.12)   tinted surface
```

---

## Semantic Colors

```
--color-success    #2ec77a   completion, passing grade
--color-error      #e05252   validation errors, danger actions
--color-warning    #d9a030   same as gold; locked content, caution
--color-info       #4a9fd4   informational callouts
```

---

## Role Color Coding

Used as a wayfinding system across badges, borders, and hover states.

| Role | Color | Token |
|---|---|---|
| Student | Teal | `--accent` |
| Teacher | Gold | `--gold` |
| Admin | Red | `--error` |

---

## CSS Variable Aliases

Implement these in `src/index.css`:

```css
:root {
  /* Surfaces */
  --bg          : #060b14;
  --surface-1   : #0b1220;   /* cards, panels */
  --surface-2   : #111b2e;   /* hover, selected */
  --surface-3   : #1a2740;   /* inputs */

  /* Borders */
  --border      : #253550;
  --border-hover: #3a4f6a;

  /* Text */
  --text        : #e4edf6;
  --text-2      : #9db0c5;
  --text-3      : #6b83a0;

  /* Accents */
  --accent      : #0bbda4;
  --accent-hover: #0fd4b8;
  --accent-dim  : rgba(11, 189, 164, 0.12);
  --accent-rim  : rgba(11, 189, 164, 0.22);

  --gold        : #d9a030;
  --gold-dim    : rgba(217, 160, 48, 0.12);

  /* Semantic */
  --success     : #2ec77a;
  --error       : #e05252;
}
```

---

## Usage Rules

- **One accent per screen region.** Don't use teal and gold in the same component.
- **Never use accent for decorative borders.** Only for interactive feedback.
- **Background images** are always `opacity: 0.22–0.25` max, covered with a `--bg`-tinted gradient overlay. They provide atmosphere, not content.
- **Text on teal** → always `--bg` (`#060b14`). Never white.
- **Never use fully opaque accent as a border.** Use `--accent-rim` (22% opacity).
