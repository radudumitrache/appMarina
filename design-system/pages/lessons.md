# Lessons Page

**Route:** `/student/lessons`
**File:** `src/pages/student/Lessons.jsx`

---

## Layout

Fixed full-height, no root scroll. Three regions: navbar, sidebar, main content.

```
┌──────────────────────────────────────────────────┐  60px
│  SEAFARER    [Lessons]  [Dashboard]      [avatar]│  NavBar
├────────────┬─────────────────────────────────────┤
│            │  All Modules            12 lessons   │
│ All Modules│                                      │
│ Navigation │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐│
│ Emergency  │  │  01  │ │  02  │ │  03  │ │  04  ││
│ Engine Room│  └──────┘ └──────┘ └──────┘ └──────┘│
│ Cargo      │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐│
│ Comms      │  │  05  │ │  06  │ │  07  │ │  08  ││
│            │  └──────┘ └──────┘ └──────┘ └──────┘│
│            │                                      │
│ ─────────  │                                      │
│ 5 of 12 ✓  │                                      │
└────────────┴─────────────────────────────────────┘
  220px           flex-1, overflow-y scroll
```

## Regions

### Page root
```
width, height : 100vw × 100vh
overflow      : hidden
background    : --bg
```

### Layout wrapper
```
display       : flex-column
height        : 100%
```

### Body (below navbar)
```
display       : flex-row
flex          : 1
overflow      : hidden
```

### Sidebar
See [sidebar.md](../components/sidebar.md)

### Main content
```
flex          : 1
display       : flex-column
overflow      : hidden
padding       : 28px 40px
gap           : 20px
animation     : fadeUp, --duration-enter, delay 0.05s
```

### Content header
```
display       : flex-row, align-baseline, gap 12px
flex-shrink   : 0

Title:
  font-size   : 22px  (--text-lg)
  font-weight : 600
  color       : --text

Count:
  font-size   : 13px  (--text-sm)
  color       : --text-3
  font-family : --font-mono
```

### Lesson grid
```
display               : grid
grid-template-columns : repeat(4, 1fr)
gap                   : 12px
overflow-y            : auto
align-content         : start
padding-right         : 4px  (scrollbar clearance)
```

See [lesson-cards.md](../components/lesson-cards.md) for card spec.

## Data

12 lessons across 5 categories. Categories filter the grid client-side. Locked lessons (`locked: true`) rendered at 0.38 opacity with no pointer events.
