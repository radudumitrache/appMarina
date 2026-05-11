import '../../css/student/tests/TestsSidebar.css'

function getClassStats(tests, classId) {
  const subset =
    classId === 'all'  ? tests :
    classId === 'open' ? tests.filter(t => !t.class_id) :
    tests.filter(t => t.class_id === classId)
  return {
    total:   subset.length,
    pending: subset.filter(t => !t.completed).length,
    done:    subset.filter(t => t.completed).length,
  }
}

export default function TestsSidebar({ tests, classes, activeClass, onClassChange, overall, avg }) {
  const navItems = [
    { id: 'all',  label: 'All Tests'   },
    ...classes.map(c => ({ id: c.code, label: c.name })),
    { id: 'open', label: 'Open Access' },
  ]

  return (
    <aside className="tests-sidebar">
      <nav className="tests-sidebar-nav">
        {navItems.map((cls) => {
          const stats = getClassStats(tests, cls.id)
          return (
            <button
              key={cls.id}
              className={`tests-sidebar-btn ${activeClass === cls.id ? 'tests-sidebar-btn--active' : ''}`}
              onClick={() => onClassChange(cls.id)}
            >
              <div className="tests-sidebar-row">
                <span className="tests-sidebar-label">{cls.label}</span>
                <span className="tests-sidebar-count">{stats.pending}/{stats.total}</span>
              </div>
            </button>
          )
        })}
      </nav>

      <div className="tests-sidebar-footer">
        <div className="tests-sidebar-stat">
          <span className="tests-sidebar-stat-num">{overall.done}</span>
          <span className="tests-sidebar-stat-text"> of </span>
          <span className="tests-sidebar-stat-num">{overall.total}</span>
          <span className="tests-sidebar-stat-text"> completed</span>
        </div>
        {avg !== null && (
          <div className="tests-sidebar-avg">
            <span className="tests-sidebar-avg-label">Avg grade</span>
            <span className="tests-sidebar-avg-value">{avg}%</span>
          </div>
        )}
      </div>
    </aside>
  )
}
