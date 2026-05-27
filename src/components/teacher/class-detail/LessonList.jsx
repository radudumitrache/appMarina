import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LessonEditModal from '../course-builder/LessonEditModal'
import '../../css/teacher/class-detail/StudentList.css'

export default function LessonList({ lessons, departmentId, onRemove, onUpdate }) {
  const navigate = useNavigate()
  const [confirmId, setConfirmId] = useState(null)
  const [editLesson, setEditLesson] = useState(null)
  const [removing, setRemoving] = useState(null)

  const handleRemove = async (lessonId) => {
    setRemoving(lessonId)
    try { await onRemove?.(lessonId) } finally { setRemoving(null); setConfirmId(null) }
  }

  const handleSave = async (data) => {
    await onUpdate?.(editLesson.id, data)
    setEditLesson(null)
  }

  return (
    <>
    <div className="cd-list">
      <div className="cd-list-header">
        <span className="cd-col cd-col--num">#</span>
        <span className="cd-col cd-col--lesson">Lesson</span>
        <span className="cd-col cd-col--dur">Duration</span>
        <span className="cd-col cd-col--completion">Completion</span>
        <span className="cd-col cd-col--actions3" />
      </div>

      {lessons.length === 0 ? (
        <p className="cd-empty">No lessons match your search.</p>
      ) : (
        lessons.map((l, i) => {
          const pct      = l.total > 0 ? Math.round((l.completed / l.total) * 100) : 0
          const isDone   = l.total > 0 && l.completed === l.total
          const isConf   = confirmId === l.id
          const isBusy   = removing === l.id

          return (
            <div
              key={l.id}
              className="cd-row cd-row--lesson"
              style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
            >
              <div className="cd-col cd-col--num">
                <span className="cd-lesson-num">{l.num}</span>
              </div>
              <div className="cd-col cd-col--lesson">
                <span className="cd-lesson-title">{l.title}</span>
              </div>
              <div className="cd-col cd-col--dur">
                <span className="cd-mono cd-muted">{l.duration}</span>
              </div>
              <div className="cd-col cd-col--completion cd-completion-cell">
                <div className="cd-mini-bar">
                  <div
                    className={`cd-mini-fill ${isDone ? 'cd-mini-fill--done' : ''}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="cd-mono cd-completion-count">{l.completed}/{l.total}</span>
              </div>

              <div className="cd-col cd-col--actions3">
                {isConf ? (
                  <div className="cd-confirm-inline">
                    <span className="cd-confirm-text">Remove?</span>
                    <button
                      className="cd-row-action cd-row-action--danger"
                      title="Confirm remove"
                      onClick={() => handleRemove(l.id)}
                      disabled={isBusy}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </button>
                    <button
                      className="cd-row-action"
                      title="Cancel"
                      onClick={() => setConfirmId(null)}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="cd-row-actions">
                    <button
                      className="cd-row-action cd-row-action--view"
                      title="Edit panels"
                      onClick={() => navigate(`/teacher/lessons/${l.id}/panels`)}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                      </svg>
                    </button>
                    <button
                      className="cd-row-action cd-row-action--edit"
                      title="Edit lesson"
                      onClick={() => setEditLesson(l)}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button
                      className="cd-row-action"
                      title="Remove from department"
                      onClick={() => setConfirmId(l.id)}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        <path d="M10 11v6M14 11v6"/>
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })
      )}
    </div>

    {editLesson && (
      <LessonEditModal
        lesson={{ id: editLesson.id, title: editLesson.title, duration_minutes: parseInt(editLesson.duration) || '' }}
        onSave={handleSave}
        onClose={() => setEditLesson(null)}
      />
    )}
    </>
  )
}
