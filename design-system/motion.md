# Motion & Animation

## Principles

- **Purposeful** — every animation communicates something: loading, state change, hierarchy reveal.
- **Subtle** — interaction durations under 300ms. Never loop decorative animations.
- **Consistent** — one easing for entries, one for exits. Don't invent new curves per component.

---

## Duration Tokens

```css
--duration-fast    : 120ms   hover states, color/opacity transitions
--duration-default : 220ms   button press, border transitions
--duration-enter   : 380ms   element entrance animations
--duration-exit    : 200ms   element exits, dismissals
--duration-page    : 480ms   full page entry
```

---

## Easing Tokens

```css
--ease-default : cubic-bezier(0.16, 1, 0.3, 1)   all entries — spring-like deceleration
--ease-out     : cubic-bezier(0.0, 0, 0.2, 1)    exits
--ease-linear  : linear                           progress bars only
```

---

## Standard Keyframes

Define these once in `src/index.css`:

```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0);    }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-10px); }
  to   { opacity: 1; transform: translateX(0);     }
}
```

---

## Staggered Entry Pattern

When rendering lists of cards or tiles, stagger their `animation-delay`:

```
Item 1 : delay 0s
Item 2 : delay 0.04s
Item 3 : delay 0.08s
...
Maximum: 0.28s — cap at 7 items worth of delay.
         Don't make items 8–12 wait longer.
```

```jsx
style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
```

---

## Hover State Transitions

Applied via CSS `transition` shorthand on interactive elements:

```css
/* Cards */
transition: background 0.2s var(--ease-default),
            border-color 0.2s var(--ease-default),
            transform 0.2s var(--ease-default);

/* Buttons, links */
transition: background var(--duration-fast),
            color var(--duration-fast);
```

Card hover lift: `transform: translateY(-3px)` — max 4px. Do not exceed.

---

## What NOT to Animate

- Background images and overlays
- Pure decorative shapes
- Text color changes (use transition at `--duration-fast`, not an animation)
- Items that scroll into view via IntersectionObserver — it creates jank
- Looping / idle states — the interface should be still when the user isn't interacting
