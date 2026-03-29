# Navigation Bar

Used on content pages (Lessons, and all future sub-pages). Not present on dashboard or login.

## Spec

```
height        : 60px
padding       : 0 40px
background    : --surface-1  (solid — no glassmorphism)
border-bottom : 1px solid --border
z-index       : 50
flex-shrink   : 0
layout        : flex-row, align-center, justify-space-between
```

## Wordmark

```
font-family   : --font-brand  (Orbitron)
font-size     : 13px  (--text-brand)
font-weight   : 700
letter-spacing: 0.18em
color         : --text
cursor        : pointer  (navigates to role dashboard)
user-select   : none
```

## Nav Links

```
font-family   : --font-ui
font-size     : 14px
font-weight   : 500
padding       : 6px 16px
border-radius : --radius-sm
border        : none
background    : none
cursor        : pointer

default       : color --text-2
hover         : color --text, background rgba(255,255,255,0.04)
active/current: color --text, background --surface-2
transition    : color, background at --duration-fast
```

## Avatar

```
width         : 34px
height        : 34px
border-radius : --radius-full
border        : 1px solid --border
display       : flex, align-center, justify-center
color         : --text-3
cursor        : pointer

hover         : border-color --accent-rim, color --accent
transition    : border-color, color at --duration-fast
```

## Responsive

On narrow viewports (< 900px), collapse nav links into a hamburger. Not yet implemented — stub for future.
