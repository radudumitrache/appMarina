import '../../css/admin/lessons/LessonsSidebar.css'

export default function LessonsSidebar({ departments, activeDept, onDeptChange, lessons }) {
  const published = lessons.filter(l => l.visibility === 'public').length
  const total = lessons.length
  const pct = total ? (published / total) * 100 : 0

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <span className="sidebar-section-label">Departments</span>
        <button
          className={`sidebar-btn ${activeDept === 'all' ? 'sidebar-btn--active' : ''}`}
          onClick={() => onDeptChange('all')}
        >
          <div className="sidebar-btn-row">
            <span className="sidebar-label">All Lessons</span>
            <span className="sidebar-count">{total}</span>
          </div>
        </button>
        {departments.map(dept => (
          <button
            key={dept.id}
            className={`sidebar-btn ${activeDept === String(dept.id) ? 'sidebar-btn--active' : ''}`}
            onClick={() => onDeptChange(String(dept.id))}
          >
            <div className="sidebar-btn-row">
              <span className="sidebar-label">{dept.name}</span>
              <span className="sidebar-count">
                {lessons.filter(l => l.department_ids.includes(dept.id)).length}
              </span>
            </div>
          </button>
        ))}
        {departments.length === 0 && (
          <span className="sidebar-empty-note">No departments yet</span>
        )}
      </nav>

      <div className="sidebar-stat">
        <div className="sidebar-stat-bar">
          <div className="sidebar-stat-fill" style={{ width: `${pct}%` }} />
        </div>
        <span className="sidebar-stat-text">
          <span className="sidebar-stat-num">{published}</span>
          {' '}of{' '}
          <span className="sidebar-stat-num">{total}</span>
          {' '}public
        </span>
      </div>
    </aside>
  )
}
