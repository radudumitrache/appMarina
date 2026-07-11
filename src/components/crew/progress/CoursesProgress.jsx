import '../../css/crew/progress/ModulesProgress.css'

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

export default function CoursesProgress({ courses }) {
  if (!courses || courses.length === 0) {
    return (
      <section className="progress-section">
        <div className="section-head">
          <span className="section-title">Courses</span>
        </div>
        <p className="lp-empty">No courses assigned to your departments yet.</p>
      </section>
    )
  }

  const done  = courses.filter(c => c.completed).length
  const total = courses.length

  return (
    <section className="progress-section">
      <div className="section-head">
        <span className="section-title">Courses</span>
        <span className="section-meta">
          <span className="section-meta-num">{done}</span>/ {total} completed
        </span>
      </div>

      <div className="lp-body">
        {courses.map(course => {
          const pct = course.total_count > 0
            ? Math.round((course.completed_count / course.total_count) * 100)
            : 0

          return (
            <div key={course.course_id} className="lp-class">
              <div className="lp-class-head">
                <span className="lp-class-name">{course.course_title}</span>
                <span className="lp-class-count">{course.completed_count}/{course.total_count}</span>
                <div className="lp-class-bar">
                  <div className="lp-class-bar-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>

              <div className="lp-list">
                {course.items.map((item, i) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    className={`lp-row ${item.completed ? 'lp-row--done' : ''}`}
                    style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
                  >
                    <div className={`lp-status ${item.completed ? 'lp-status--done' : 'lp-status--pending'}`}>
                      {item.completed ? <CheckIcon /> : null}
                    </div>
                    <span className="lp-title">{item.title}</span>
                    <div className="lp-meta">
                      <span className={`lp-diff ${item.type === 'test' ? 'lp-diff--intermediate' : 'lp-diff--easy'}`}>
                        {item.type === 'test' ? 'Test' : 'Lesson'}
                      </span>
                      {item.type === 'test' && item.grade != null && (
                        <span className="lp-duration">{item.grade}%</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
