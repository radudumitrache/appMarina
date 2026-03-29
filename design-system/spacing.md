# Spacing System

All spacing is based on a **4px unit**. Use multiples only — never arbitrary values.

## Spacing Tokens

```css
--space-1  :  4px
--space-2  :  8px
--space-3  : 12px
--space-4  : 16px
--space-5  : 20px
--space-6  : 24px
--space-8  : 32px
--space-10 : 40px
--space-12 : 48px
--space-16 : 64px
--space-20 : 80px
```

---

## Component Internal Padding

| Context | Padding |
|---|---|
| Compact — badges, chips, nav pills | `4px 10px` |
| Default — buttons, inputs | `12px 20px` |
| Comfortable — cards | `20px 24px` |
| Spacious — page sections, panels | `32px 40px` |

---

## Layout Gutters

| Context | Value |
|---|---|
| Between cards in a grid | `12px` |
| Between major page sections | `32px` |
| Page horizontal padding (desktop) | `40px` |
| Page horizontal padding (narrow) | `20px` |
| Sidebar width | `220px` |
| Navbar height | `60px` |

---

## Vertical Rhythm

- Inline elements (labels + inputs in a form): `gap: 12px`
- Between form groups: `gap: 20px`
- Section headers to content: `margin-bottom: 20px`
- Card grid rows: `gap: 12px`
