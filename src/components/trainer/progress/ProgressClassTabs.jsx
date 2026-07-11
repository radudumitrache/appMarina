import '../../css/trainer/progress/ProgressClassTabs.css'

export default function ProgressClassTabs({ departments, crew, departmentFilter, onDepartmentChange }) {
  return (
    <aside className="tp-class-sidebar">
      <div className="tp-class-sidebar-title">Departments</div>

      {departments.map(c => {
        const count  = c.id === 'all'
          ? crew.length
          : crew.filter(s => s.departmentId === c.id).length
        const active = departmentFilter === c.id

        if (c.id === 'all') {
          return (
            <button
              key="all"
              className={`tp-class-card tp-class-card--all ${active ? 'tp-class-card--active' : ''}`}
              onClick={() => onDepartmentChange('all')}
            >
              <span className="tp-class-card-name">All Departments</span>
              <span className="tp-class-card-count">{count}</span>
            </button>
          )
        }

        const [code, ...nameParts] = c.label.split(' — ')
        const name = nameParts.join(' — ') || code

        return (
          <button
            key={c.id}
            className={`tp-class-card ${active ? 'tp-class-card--active' : ''}`}
            onClick={() => onDepartmentChange(c.id)}
          >
            <div className="tp-class-card-top">
              <span className="tp-class-card-code">{code}</span>
              <span className="tp-class-card-count">{count}</span>
            </div>
            <span className="tp-class-card-name">{name}</span>
          </button>
        )
      })}
    </aside>
  )
}
