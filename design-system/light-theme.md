# Light Theme — Nautical Chart

A daylight counterpart to the deep-ocean dark theme. The palette references nautical chart aesthetics: off-white chart paper, deep navy ink, steel-blue grid lines, and the same teal/gold/red accent system.

---

## Activation

Applied via `[data-theme="light"]` on `<html>`. Managed by `ThemeContext` — reads/writes `localStorage` key `sf-theme`. Toggle is in every NavBar.

---

## Surface Tokens

| Token | Hex | Used For |
|---|---|---|
| `--bg` | `#f2f7fc` | Page background — pale sea-mist |
| `--surface-1` | `#ffffff` | Cards, panels, navbar, sidebar |
| `--surface-2` | `#e4eef8` | Hover fill, selected state |
| `--surface-3` | `#d4e6f0` | Inputs, code blocks |

---

## Border Tokens

| Token | Hex |
|---|---|
| `--border` | `#b4ccde` |
| `--border-hover` | `#7aaac4` |

---

## Text Tokens

| Token | Hex | Used For |
|---|---|---|
| `--text` | `#0d1b2c` | Primary — deep navy |
| `--text-2` | `#2c4968` | Secondary, captions |
| `--text-3` | `#587898` | Placeholders, disabled |

---

## Accent Tokens (unchanged from dark theme)

Teal reads correctly on light surfaces as a border/icon/highlight color. Never use it as body text without checking contrast.

```
--accent      : #0bbda4
--accent-hover: #0fd4b8
--accent-dim  : rgba(11, 189, 164, 0.10)
--accent-rim  : rgba(11, 189, 164, 0.25)
```

---

## Gold & Semantic (darkened for light-bg contrast)

```
--gold        : #9e6e10   (darkened from #d9a030 — ensures legibility on white)
--gold-dim    : rgba(158, 110, 16, 0.12)

--success     : #1a8a4e
--error       : #c03030
```

---

## Glass Recipe — Light Variant

Same restriction applies: only on elements floating over photographic backgrounds.

```css
background         : rgba(242, 247, 252, 0.82);
border             : 1px solid var(--border);
backdrop-filter    : blur(24px);
-webkit-backdrop-filter: blur(24px);
```

---

## Rules Unchanged

All do/don't rules from the main design system apply equally to the light theme. The surface values flip but the system is identical.
