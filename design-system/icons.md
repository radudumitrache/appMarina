# Iconography

## Style

**Line icons only.** No filled icons.

| Property | Value |
|---|---|
| Stroke weight | `1.4px` default |
| Stroke weight (small, <16px) | `1.5px` |
| Stroke linecap | `round` |
| Stroke linejoin | `round` |
| Fill | `none` |
| Color | `currentColor` — always, never hardcoded |

---

## Size Scale

| Token | Size | Use Case |
|---|---|---|
| sm | 14×14 | Inline text, badges |
| md | 16×16 | Navbar, form inputs |
| lg | 20×20 | Card metadata, secondary actions |
| xl | 28×28 | Dashboard nav tiles |
| 2xl | 36×36 | Empty states, hero moments |

---

## Library

**Lucide Icons** — inline SVG subset (as currently implemented).

Lucide is chosen for its consistent stroke weights, rounded endpoints, and clean geometry. Do not mix icons from other libraries (Heroicons, Feather, etc.) — they have subtly different stroke weights and proportions that create visual inconsistency.

---

## Rules

- Color is always set on the parent element (`color: var(--accent)`), not on the SVG itself.
- Icons in dashboard tiles: `--accent`, `opacity: 0.8` default → `opacity: 1` on parent hover.
- Icons in nav/control buttons: `--text-3` default → `--text` on hover.
- Never scale icons with `transform: scale()` — use the correct size token from the start.
