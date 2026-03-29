# Typography

## Font Stack

| Role | Family | Source | Usage |
|---|---|---|---|
| **Brand mark** | Orbitron | Google Fonts | Wordmark `SEAFARER` only — nothing else |
| **UI / Body** | Plus Jakarta Sans | Google Fonts | All interface text, labels, buttons, inputs |
| **Data / Mono** | IBM Plex Mono | Google Fonts | Lesson numbers, codes, stats, timestamps |

```css
--font-brand : 'Orbitron', monospace;
--font-ui    : 'Plus Jakarta Sans', sans-serif;
--font-mono  : 'IBM Plex Mono', monospace;
```

> **Why Plus Jakarta Sans?**
> Modern without being sterile (better than Inter for an educational context). Excellent weight range, slightly humanist forms that read as institutional and professional. Variable axis makes it flexible for tight UI spaces.

> **Why Orbitron only for the wordmark?**
> Overusing display fonts creates cognitive noise. Orbitron at small sizes is illegible and carries a "sci-fi" tone that conflicts with our educational credibility goal. Reserve it for the single brand moment.

---

## Type Scale

```
--text-xs      11px / line-height 1.4   timestamps, badges, footnotes
--text-sm      13px / line-height 1.5   captions, labels, sidebar items
--text-base    15px / line-height 1.6   body, form inputs, table cells
--text-md      17px / line-height 1.5   subheadings, card titles
--text-lg      22px / line-height 1.3   page section titles
--text-xl      28px / line-height 1.2   page titles (h1 equivalent)
--text-2xl     36px / line-height 1.1   hero / login brand only
--text-brand   14px / line-height 1.0   Orbitron wordmark in navbar
--text-brand-lg 32px / line-height 1.0  Orbitron wordmark in login
```

---

## Weight Usage

```
400 Regular    body text, descriptions, captions
500 Medium     labels, nav links, button text, table headers
600 SemiBold   card titles, form labels, active states
700 Bold       page titles, section headings
800 ExtraBold  brand mark wordmark only
```

---

## Letter Spacing Rules

```
Standard text        -0.01em
All-caps labels/tags  0.08em
Wordmark (Orbitron)   0.18em
Mono / numbers        0.02em
```

---

## Hierarchy in Practice

| Level | Size | Weight | Color |
|---|---|---|---|
| Page Title | text-xl | 700 | --text |
| Section Header | text-lg | 600 | --text |
| Card Title | text-md | 600 | --text |
| Body | text-base | 400 | --text |
| Caption / Meta | text-sm | 400 | --text-2 |
| Footnote / Tag | text-xs | 500 | --text-3 |

---

## Rules

- Never use Orbitron for anything except the `SEAFARER` wordmark.
- Never add `text-shadow` or glow effects to UI text.
- Never use semi-transparent white text — use the defined `--text-2`, `--text-3` tokens.
- Use `--font-mono` for all numbers, timestamps, and data values — not Plus Jakarta Sans.
