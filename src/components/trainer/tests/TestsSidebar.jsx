import '../../css/trainer/tests/TestsSidebar.css'

function getDeptStats(tests, departmentId) {
  const subset =
    departmentId === 'all'  ? tests :
    departmentId === 'open' ? tests.filter(t => !t.departments?.length) :
    tests.filter(t => t.departments?.some(d => d.id === departmentId))
  return {
    total:     subset.length,
    published: subset.filter(t => t.status === 'published').length,
  }
}

export default function TestsSidebar({ tests, departments, activeDepartment, onDepartmentChange, overall, className = '' }) {
  const navItems = [
    { id: 'all',  label: 'All Tests'   },
    ...departments.map(c => ({ id: c.id, label: c.name })),
    { id: 'open', label: 'Open Access' },
  ]

  return (
    <aside className={`ttests-sidebar${className ? ` ${className}` : ''}`}>
      <nav className="ttests-sidebar-nav">
        {navItems.map((cls) => {
          const stats = getDeptStats(tests, cls.id)
          return (
            <button
              key={cls.id}
              className={`ttests-sidebar-btn ${activeDepartment === cls.id ? 'ttests-sidebar-btn--active' : ''}`}
              onClick={() => onDepartmentChange(cls.id)}
            >
              <div className="ttests-sidebar-row">
                <span className="ttests-sidebar-label">{cls.label}</span>
                <span className="ttests-sidebar-count">{stats.published}/{stats.total}</span>
              </div>
            </button>
          )
        })}
      </nav>

      <div className="ttests-sidebar-footer">
        <div className="ttests-sidebar-stat">
          <span className="ttests-sidebar-stat-num">{overall.published}</span>
          <span className="ttests-sidebar-stat-text"> of </span>
          <span className="ttests-sidebar-stat-num">{overall.total}</span>
          <span className="ttests-sidebar-stat-text"> published</span>
        </div>
      </div>
    </aside>
  )
}
