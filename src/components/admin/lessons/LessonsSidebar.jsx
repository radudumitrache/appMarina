import '../../css/admin/lessons/LessonsSidebar.css'

export default function LessonsSidebar({ lessons, departments, activeDepartment, onDepartmentChange, className = '' }) {
  const published = lessons.filter(l => l.visibility === 'public').length
  const total = lessons.length
  const pct = total ? (published / total) * 100 : 0

  const classCount = (departmentId) =>
    departmentId === null
      ? lessons.filter(l => !l.department_id).length
      : lessons.filter(l => l.department_id === departmentId).length

  return (
    <aside className={`sidebar${className ? ` ${className}` : ''}`}>
      <nav className="sidebar-nav">
        <button
          className={`sidebar-btn${activeDepartment === 'all' ? ' sidebar-btn--active' : ''}`}
          onClick={() => onDepartmentChange('all')}
        >
          <div className="sidebar-btn-row">
            <span className="sidebar-label">All Lessons</span>
            <span className="sidebar-count">{total}</span>
          </div>
        </button>

        {departments.length > 0 && (
          <>
            <span className="sidebar-section-label" style={{ marginTop: 12 }}>Departments</span>
            {departments.map(cls => {
              const count = classCount(cls.id)
              return (
                <button
                  key={cls.id}
                  className={`sidebar-btn${activeDepartment === cls.id ? ' sidebar-btn--active' : ''}`}
                  onClick={() => onDepartmentChange(cls.id)}
                >
                  <div className="sidebar-btn-row">
                    <span className="sidebar-label sidebar-label--class">{cls.name}</span>
                    <span className="sidebar-count">{count}</span>
                  </div>
                  {cls.code && <span className="sidebar-class-code">{cls.code}</span>}
                </button>
              )
            })}
            <button
              className={`sidebar-btn${activeDepartment === null ? ' sidebar-btn--active' : ''}`}
              onClick={() => onDepartmentChange(null)}
            >
              <div className="sidebar-btn-row">
                <span className="sidebar-label sidebar-label--muted">Unassigned</span>
                <span className="sidebar-count">{classCount(null)}</span>
              </div>
            </button>
          </>
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
