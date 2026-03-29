# Dashboard Pages

**Routes:** `/student/dashboard`, `/teacher/dashboard`, `/admin/dashboard`
**Files:** `src/pages/student/Dashboard.jsx`, `src/pages/teacher/Dashboard.jsx`, `src/pages/admin/Dashboard.jsx`

---

## Layout

Full-screen centered. No navbar. No sidebar. Pure navigation interface.

```
┌──────────────────────────────────────────────────┐
│ [Control pill]               [Role badge]        │  ← absolute positioned
│                                                  │
│                                                  │
│              ┌──────┐ ┌──────┐ ┌──────┐         │
│              │  T1  │ │  T2  │ │  T3  │         │
│              └──────┘ └──────┘ └──────┘         │
│                  ┌──────┐ ┌──────┐              │
│                  │  T4  │ │  T5  │              │
│                  └──────┘ └──────┘              │
│                                                  │
│ [Bridge background image, opacity 0.22]          │
└──────────────────────────────────────────────────┘
```

## Background

```
<img>:
  position      : absolute, inset 0
  object-fit    : cover
  object-position: center top
  opacity       : 0.22

Overlay:
  position      : absolute, inset 0
  background    : linear-gradient(180deg,
                    rgba(6,11,20,0.5)  0%,
                    rgba(6,11,20,0.2) 50%,
                    rgba(6,11,20,0.7) 100%)
```

## Nav Tile Grid

Centered on screen, `position: relative, z-index: 10`. See [grid.md](../grid.md) and [nav-tiles.md](../components/nav-tiles.md).

## Role Differences

| Role | Badge | Control pill position | Actions |
|---|---|---|---|
| Student | Teal "Student" | Top-right | Lessons, Tests, My Progress, My Class, Support |
| Teacher | Gold "Instructor" | Top-left | My Classes, Course Builder, Student Progress, Assignments, Support |
| Admin | Red "Admin" | Top-left | Users, Courses, Analytics, System Settings, Support |

## Navigation

Each tile navigates to its respective sub-page. All current paths under `/student/`, `/teacher/`, `/admin/`.
