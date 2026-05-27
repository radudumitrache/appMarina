import { useState } from 'react'
import { formatDuration } from './courseBuilderUtils'
import LessonEditModal from './LessonEditModal'
import '../../css/teacher/course-builder/LessonBank.css'

export default function LessonBank({
  setBankOpen,
  lessonBankCount,
  bankFiltered,
  bankSearch,
  setBankSearch,
  selectedLessons,
  saving,
  onAdd,
  onCreateLesson,
}) {
  const [creatingLesson, setCreatingLesson] = useState(false)

  const added = (id) => selectedLessons?.some(l => l.id === id) ?? false

  async function handleCreate(data) {
    const lesson = await onCreateLesson(data)
    setCreatingLesson(false)
    // auto-add the newly created lesson to the course
    if (lesson?.id) onAdd(lesson.id)
  }

  if (creatingLesson) {
    return (
      <LessonEditModal
        lesson={null}
        onSave={handleCreate}
        onClose={() => setCreatingLesson(false)}
      />
    )
  }

  return (
    <>
      <div className="cb-bank-overlay" onClick={() => setBankOpen(false)}>
        <div className="cb-bank-modal" onClick={e => e.stopPropagation()}>

          <div className="cb-bank-modal-header">
            <div className="cb-bank-modal-title-row">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
              <span className="cb-bank-modal-title">Add Lessons</span>
              <span className="cb-bank-modal-count">{lessonBankCount} available</span>
            </div>
            <div className="cb-bank-modal-header-actions">
              {/* New Lesson button disabled for teachers — admins only
              <button className="cb-bank-new-btn" onClick={() => setCreatingLesson(true)}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                New Lesson
              </button>
              */}
              <button className="cb-bank-modal-close" onClick={() => setBankOpen(false)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="cb-bank-modal-search-wrap">
            <svg className="cb-bank-modal-search-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className="cb-bank-modal-search"
              type="text"
              placeholder="Filter lessons…"
              value={bankSearch}
              onChange={e => setBankSearch(e.target.value)}
              autoFocus
            />
          </div>

          <div className="cb-bank-modal-list">
            {bankFiltered.length === 0 ? (
              <div className="cb-bank-modal-empty">
                <p>No lessons match your search.</p>
                <button className="cb-bank-empty-create" onClick={() => setCreatingLesson(true)}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Create a new lesson
                </button>
              </div>
            ) : (
              bankFiltered.map(lesson => {
                const isAdded = added(lesson.id)
                return (
                  <div key={lesson.id} className={`cb-bank-item ${isAdded ? 'cb-bank-item--added' : ''}`}>
                    <div className="cb-bank-item-info">
                      <span className="cb-bank-item-title">{lesson.title}</span>
                      <div className="cb-bank-item-meta">
                        <span className="cb-bank-item-dur">{formatDuration(lesson.duration_minutes)}</span>
                      </div>
                    </div>
                    <button
                      className={`cb-bank-item-btn ${isAdded ? 'cb-bank-item-btn--added' : ''}`}
                      onClick={() => !isAdded && !saving && onAdd(lesson.id)}
                      disabled={isAdded || saving}
                    >
                      {isAdded ? (
                        <>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                          Added
                        </>
                      ) : (
                        <>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                          </svg>
                          Add
                        </>
                      )}
                    </button>
                  </div>
                )
              })
            )}
          </div>

          <div className="cb-bank-modal-footer">
            <button className="cb-bank-modal-done" onClick={() => setBankOpen(false)}>Done</button>
          </div>

        </div>
      </div>
    </>
  )
}
