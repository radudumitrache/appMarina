import '../../../css/admin/lessons/LessonsSidebar.css'

export default function LessonsSidebar({ categories, activeCategory, onCategoryChange, lessons }) {
  const published = lessons.filter(l => l.status === 'published').length
  const total = lessons.length
  const pct = total ? (published / total) * 100 : 0

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`sidebar-btn ${activeCategory === cat.id ? 'sidebar-btn--active' : ''}`}
            onClick={() => onCategoryChange(cat.id)}
          >
            <div className="sidebar-btn-row">
              <span className="sidebar-label">{cat.label}</span>
              <span className="sidebar-count">
                {cat.id === 'all' ? total : lessons.filter(l => l.cat === cat.id).length}
              </span>
            </div>
          </button>
        ))}
      </nav>

      <div className="sidebar-stat">
        <div className="sidebar-stat-bar">
          <div className="sidebar-stat-fill" style={{ width: `${pct}%` }} />
        </div>
        <span className="sidebar-stat-text">
          <span className="sidebar-stat-num">{published}</span>
          {' '}of{' '}
          <span className="sidebar-stat-num">{total}</span>
          {' '}published
        </span>
      </div>
    </aside>
  )
}
