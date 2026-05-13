import '../../css/student/lesson-reader/LessonTopBar.css'

export default function LessonTopBar({ lessonTitle, panelIdx, panelCount, completed, completing, onBack, onPrev, onNext, onToggleComplete }) {
  return (
    <header className="lr-topbar">
      <button className="lr-back-btn" onClick={onBack}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"/>
          <polyline points="12 19 5 12 12 5"/>
        </svg>
        Lessons
      </button>

      <div className="lr-topbar-center">
        <span className="lr-lesson-title">{lessonTitle}</span>
      </div>

      <div className="lr-topbar-right">
        {panelCount > 0 && (
          <span className="lr-panel-counter">
            <span className="lr-panel-cur">{panelIdx + 1}</span>
            <span className="lr-panel-sep"> / </span>
            <span className="lr-panel-tot">{panelCount}</span>
          </span>
        )}
        <button
          className="lr-nav-btn"
          disabled={panelIdx === 0}
          onClick={onPrev}
          title="Previous panel"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <button
          className="lr-nav-btn"
          disabled={panelIdx === panelCount - 1}
          onClick={onNext}
          title="Next panel"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
        {onToggleComplete && (
          <button
            className={`lr-complete-btn${completed ? ' lr-complete-btn--done' : ''}`}
            onClick={onToggleComplete}
            disabled={completing}
            title={completed ? 'Mark as incomplete' : 'Mark as complete'}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
            {completing ? '…' : completed ? 'Completed' : 'Mark Complete'}
          </button>
        )}
      </div>
    </header>
  )
}
