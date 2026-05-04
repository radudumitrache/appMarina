import '../../css/admin/lessons/LessonRow.css'

export default function LessonRow({ lesson, categories, index, onEdit, onToggleStatus, onDelete }) {
  const catLabel = categories.find(c => c.id === lesson.cat)?.label

  return (
    <div
      className="lesson-row"
      style={{ animationDelay: `${Math.min(index, 6) * 0.04}s` }}
    >
      <div className="lesson-row-main">
        <div className="lesson-row-title">{lesson.title}</div>
        <div className="lesson-row-meta">
          <span className="lesson-cat-badge">{catLabel}</span>
          <span className="lesson-meta-sep">·</span>
          <span className="lesson-duration">{lesson.duration}</span>
          <span className="lesson-meta-sep">·</span>
          <span className={`lesson-difficulty lesson-difficulty--${lesson.difficulty}`}>
            {lesson.difficulty}
          </span>
          <span className="lesson-meta-sep">·</span>
          <span className="lesson-author">{lesson.author}</span>
        </div>
      </div>

      <div className="lesson-row-right">
        <span className={`lesson-status-badge lesson-status-badge--${lesson.status}`}>
          {lesson.status}
        </span>
        <div className="lesson-row-actions">
          <button className="row-btn" onClick={onEdit} title="Edit lesson">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button
            className={`row-btn ${lesson.status === 'published' ? 'row-btn--warn' : 'row-btn--ok'}`}
            onClick={onToggleStatus}
            title={lesson.status === 'published' ? 'Unpublish' : 'Publish'}
          >
            {lesson.status === 'published' ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
          <button className="row-btn row-btn--delete" onClick={onDelete} title="Delete lesson">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
