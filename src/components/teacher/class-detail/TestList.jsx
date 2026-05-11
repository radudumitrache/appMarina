import { useNavigate } from 'react-router-dom'
import '../../css/teacher/class-detail/StudentList.css'

const STATUS_MAP = {
  draft:     { label: 'Draft',     cls: 'cd-badge--draft'     },
  published: { label: 'Published', cls: 'cd-badge--published' },
}

export default function TestList({ tests }) {
  const navigate = useNavigate()

  return (
    <div className="cd-list">
      <div className="cd-list-header">
        <span className="cd-col cd-col--test-title">Test</span>
        <span className="cd-col cd-col--test-status">Status</span>
        <span className="cd-col cd-col--test-time">Time Limit</span>
        <span className="cd-col cd-col--test-q">Questions</span>
      </div>

      {tests.length === 0 ? (
        <p className="cd-empty">No tests yet. Click "New Test" to create one.</p>
      ) : (
        tests.map((t, i) => {
          const sm = STATUS_MAP[t.status] ?? STATUS_MAP.draft
          return (
            <div
              key={t.id}
              className="cd-row cd-row--clickable"
              style={{ animationDelay: `${Math.min(i, 6) * 0.04}s`, cursor: 'pointer' }}
              onClick={() => navigate(`/teacher/assignments?test=${t.id}`)}
            >
              <div className="cd-col cd-col--test-title">
                <span className="cd-lesson-title">{t.title}</span>
              </div>
              <div className="cd-col cd-col--test-status">
                <span className={`cd-badge ${sm.cls}`}>{sm.label}</span>
              </div>
              <div className="cd-col cd-col--test-time">
                <span className="cd-mono cd-muted">{t.time_limit_minutes} min</span>
              </div>
              <div className="cd-col cd-col--test-q">
                <span className="cd-mono cd-muted">{t.question_count ?? 0}</span>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
