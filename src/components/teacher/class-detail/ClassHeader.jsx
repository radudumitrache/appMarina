import { useNavigate } from 'react-router-dom'
import '../../css/teacher/class-detail/ClassHeader.css'

const STATUS_LABELS = { active: 'Active', complete: 'Complete', archived: 'Archived' }

export default function ClassHeader({ name, code, status }) {
  const navigate = useNavigate()

  return (
    <div className="cd-header">
      <div className="cd-header-left">
        <div className="cd-breadcrumb">
          <button className="cd-crumb-link" onClick={() => navigate('/teacher/dashboard')}>Dashboard</button>
          <span className="cd-crumb-sep">/</span>
          <button className="cd-crumb-link" onClick={() => navigate('/teacher/classes')}>My Classes</button>
          <span className="cd-crumb-sep">/</span>
        </div>
        <div className="cd-title-row">
          <h1 className="cd-title">{name}</h1>
          <span className="cd-code-badge">{code}</span>
          <span className={`cd-status-badge cd-status--${status}`}>
            {STATUS_LABELS[status]}
          </span>
        </div>
      </div>
      <div className="cd-header-actions">
        <button className="cd-btn-secondary">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          Edit Class
        </button>
        <button className="cd-btn-icon" title="More options">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="5"  r="1"/>
            <circle cx="12" cy="12" r="1"/>
            <circle cx="12" cy="19" r="1"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
