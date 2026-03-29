import '../../css/student/lessons/LessonCard.css'

const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5"/>
  </svg>
)

const LockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)

export default function LessonCard({ lesson, index, viewMode = 'grid', onToggleComplete }) {
  const delay = `${Math.min(index, 6) * 0.04}s`
  const lockedClass = lesson.locked ? 'lesson-card--locked' : ''

  if (viewMode === 'list') {
    return (
      <div
        className={`lesson-card lesson-card--list ${lockedClass}`}
        style={{ animationDelay: delay }}
      >
        <span className="lesson-num">{String(lesson.id).padStart(2, '0')}</span>

        <div className="lesson-body">
          <span className="lesson-title">{lesson.title}</span>
          <span className="lesson-author">{lesson.author}</span>
        </div>

        <span className="lesson-duration">{lesson.duration}</span>

        <span className={`lesson-badge lesson-badge--vis-${lesson.visibility}`}>
          {lesson.visibility === 'class' ? 'My Class' : 'Public'}
        </span>

        <span className={`lesson-badge lesson-badge--${lesson.complete ? 'complete' : 'pending'}`}>
          {lesson.complete ? 'Complete' : 'Not started'}
        </span>

        {lesson.locked ? (
          <span className="lesson-lock-icon"><LockIcon /></span>
        ) : (
          <button
            className={`lesson-toggle ${lesson.complete ? 'lesson-toggle--done' : ''}`}
            onClick={() => onToggleComplete(lesson.id)}
            title={lesson.complete ? 'Mark incomplete' : 'Mark complete'}
          >
            <CheckIcon />
          </button>
        )}
      </div>
    )
  }

  // ── Grid mode ──────────────────────────────────────────────────────────────
  return (
    <div
      className={`lesson-card lesson-card--grid ${lockedClass}`}
      style={{ animationDelay: delay }}
    >
      <span className="lesson-num">{String(lesson.id).padStart(2, '0')}</span>

      <div className="lesson-body">
        <span className="lesson-title">{lesson.title}</span>
        <span className="lesson-duration">{lesson.duration}</span>
      </div>

      {lesson.locked ? (
        <span className="lesson-lock-icon"><LockIcon /></span>
      ) : (
        <button
          className={`lesson-toggle ${lesson.complete ? 'lesson-toggle--done' : ''}`}
          onClick={e => { e.stopPropagation(); onToggleComplete(lesson.id) }}
          title={lesson.complete ? 'Mark incomplete' : 'Mark complete'}
        >
          <CheckIcon />
        </button>
      )}
    </div>
  )
}
