# Grid & Layout

## Dashboard Nav Grid

Used on Student, Teacher, and Admin dashboard pages.

```css
display               : grid
grid-template-columns : repeat(3, 200px)
gap                   : 12px
```

**5-tile layout (3+2):**
- Row 1: items 1–3 fill all three columns
- Row 2: items 4–5, centered under row 1

```css
/* Center the second row under the first */
.dash-nav {
  display        : grid;
  grid-template-columns: repeat(3, 200px);
  gap            : 12px;
  justify-content: center;
}
.dash-nav > :nth-child(4) { grid-column: 1; }
.dash-nav > :nth-child(5) { grid-column: 2; }
```

---

## Lesson / Content Grid

Used in the lessons main area and any future content grids.

| Viewport | Columns | Gap |
|---|---|---|
| ≥ 1200px | 4 columns | 12px |
| 900–1199px | 3 columns | 12px |
| < 900px | 2 columns | 10px |

```css
.lessons-list {
  display              : grid;
  grid-template-columns: repeat(4, 1fr);
  gap                  : 12px;
  align-content        : start;
}
```

---

## Page Layout Structure

### Full-screen centered (Dashboard pages)
```
<div class="page">               100vw × 100vh, overflow hidden
  <img class="page-bg" />        absolute, cover, opacity 0.22
  <div class="page-overlay" />   absolute, gradient
  <div class="page-controls" />  absolute, top-left
  <div class="page-badge" />     absolute, top-right
  <div class="page-nav" />       relative z-10, center of screen
</div>
```

### Sidebar layout (Lessons, future sub-pages)
```
<div class="page">               100vw × 100vh, overflow hidden
  <NavBar />                     60px height, flex-shrink 0
  <div class="page-body">        flex-row, flex 1, overflow hidden
    <aside class="sidebar" />    220px, flex-shrink 0, scroll-y
    <main class="content" />     flex 1, scroll-y, padding 28px 40px
  </div>
</div>
```

---

## Spacing Reference

```
Navbar height          : 60px
Sidebar width          : 220px
Page horizontal padding: 40px (desktop)
Card grid gap          : 12px
Section gap            : 32px
```
