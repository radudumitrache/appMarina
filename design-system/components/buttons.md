# Buttons

Three variants. Use the simplest one that accomplishes the task.

---

## Primary

For the **one most important action** per view (e.g. Sign In). Maximum one per screen region.

```
background    : --accent
color         : --bg  (never white)
padding       : 12px 24px
border-radius : --radius-md
font          : --font-ui, 15px, weight 600
border        : none
hover         : background --accent-hover
active        : transform scale(0.98)
transition    : background --duration-fast, transform --duration-fast
```

---

## Secondary

For supporting actions that share priority with other elements.

```
background    : transparent
border        : 1px solid --border
color         : --text
padding       : 12px 24px
border-radius : --radius-md
font          : --font-ui, 15px, weight 500
hover         : background --surface-2, border-color --border-hover
transition    : background, border-color at --duration-fast
```

---

## Ghost

For tertiary actions — settings, navigation, controls. No border.

```
background    : transparent
border        : none
color         : --text-2
padding       : 8px 14px
border-radius : --radius-sm
font          : --font-ui, 13px, weight 500
hover         : background rgba(255,255,255,0.05), color --text
transition    : background, color at --duration-fast
```

---

## Danger Ghost

Identical to Ghost but hover state uses error color. For destructive actions only (logout, delete).

```
Same as Ghost
hover color   : --error
```

---

## Size Modifiers

| Size | Padding | Font Size | Use |
|---|---|---|---|
| sm | `6px 14px` | 13px | Inline actions, compact UI |
| md *(default)* | `12px 24px` | 15px | Standard forms, cards |
| lg | `14px 28px` | 16px | Hero / page-level primary CTA |

---

## Icon Buttons

When a button contains only an icon (no label), use equal padding:

```
padding       : 8px
border-radius : --radius-sm
color         : --text-3
hover         : color --text, background rgba(255,255,255,0.05)
```
