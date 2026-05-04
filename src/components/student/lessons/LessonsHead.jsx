import '../../css/student/lessons/LessonsHead.css'

export default function LessonsHead({ title, count, viewMode, onViewModeChange }) {
  return (
    <div className="lessons-head">
      <h2 className="lessons-title">{title}</h2>
      <span className="lessons-count">{count} lessons</span>

      <div className="view-toggle">
        <button
          className={`view-btn ${viewMode === 'grid' ? 'view-btn--active' : ''}`}
          onClick={() => onViewModeChange('grid')}
          title="Grid view"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
        </button>
        <button
          className={`view-btn ${viewMode === 'list' ? 'view-btn--active' : ''}`}
          onClick={() => onViewModeChange('list')}
          title="List view"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6"  x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
