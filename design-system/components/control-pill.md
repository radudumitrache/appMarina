# Control Pill

The floating control bar on dashboard pages. Contains Settings and Logout ghost buttons.

## Placement

- **Student dashboard:** top-right corner (`top: 28px; right: 28px`)
- **Teacher dashboard:** top-left corner (`top: 28px; left: 28px`)
- **Admin dashboard:** top-left corner (`top: 28px; left: 28px`)

## Spec

```
display       : flex, flex-row, align-center
gap           : 4px
padding       : 6px
background    : rgba(11, 18, 32, 0.72)   ← glass allowed here (floats over photo)
border        : 1px solid --border
border-radius : --radius-md
backdrop-filter: blur(24px)
-webkit-backdrop-filter: blur(24px)
animation     : fadeIn, --duration-page
```

## Buttons Inside

Uses the **Ghost** button spec (see [buttons.md](buttons.md)):

```
Settings button:
  icon + label  : Settings
  hover         : color --text

Logout button:
  icon + label  : Log out
  hover         : color --error  (Danger Ghost)
```

## Notes

- Keep the pill compact — don't add more than 2–3 actions here.
- Future additions (notifications, help) should follow the same Ghost button pattern.
