import { useNavigate } from 'react-router-dom'
import '../../css/teacher/tests/TestCard.css'

export default function TestCard({ test, index }) {
  const navigate   = useNavigate()
  const delay      = `${Math.min(index, 6) * 0.04}s`
  const num        = String(test.id).padStart(2, '0')
  const classLabel = test.department_name ?? 'Open Access'
  const isPublished = test.status === 'published'

  return (
    <div className="ttest-card" style={{ animationDelay: delay }}>
      <div className="ttest-card-num">{num}</div>

      <div className="ttest-card-body">
        <h3 className="ttest-card-title">{test.title}</h3>
        <div className="ttest-card-meta">
          <span className="ttest-meta-author">By {test.author_name}</span>
          <span className="ttest-meta-sep">·</span>
          <span className="ttest-meta-class">{classLabel}</span>
          {test.time_limit_minutes && (
            <>
              <span className="ttest-meta-sep">·</span>
              <span className="ttest-meta-time">{test.time_limit_minutes} min</span>
            </>
          )}
        </div>
      </div>

      <div className="ttest-card-right">
        <span className={`ttest-status-badge ${isPublished ? 'ttest-status-badge--published' : 'ttest-status-badge--draft'}`}>
          {isPublished ? 'Published' : 'Draft'}
        </span>

        <button className="ttest-view-btn" aria-label="View test" onClick={() => navigate(`/teacher/assignments?test=${test.id}`)}>
          View
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5"  y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
