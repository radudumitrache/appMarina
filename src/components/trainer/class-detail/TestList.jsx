import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../../auth/AuthContext'
import '../../css/trainer/class-detail/StudentList.css'

const STATUS_MAP = {
  draft:     { label: 'Draft',     cls: 'cd-badge--draft'     },
  published: { label: 'Published', cls: 'cd-badge--published' },
}

export default function TestList({ tests }) {
  const navigate = useNavigate()
  const { id: classId } = useParams()
  const { user } = useAuth()

  return (
    <div className="cd-list">
      <div className="cd-list-header">
        <span className="cd-col cd-col--test-title">Test</span>
        <span className="cd-col cd-col--test-status">Status</span>
        <span className="cd-col cd-col--test-time">Time Limit</span>
        <span className="cd-col cd-col--test-q">Questions</span>
        <span className="cd-col cd-col--action" />
      </div>

      {tests.length === 0 ? (
        <p className="cd-empty">No tests yet. Click "New Test" to create one.</p>
      ) : (
        tests.map((t, i) => {
          const sm = STATUS_MAP[t.status] ?? STATUS_MAP.draft
          const isOwner = user && t.author === user.id
          return (
            <div
              key={t.id}
              className={`cd-row${isOwner ? ' cd-row--clickable' : ''}`}
              style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
              onClick={isOwner ? () => navigate(`/trainer/assignments?test=${t.id}`) : undefined}
            >
              <div className="cd-col cd-col--test-title">
                <span className="cd-module-title">{t.title}</span>
                {!isOwner && (
                  <span className="cd-readonly-badge" title={`Created by ${t.author_name}`}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    View only
                  </span>
                )}
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
              <div className="cd-col cd-col--action">
                <button
                  className="cd-row-action cd-row-action--view"
                  title="View submissions"
                  onClick={e => {
                    e.stopPropagation()
                    navigate(`/trainer/tests/${t.id}/submissions`, {
                      state: { backPath: `/trainer/departments/${classId}`, testTitle: t.title },
                    })
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
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
