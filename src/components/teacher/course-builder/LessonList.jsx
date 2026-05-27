import { formatDuration } from './courseBuilderUtils'
import '../../css/teacher/course-builder/LessonList.css'

const TYPE_SHORT = { vr_tour: 'VR', text: 'Text' }

export default function LessonList({ selectedLessons, loadingDetail, onRemove, onMove, onNavigatePanels, onViewLesson }) {
  if (loadingDetail) {
    return (
      <div className="cb-loading">
        <div className="cb-spinner" />
      </div>
    )
  }

  if (!selectedLessons) return null

  return (
    <div className="cb-lesson-list">
      {selectedLessons.length === 0 && (
        <div className="cb-empty">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-3)' }}>
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
          <span>No lessons yet. Add from the bank below.</span>
        </div>
      )}

      {selectedLessons.map((lesson, i) => (
        <div
          key={lesson.id}
          className="cb-lesson-row"
          style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
        >
          <span className="cb-lesson-num">{String(i + 1).padStart(2, '0')}</span>
          <div className="cb-lesson-body">
            <span className="cb-lesson-title">{lesson.title}</span>
            <div className="cb-lesson-meta">
              {lesson.type && (
                <span className={`cb-type-badge cb-type--${lesson.type}`}>
                  {TYPE_SHORT[lesson.type] ?? lesson.type}
                </span>
              )}
              <span className="cb-lesson-duration">{formatDuration(lesson.duration_minutes)}</span>
            </div>
          </div>
          <div className="cb-lesson-actions">
            <button
              className="cb-view-lesson-btn"
              onClick={() => onViewLesson?.(lesson)}
              title="View lesson"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              View
            </button>
            <button
              className="cb-reorder-btn"
              disabled={i === 0}
              onClick={() => onMove(i, -1)}
              title="Move up"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="18 15 12 9 6 15"/>
              </svg>
            </button>
            <button
              className="cb-reorder-btn"
              disabled={i === selectedLessons.length - 1}
              onClick={() => onMove(i, 1)}
              title="Move down"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            <button
              className="cb-remove-btn"
              onClick={() => onRemove(lesson.id)}
              title="Remove from course"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6"  y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
