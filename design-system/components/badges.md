# Badges & Tags

## Role Badges

Displayed top-right on all dashboard pages to indicate the current user's role.

```
padding       : 4px 10px
border-radius : --radius-sm
font-family   : --font-ui
font-size     : 11px  (--text-xs)
font-weight   : 500
letter-spacing: 0.08em
text-transform: uppercase
animation     : fadeIn, --duration-page
```

| Role | Background | Border | Text Color |
|---|---|---|---|
| Student | `--accent-dim` | `--accent-rim` | `--accent` |
| Teacher | `--gold-dim` | `rgba(217,160,48,0.25)` | `--gold` |
| Admin | `rgba(224,82,82,0.10)` | `rgba(224,82,82,0.25)` | `--error` |

## Status Tags

For lesson status, assignment state, etc.

```
Same base spec as Role Badge.
```

| Status | Background | Text |
|---|---|---|
| Complete | `rgba(46,199,122,0.10)` | `--success` |
| Locked | `--gold-dim` | `--gold` |
| In Progress | `--accent-dim` | `--accent` |
| Not Started | `rgba(255,255,255,0.04)` | `--text-3` |
