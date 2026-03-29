# Login Page

**Route:** `/`
**File:** `src/pages/Login.jsx`

---

## Layout

Full-screen split — video background on the right, form panel on the left.

```
┌──────────────────────────────────────────────────┐
│  [Form panel 480px]   │  [Video background]      │
│                       │                          │
│  SEAFARER             │  <video autoplay loop>   │
│  Maritime VR Training │   opacity 0.55           │
│                       │                          │
│  [Role selector]      │                          │
│  [Username input]     │                          │
│  [Password input]     │                          │
│  [Sign in button]     │                          │
│                       │                          │
└──────────────────────────────────────────────────┘
```

## Background & Overlay

```
<video>:
  position    : absolute, inset 0
  object-fit  : cover
  opacity     : 0.55

Overlay (gradient):
  position    : absolute, inset 0
  background  : linear-gradient(to left,
                  transparent 0%,
                  transparent 30%,
                  rgba(6,11,20,0.6) 55%,
                  rgba(6,11,20,0.92) 75%,
                  rgba(6,11,20,0.98) 100%)
```

## Form Panel

The card sits inside the naturally dark-gradient left edge — no glass needed.

```
width         : 480px
height        : 100%
padding       : 0 64px
display       : flex-column, justify-center, gap 40px
position      : relative, z-index 10
animation     : fadeUp, 600ms, --ease-default
```

## Elements (top to bottom)

1. **Brand block** — Orbitron wordmark `SEAFARER` (32px) + tagline "Maritime VR Training" (--text-2)
2. **Role selector** — segmented control, see [inputs.md](inputs.md)
3. **Username input**
4. **Password input**
5. **Error message** (conditionally rendered)
6. **Sign In button** — Primary variant, full width

## Transition

On successful login, a full-screen video overlay fades in and plays the bridge transition:

```
<div class="login-transition">
  position    : fixed, inset 0, z-index 100
  background  : --bg
  animation   : fadeIn, 0.2s

  <video>:
    width/height: 100%
    object-fit  : cover
    playbackRate: 2.5 (set on loadedmetadata)
    onEnded     : navigate to role dashboard
```
