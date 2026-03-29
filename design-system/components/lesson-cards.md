# Lesson Cards

Compact row-style cards used in the lessons grid. Information density over decoration.

## Anatomy

```
┌────┬───────────────────────────────┬──────┐
│ 01 │  Helm Control Basics          │  ✓   │
│    │  45 min                       │      │
└────┴───────────────────────────────┴──────┘
```

## Spec

```
background    : --surface-1
border        : 1px solid --border
border-radius : --radius-md  (10px)
padding       : 14px 16px
layout        : flex-row, align-center, gap 12px
cursor        : pointer

hover:
  background  : --surface-2
  border-color: --border-hover

transition    : background, border-color at --duration-default
animation     : fadeUp, staggered delay (index × 0.04s, max 0.28s)
```

## Elements

**Lesson number:**
```
font-family   : --font-mono
font-size     : 11px
color         : --accent
opacity       : 0.65
letter-spacing: 0.02em
flex-shrink   : 0
```

**Title:**
```
font-family   : --font-ui
font-size     : 13px
font-weight   : 500
color         : --text
line-height   : 1.3
white-space   : nowrap
overflow      : hidden
text-overflow : ellipsis
```

**Duration:**
```
font-family   : --font-mono
font-size     : 11px
color         : --text-3
```

**Complete checkmark:**
```
size          : 14×14
stroke        : --success
flex-shrink   : 0
```

**Locked state:**
```
opacity       : 0.38  (whole card)
cursor        : default
pointer-events: none
lock icon     : 13×13, --text-3
```
