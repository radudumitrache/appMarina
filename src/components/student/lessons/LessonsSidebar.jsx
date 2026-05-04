import '../../css/student/lessons/LessonsSidebar.css'
import { CATEGORIES } from '../../../pages/student/Lessons'

function getCatStats(lessons, catId) {
  const subset = catId === 'all' ? lessons : lessons.filter(l => l.cat === catId)
  return { total: subset.length, done: subset.filter(l => l.complete).length }
}

export default function LessonsSidebar({ lessons, activeCategory, onCategoryChange }) {
  const overall    = getCatStats(lessons, 'all')
  const overallPct = overall.total > 0 ? (overall.done / overall.total) * 100 : 0

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {CATEGORIES.map((cat) => {
          const stats = getCatStats(lessons, cat.id)
          const pct   = stats.total > 0 ? (stats.done / stats.total) * 100 : 0
          return (
            <button
              key={cat.id}
              className={`sidebar-btn ${activeCategory === cat.id ? 'sidebar-btn--active' : ''}`}
              onClick={() => onCategoryChange(cat.id)}
            >
              <div className="sidebar-btn-row">
                <span className="sidebar-label">{cat.label}</span>
                <span className="sidebar-count">{stats.done}/{stats.total}</span>
              </div>
              <div className="sidebar-chapter-bar">
                <div className="sidebar-chapter-fill" style={{ width: `${pct}%` }} />
              </div>
            </button>
          )
        })}
      </nav>

      <div className="sidebar-stat">
        <div className="sidebar-stat-bar">
          <div className="sidebar-stat-fill" style={{ width: `${overallPct}%` }} />
        </div>
        <span className="sidebar-stat-text">
          <span className="sidebar-stat-num">{overall.done}</span>
          {' '}of{' '}
          <span className="sidebar-stat-num">{overall.total}</span>
          {' '}complete
        </span>
      </div>
    </aside>
  )
}
