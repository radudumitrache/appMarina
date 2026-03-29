# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Commands

```bash
npm run dev       # Start Vite dev server
npm run build     # Production build
npm run preview   # Preview the production build locally
```

No test runner is configured.

---

## Architecture

**Stack:** React 18 + React Router v6 + Vite. No external UI library — all styling is custom CSS with CSS variables. No global state manager; auth state lives in `AuthContext`.

### Routing & Role Separation

Routes are split by role. Every role has its own directory under `src/pages/`:

```
src/
  App.jsx                   # BrowserRouter + AuthProvider + all routes
  auth/
    AuthContext.jsx          # login(username, role) / logout() — mock, no persistence
  pages/
    Login.jsx
    css/
      Login.css
      student/
        Dashboard.css
        Lessons.css
      teacher/
        Dashboard.css
      admin/
        Dashboard.css
    student/
      Dashboard.jsx
      Lessons.jsx
    teacher/
      Dashboard.jsx
    admin/
      Dashboard.jsx
  components/
    shared/
      NavBar.jsx             # Shared across roles — top bar for sidebar-layout pages
    student/
      lessons/
        LessonCard.jsx
    teacher/                 # Role-specific components go here
    admin/                   # Role-specific components go here
    css/
      shared/
        NavBar.css
      student/
        lessons/
          LessonCard.css
      teacher/
      admin/
```

Route pattern: `/<role>/<page>` — e.g. `/student/dashboard`, `/teacher/dashboard`.

### File Organisation Rules

| Rule | Detail |
|------|--------|
| **Page JSX** | `src/pages/<role>/<PageName>.jsx` |
| **Page CSS** | `src/pages/css/<role>/<PageName>.css` — never co-locate CSS with JSX in pages |
| **Role component** | `src/components/<role>/<page_folder>/<ComponentName>.jsx` |
| **Role component CSS** | `src/components/css/<role>/<page_folder>/<ComponentName>.css` |
| **Shared component** | `src/components/shared/<ComponentName>.jsx` |
| **Shared component CSS** | `src/components/css/shared/<ComponentName>.css` |

When adding a new page:
1. Add `<PageName>.jsx` under `src/pages/<role>/`
2. Add `<PageName>.css` under `src/pages/css/<role>/`
3. Register the route in `App.jsx`

When adding a new component:
1. Determine if it is role-specific or shared
2. Place JSX under `src/components/<role>/<page>/` or `src/components/shared/`
3. Place its CSS under the matching path in `src/components/css/`

Never share page-level components across roles — if two roles need similar UI, extract a shared component to `src/components/shared/`.

### Public Assets

`vite.config.js` sets `publicDir: 'assets'`. Files in `/assets/` are served from the root at runtime. Reference them as `/dashboard background screen.png`, `/login background .mp4`, etc. (no `assets/` prefix in URLs).

---

## Design System — Source of Truth

The `design-system/` folder is the **authoritative spec**. Read the relevant files before writing any UI code. The `src/index.css` currently has outdated variable names — the design-system files take precedence.

### Brandbook rules (non-negotiable)

| Rule | Detail |
|------|--------|
| **Orbitron font** | Wordmark (`SEAFARER`) only — never use for UI text |
| **UI font** | `Plus Jakarta Sans` for all interface text |
| **Mono font** | `IBM Plex Mono` for all numbers, data, timestamps |
| **Role accent colors** | Student → teal (`--accent`), Teacher → gold (`--gold`), Admin → red (`--error`) |
| **Border radius** | Max `14px` (`--radius-lg`). No pill-shaped buttons |
| **No glow** | No `box-shadow` glow on cards or buttons |
| **Glassmorphism** | Only on elements floating over photographic/video backgrounds (login card, control pill over dashboard image). Never on flat pages |
| **Icons** | Lucide subset, line-only, `currentColor`. No filled icons |
| **Stagger animation** | Delay = `Math.min(index, 6) * 0.04s` — cap at 0.28s |
| **Hex values** | Never hardcode hex in components — use CSS variables from `design-system/colors.md` |

### Key design-system files

- `design-system/colors.md` — all CSS variable tokens
- `design-system/typography.md` — font rules
- `design-system/spacing.md` — 4px unit system
- `design-system/motion.md` — duration tokens, stagger pattern
- `design-system/do-dont.md` — hard constraints
- `design-system/components/` — per-component specs (buttons, inputs, nav-tiles, etc.)
- `design-system/pages/` — full-page layout specs
- `design-system/migration.md` — old → new variable mapping

---

## Role-Based UI Conventions

Each role has its own dashboard with role-specific navigation tiles and accent color treatment:

- **Student** — teal accent, tiles: Lessons, Tests, My Progress, My Class, Support
- **Teacher** — gold accent, different tile set
- **Admin** — red accent, different tile set

When building components that appear in multiple role contexts, accept a `role` prop and apply the corresponding CSS variable class or data attribute rather than duplicating the component.

---

## Layout Patterns

**Login page:** Full-screen video background → glass card centered.

**Dashboard:** Full-screen background image (0.22–0.25 opacity) → control pill (glass) top-left → centered nav-tile grid (3+2 layout, `200×160px` tiles, `12px` gap).

**Sidebar pages (e.g. Lessons):** `NavBar` (60px) → `.page-body` flex row → `aside.sidebar` (220px fixed) + `main.content` (flex 1, `28px 40px` padding).

---

## Known Implementation Gap

`src/index.css` CSS variables and the Google Fonts import in `index.html` do not yet match the design-system specification. When touching styles, migrate the variables you use to the correct names from `design-system/colors.md` and `design-system/migration.md`. Do not introduce new code using the old variable names.
