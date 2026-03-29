# Sub-Page Template

Used for all future drill-down pages: Teacher's classes list, student progress, admin analytics, etc.

---

## Layout

```
┌──────────────────────────────────────────────────┐  60px
│  SEAFARER    [nav links]                 [avatar]│  NavBar
├──────────────────────────────────────────────────┤  72px
│  Dashboard > My Classes          [+ Add Class]   │  Page header
├──────────────────────────────────────────────────┤
│                                                  │
│  [Page content — varies by page type]            │  flex-1, scroll-y
│                                                  │
└──────────────────────────────────────────────────┘
```

## Page Header

```
height        : 72px
padding       : 0 40px
border-bottom : 1px solid --border
display       : flex-row, align-center, justify-space-between
flex-shrink   : 0

Left side:
  Breadcrumb  : text-sm, --text-3  e.g. "Dashboard /"
  Page title  : text-xl, weight 700, --text  (e.g. "My Classes")
  layout      : flex-column or flex-row with separator

Right side:
  Primary action button (if applicable)
```

## Content Area

```
flex          : 1
overflow-y    : auto
padding       : 32px 40px
```

## Common Content Patterns

| Page Type | Layout |
|---|---|
| List / table | Full-width rows, 1 column |
| Card grid | 3–4 column responsive grid |
| Detail / profile | 2-column: main content + sidebar panel |
| Analytics | Stat cards row + chart area |

## Stat Cards (for analytics/progress pages)

```
layout        : flex-row, gap 12px  (row of 3–4 cards)

Each card:
  background  : --surface-1
  border      : 1px solid --border
  border-radius: --radius-md
  padding     : 20px 24px
  flex        : 1

  Label       : text-xs, weight 500, letter-spacing 0.08em, --text-3, uppercase
  Value       : text-xl, weight 700, --text, --font-mono
  Delta/sub   : text-sm, --text-2
```
