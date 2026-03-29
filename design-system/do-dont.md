# Do / Don't

Hard rules. These are not suggestions.

---

## Do

- **Use negative space liberally.** Breathing room signals quality and reduces cognitive load.
- **Keep the accent color rare and meaningful.** When everything is teal, nothing is.
- **Use `--font-mono` for all numbers, timestamps, and data values.**
- **Animate entrance, not idle.** A smooth entry communicates "this appeared for a reason." Looping animations say "look at me."
- **Use role-color coding as a wayfinding system.** Teal = student, gold = teacher, red = admin — consistently, everywhere.
- **Let background images do atmospheric work.** Keep UI elements flat and clean on top of them.
- **Default to solid surface fills** (`--surface-1`, `--surface-2`) on flat pages.
- **Group related actions** — don't scatter buttons across the screen.

---

## Don't

- **Don't use `box-shadow` glow on cards or buttons as a hover effect.** It reads as a game UI. Use border-color + background-color transition instead.
- **Don't use Orbitron for anything except the `SEAFARER` wordmark.** Not for headings, stats, lesson numbers, or labels.
- **Don't stack teal and gold in the same component.** Pick one.
- **Don't use `backdrop-filter: blur` on flat-page surfaces.** Sidebar, lesson cards, and content areas are not glass — they use solid fills.
- **Don't animate scroll-triggered content.** IntersectionObserver-triggered fadeUps create jank and aren't needed at this scale.
- **Don't use `border-radius` above 14px** on anything except avatars. It makes the platform look like a mobile consumer app.
- **Don't add `text-shadow` or glow to UI text.** Ever.
- **Don't use semi-transparent white (`rgba(255,255,255,X)`) for text.** Use the defined `--text-2`, `--text-3` tokens — they're calibrated.
- **Don't put teal text on a teal tinted background** without confirming 4.5:1 contrast ratio.
- **Don't use `opacity` to communicate disabled state below 0.35** — below that the element becomes unreadable for users with visual impairments.
- **Don't introduce a new font.** The stack (Orbitron / Plus Jakarta Sans / IBM Plex Mono) is complete.
- **Don't use `!important`.** If you need it, the specificity structure is wrong.
