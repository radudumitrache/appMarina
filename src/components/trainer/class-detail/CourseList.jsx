import '../../css/trainer/class-detail/CrewList.css'

const STATUS_MAP = {
  draft:     { label: 'Draft',     cls: 'cd-badge--draft'     },
  published: { label: 'Published', cls: 'cd-badge--published' },
}

export default function CourseList({ courses }) {
  return (
    <div className="cd-list">
      <div className="cd-list-header">
        <span className="cd-col cd-col--course-title">Course</span>
        <span className="cd-col cd-col--course-status">Status</span>
        <span className="cd-col cd-col--course-modules">Modules</span>
      </div>

      {courses.length === 0 ? (
        <p className="cd-empty">No courses assigned to this department yet.</p>
      ) : (
        courses.map((c, i) => {
          const sm = STATUS_MAP[c.status] ?? STATUS_MAP.draft
          return (
            <div
              key={c.id}
              className="cd-row"
              style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
            >
              <div className="cd-col cd-col--course-title">
                <span className="cd-module-title">{c.title}</span>
                {c.description && (
                  <span className="cd-course-desc">{c.description}</span>
                )}
              </div>
              <div className="cd-col cd-col--course-status">
                <span className={`cd-badge ${sm.cls}`}>{sm.label}</span>
              </div>
              <div className="cd-col cd-col--course-modules">
                <span className="cd-mono cd-muted">{c.module_count ?? 0}</span>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
