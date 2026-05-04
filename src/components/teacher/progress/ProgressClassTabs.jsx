import '../../css/teacher/progress/ProgressClassTabs.css'

export default function ProgressClassTabs({ classes, students, classFilter, onClassChange }) {
  return (
    <div className="tp-class-tabs">
      {classes.map(c => (
        <button
          key={c.id}
          className={`tp-class-tab ${classFilter === c.id ? 'tp-class-tab--active' : ''}`}
          onClick={() => onClassChange(c.id)}
        >
          {c.label}
          {c.id !== 'all' && (
            <span className="tp-class-count">
              {students.filter(s => s.classId === c.id).length}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
