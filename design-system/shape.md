# Shape & Border Radius

## Radius Scale

```css
--radius-sm  :  6px     chips, tags, small buttons, nav pills
--radius-md  : 10px     cards, panels, modals, inputs
--radius-lg  : 14px     large cards, dashboard nav tiles
--radius-full: 9999px   avatar circles, progress dots only
```

---

## Usage Rules

| Element | Radius |
|---|---|
| Dashboard nav tiles | `--radius-lg` (14px) |
| Cards, panels | `--radius-md` (10px) |
| Inputs, default buttons | `--radius-md` (10px) |
| Sidebar nav items, nav link pills | `--radius-sm` (6px) |
| Ghost button, small controls | `--radius-sm` (6px) |
| Badges, tags | `--radius-sm` (6px) |
| Avatar, progress dots | `--radius-full` |

---

## Hard Limits

- **Maximum radius in use: 14px.** Above this, elements look like a mobile consumer app — not a professional training platform.
- **Never mix** very sharp (0–2px) and very round (20px+) elements on the same surface.
- **No pill-shaped buttons** (`border-radius: 9999px`) except for avatars and progress dots.
