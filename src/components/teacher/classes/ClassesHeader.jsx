import { useNavigate } from 'react-router-dom'
import '../../css/teacher/classes/ClassesHeader.css'

export default function ClassesHeader({ onCreateNew }) {
  const navigate = useNavigate()

  return (
    <div className="classes-header">
      <div className="classes-header-left">
        <button className="classes-breadcrumb" onClick={() => navigate('/teacher/dashboard')}>
          Dashboard /
        </button>
        <h1 className="classes-title">My Departments</h1>
      </div>
      <button className="classes-new-btn" onClick={onCreateNew}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5"  y1="12" x2="19" y2="12"/>
        </svg>
        New Department
      </button>
    </div>
  )
}
