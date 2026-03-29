# Surfaces & Elevation

## Elevation Layers

Depth is communicated through **background fill progression**, not box-shadows.

| Layer | Token | Hex | Used For |
|---|---|---|---|
| 0 | `--bg` | `#060b14` | Page background |
| 1 | `--surface-1` | `#0b1220` | Cards, panels, sidebar, navbar |
| 2 | `--surface-2` | `#111b2e` | Hover fill, selected state |
| 3 | `--surface-3` | `#1a2740` | Inputs, code blocks |
| 4 | glass | `--surface-1` + border + blur | Tooltips, popovers, floating controls |

No `box-shadow` for depth. If you feel the urge to add a shadow — add a border instead.

---

## Glassmorphism — Restricted Use

`backdrop-filter: blur` is allowed **only** for UI that floats directly over a photographic background:

| Allowed | Forbidden |
|---|---|
| Login card (floats over video) | Lesson cards |
| Dashboard control pill (over bridge image) | Sidebar |
| Dashboard role badge (over bridge image) | Navbar on lesson/sub pages |
| Overlay tooltips | Any flat-page surface |

```css
/* Approved glass recipe */
.glass {
  background         : rgba(11, 18, 32, 0.72);
  border             : 1px solid var(--border);
  backdrop-filter    : blur(24px);
  -webkit-backdrop-filter: blur(24px);
}
```

---

## Background Images

Bridge photo and other environmental images are atmosphere — not content.

```
opacity          : 0.22 – 0.25  (never above 0.30)
object-fit       : cover
object-position  : center top
overlay gradient : --bg tinted, darker at top + bottom edges
```

---

## Border Rules

| State | Value |
|---|---|
| Default | `1px solid var(--border)` → `#253550` |
| Hover | `1px solid var(--border-hover)` → `#3a4f6a` |
| Focus / Active | `1px solid var(--accent-rim)` → `rgba(11,189,164,0.22)` |

- Never use a fully opaque accent color as a border.
- Never use `rgba(255,255,255,0.08)` as a border — it looks different on every background and is inconsistent. Use the solid `--border` token.
