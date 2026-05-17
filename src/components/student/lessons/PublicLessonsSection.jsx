import LessonCard from './LessonCard'

export default function PublicLessonsSection({ lessons, departments = [], activeDept, onDeptChange, onToggleComplete }) {
  const filtered = activeDept === 'all'
    ? lessons
    : lessons.filter(l => (l.department_ids ?? []).includes(Number(activeDept)))

  return (
    <div className="les-section">
      <div className="les-cat-pills">
        <button
          className={`les-cat-pill ${activeDept === 'all' ? 'les-cat-pill--active' : ''}`}
          onClick={() => onDeptChange('all')}
        >
          All
        </button>
        {departments.map(dept => (
          <button
            key={dept.id}
            className={`les-cat-pill ${activeDept === String(dept.id) ? 'les-cat-pill--active' : ''}`}
            onClick={() => onDeptChange(String(dept.id))}
          >
            {dept.name}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="les-empty">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <span>No public lessons in this department.</span>
        </div>
      ) : (
        <div className="lessons-list lessons-list--grid">
          {filtered.map((lesson, i) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              index={i}
              viewMode="grid"
              onToggleComplete={onToggleComplete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
