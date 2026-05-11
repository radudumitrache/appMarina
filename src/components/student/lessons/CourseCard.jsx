import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { completeLesson, uncompleteLesson } from '../../../api/lessons'
import '../../css/student/lessons/CourseCard.css'

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5"/>
  </svg>
)

const LockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)

const ChevronIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)

export default function CourseCard({ course, index, onLessonToggle }) {
  const [expanded, setExpanded] = useState(false)
  const navigate = useNavigate()
  const delay = `${Math.min(index, 6) * 0.04}s`

  const lessons = course.lessons ?? []
  const total = lessons.length
  const completed = lessons.filter(cl => cl.lesson_detail?.completed).length
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  function handleToggle(cl, e) {
    e.stopPropagation()
    if (cl.lesson_detail?.locked) return
    const wasComplete = !!cl.lesson_detail?.completed
    onLessonToggle(course.id, cl.lesson, !wasComplete)
    const apiCall = wasComplete ? uncompleteLesson : completeLesson
    apiCall(cl.lesson).catch(() => onLessonToggle(course.id, cl.lesson, wasComplete))
  }

  return (
    <div className="crs-card" style={{ animationDelay: delay }}>
      <div className="crs-header" onClick={() => setExpanded(v => !v)}>
        <div className="crs-info">
          <span className="crs-title">{course.title}</span>
          <span className="crs-meta">{completed} / {total} lessons complete</span>
        </div>
        <div className="crs-right">
          <div className="crs-bar">
            <div className="crs-bar-fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="crs-pct">{pct}%</span>
          <span className={`crs-chevron ${expanded ? 'crs-chevron--open' : ''}`}>
            <ChevronIcon />
          </span>
        </div>
      </div>

      {expanded && (
        <div className="crs-lessons">
          {lessons.length === 0 ? (
            <p className="crs-empty">No lessons in this course yet.</p>
          ) : (
            lessons.map((cl, i) => {
              const ld = cl.lesson_detail ?? {}
              const isLocked = ld.locked
              const isDone = !!ld.completed
              return (
                <div
                  key={cl.id}
                  className={`crs-lesson ${isLocked ? 'crs-lesson--locked' : ''}`}
                  onClick={() => !isLocked && navigate(`/student/lessons/${cl.lesson}`, { state: { lesson: ld } })}
                  role={isLocked ? undefined : 'button'}
                  tabIndex={isLocked ? undefined : 0}
                  onKeyDown={e => { if (!isLocked && (e.key === 'Enter' || e.key === ' ')) navigate(`/student/lessons/${cl.lesson}`) }}
                >
                  <span className="crs-lesson-num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="crs-lesson-title">{ld.title ?? '—'}</span>
                  <span className="crs-lesson-dur">{ld.duration_minutes ? `${ld.duration_minutes} min` : '—'}</span>
                  {isLocked ? (
                    <span className="crs-lesson-icon crs-lesson-icon--lock"><LockIcon /></span>
                  ) : (
                    <button
                      className={`crs-lesson-toggle ${isDone ? 'crs-lesson-toggle--done' : ''}`}
                      onClick={e => handleToggle(cl, e)}
                      title={isDone ? 'Mark incomplete' : 'Mark complete'}
                    >
                      <CheckIcon />
                    </button>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
