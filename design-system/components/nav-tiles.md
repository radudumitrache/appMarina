# Navigation Tiles

The primary navigation UI on all three dashboard pages (Student, Teacher, Admin).

## Anatomy

```
┌──────────────────────┐
│                      │
│        [icon]        │  28×28, --accent, opacity 0.8
│                      │
│        Label         │  text-sm, weight 500, --text-2
│                      │
└──────────────────────┘
  200px × 160px
```

## Spec

```
width         : 200px
height        : 160px
background    : --surface-1
border        : 1px solid --border
border-radius : --radius-lg  (14px)
padding       : 24px
layout        : flex-column, align-center, justify-center, gap 16px
cursor        : pointer

hover:
  background    : --surface-2
  border-color  : --border-hover
  transform     : translateY(-3px)   (max lift: 4px)

active:
  transform     : translateY(-1px)

icon:
  color         : --accent
  opacity       : 0.8 → 1 on parent hover
  transition    : opacity --duration-fast

label:
  font-family   : --font-ui
  font-size     : 14px
  font-weight   : 500
  color         : --text-2 → --text on hover
  letter-spacing: 0.01em

transition    : background, border-color, transform at --duration-default, --ease-default
animation     : fadeUp, --duration-enter, staggered delay
```

## Grid Arrangement

5 tiles in a 3+2 layout. See [grid.md](../grid.md) for the CSS.

## Role Differentiation

The tile appearance is identical across all three roles. Role identity is communicated through:
1. The role badge (top-right corner)
2. The specific set of 5 actions (different per role)
3. The page's overall context

Do not change tile colors per role — that would create inconsistency.
