# Sidebar

Used on the Lessons page and any future content pages with category navigation.

## Spec

```
width         : 220px
flex-shrink   : 0
background    : --surface-1  (solid — no blur)
border-right  : 1px solid --border
padding       : 28px 12px
overflow-y    : auto
display       : flex-column, gap 24px
```

## Category Nav Items

```
layout        : flex-row, align-center, justify-space-between
padding       : 9px 12px
border-radius : --radius-sm
border        : none
background    : none
cursor        : pointer
width         : 100%

label:
  font-family : --font-ui
  font-size   : 13px  (--text-sm)
  font-weight : 500
  color       : --text-2

count:
  font-family : --font-mono
  font-size   : 11px  (--text-xs)
  color       : --text-3

hover:
  background  : rgba(255,255,255,0.04)
  label color : --text

active:
  background  : --accent-dim
  label color : --accent

transition    : background, color at --duration-fast
```

## Progress Section

Pinned to the bottom of the sidebar via `margin-top: auto`.

```
layout        : flex-column, gap 7px

Bar:
  height      : 2px
  background  : rgba(255,255,255,0.07)
  fill        : --success
  border-radius: --radius-full
  transition  : width 0.6s --ease-default

Label:
  font-size   : 11px  (--text-xs)
  color       : --text-3
  font-family : --font-ui
  content     : "{n} of {total} complete"
```
