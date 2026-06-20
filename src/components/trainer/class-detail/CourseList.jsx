import { useNavigate } from 'react-router-dom'
import '../../css/trainer/class-detail/StudentList.css'

const STATUS_MAP = {
  draft:     { label: 'Draft',     cls: 'cd-badge--draft'     },
  published: { label: 'Published', cls: 'cd-badge--published' },
}

export default function CourseList({ courses }) {
  const navigate = useNavigate()

  return (
    <div className="cd-list">
      <div className="cd-list-header">
        <span className="cd-col cd-col--course-title">Course</span>
        <span className="cd-col cd-col--course-status">Status</span>
        <span className="cd-col cd-col--course-modules">Modules</span>
        <span className="cd-col cd-col--action" />
      </div>

      {courses.length === 0 ? (
        <p className="cd-empty">No courses yet. Click "New Course" to create one.</p>
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
              <div className="cd-col cd-col--action">
                <button
                  className="cd-row-action cd-row-action--view"
                  title="Open in Course Builder"
                  onClick={() => navigate('/trainer/builder')}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/>
                    <line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                </button>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
