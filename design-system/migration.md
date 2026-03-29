# Migration — v1 → v2

Maps every current CSS variable and pattern to its new equivalent.

## CSS Variables

| Current (v1) | New (v2) | Token | Reason |
|---|---|---|---|
| `#08090f` | `#060b14` | `--bg` | Slightly richer blue-dark; less neutral-gray |
| `rgba(255,255,255,0.04)` surface | `#0b1220` | `--surface-1` | Solid color — consistent on all backgrounds |
| `rgba(255,255,255,0.08)` border | `#253550` | `--border` | Solid — no variance across surface contexts |
| `#2de8d0` accent | `#0bbda4` | `--accent` | Less neon, more refined — same teal family |
| `rgba(45,232,208,0.07)` hover bg | `rgba(11,189,164,0.12)` | `--accent-dim` | Matched to new accent hue |
| `rgba(45,232,208,0.3)` hover border | `rgba(11,189,164,0.22)` | `--accent-rim` | Reduced opacity — more restrained |
| `#c8a450` gold | `#d9a030` | `--gold` | Warmer, less washed; used only for teacher/locked |
| `#d8e8f0` text | `#e4edf6` | `--text` | Slightly cooler white, better with new base |
| `rgba(216,232,240,0.38)` muted | `#9db0c5` | `--text-2` | Solid value for consistency |
| — | `#6b83a0` | `--text-3` | New placeholder/disabled tier |
| — | `#3a4f6a` | `--border-hover` | New hover border tier |

---

## Typography

| Current (v1) | New (v2) | Reason |
|---|---|---|
| `DM Sans` | `Plus Jakarta Sans` | Better weight range, more institutional |
| `Orbitron` everywhere | `Orbitron` wordmark only | Reduces cognitive noise, improves legibility |
| — | `IBM Plex Mono` | New mono tier for data/numbers |

---

## Surfaces

| Current (v1) | New (v2) | Reason |
|---|---|---|
| `rgba(8,9,15,0.55)` control pill | `rgba(11,18,32,0.72)` | Matched to new bg, slightly more opaque |
| `rgba(8,9,15,0.58)` card bg | `--surface-1` solid | Flat pages use solid fills, not glass |
| Glassmorphism on lesson cards | Solid `--surface-1` | Glass is reserved for photographic-bg contexts |

---

## Files to Update

1. `src/index.css` — replace all `:root` variables
2. `src/pages/Login.css` — update color references, font
3. `src/pages/student/Dashboard.css` — update variables
4. `src/pages/teacher/Dashboard.css` — update variables
5. `src/pages/admin/Dashboard.css` — update variables
6. `src/pages/student/Lessons.css` — update variables, remove glass from cards
7. `src/components/NavBar.css` — update variables, font
8. `index.html` — add new Google Fonts import (Plus Jakarta Sans, IBM Plex Mono)

---

## Google Fonts Import (replace existing)

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Orbitron:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```
