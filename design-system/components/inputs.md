# Inputs

## Text Input (default)

```
background    : --surface-3
border        : 1px solid --border
border-radius : --radius-md
padding       : 14px 18px
font          : --font-ui, 15px, weight 400
color         : --text
placeholder   : --text-3
outline       : none  (border replaces outline)

focus         : border-color --accent-rim
                background --surface-3  (unchanged)
error         : border-color --error
disabled      : opacity 0.45, cursor not-allowed
```

## Role Selector (segmented control)

Used on Login to pick Student / Teacher / Admin.

```
Container:
  background    : rgba(255,255,255,0.04)
  border        : 1px solid --border
  border-radius : --radius-md
  padding       : 4px
  gap           : 4px

Each option:
  flex: 1
  padding       : 8px
  border-radius : --radius-sm
  font          : --font-ui, 13px, weight 500
  color         : --text-3
  background    : none
  border        : none
  cursor        : pointer
  hover         : color --text

Active option:
  background    : --accent-dim
  color         : --accent
```

## Validation Error

Display below the relevant input, not in a toast.

```
font          : --font-ui, text-xs, weight 400
color         : --error
margin-top    : 4px
```
