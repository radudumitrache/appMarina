import '../../css/teacher/progress/ProgressClassTabs.css'

export default function ProgressClassTabs({ classes, students, classFilter, onClassChange }) {
  return (
    <aside className="tp-class-sidebar">
      <div className="tp-class-sidebar-title">Classes</div>

      {classes.map(c => {
        const count  = c.id === 'all'
          ? students.length
          : students.filter(s => s.classId === c.id).length
        const active = classFilter === c.id

        if (c.id === 'all') {
          return (
            <button
              key="all"
              className={`tp-class-card tp-class-card--all ${active ? 'tp-class-card--active' : ''}`}
              onClick={() => onClassChange('all')}
            >
              <span className="tp-class-card-name">All Classes</span>
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
            onClick={() => onClassChange(c.id)}
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
