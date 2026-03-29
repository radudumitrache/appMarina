# Progress Bars

## Sizes

| Variant | Height | Use Case |
|---|---|---|
| Minimal | 2px | Sidebar progress, subtle inline use |
| Prominent | 4px | Card progress, assignment completion |

## Spec

```
background    : rgba(255,255,255,0.07)
border-radius : --radius-full
overflow      : hidden

Fill:
  height      : 100%
  border-radius: --radius-full
  transition  : width 0.6s --ease-default

  Progress    : --accent   (ongoing / in-progress)
  Complete    : --success  (100% done)
```

## Usage Notes

- Always pair a progress bar with a text label: `"5 of 12 complete"` — don't rely on the bar alone.
- Use `--font-mono` for the numeric part of the label: `5 of 12`.
- Animate width on mount with a short delay (`transition-delay: 0.2s`) so the user sees the fill happen.
