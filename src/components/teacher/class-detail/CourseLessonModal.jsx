import { useState, useEffect } from 'react'
import { getCourse, addCourseLesson, removeCourseLesson } from '../../../api/lessons'
import '../../css/teacher/class-detail/CourseLessonModal.css'

const CAT_LABELS = { nav: 'NAV', emg: 'EMG', eng: 'ENG', cargo: 'CARGO', comm: 'COMM' }

export default function CourseLessonModal({ course, classLessons, onClose }) {
  const [inCourse, setInCourse]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [dragSrc, setDragSrc]     = useState(null)   // { lesson, from: 'bank'|'course' }
  const [overTarget, setOverTarget] = useState(null) // 'bank' | 'course'

  useEffect(() => {
    getCourse(course.id).then(res => {
      const clMap = new Map(classLessons.map(l => [l.id, l]))
      const loaded = (res.data.lessons ?? []).map(cl => {
        const id = cl.lesson_detail?.id ?? cl.id
        return clMap.get(id) ?? { id, title: cl.lesson_detail?.title ?? '—', cat: cl.lesson_detail?.category, duration: cl.lesson_detail?.duration_minutes ? `${cl.lesson_detail.duration_minutes} min` : '—' }
      }).filter(Boolean)
      setInCourse(loaded)
    }).finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const available = classLessons.filter(l => !inCourse.some(c => c.id === l.id))

  const addLesson = async (lesson) => {
    if (inCourse.some(l => l.id === lesson.id)) return
    setInCourse(prev => [...prev, lesson])
    try { await addCourseLesson(course.id, { lesson: lesson.id }) }
    catch { setInCourse(prev => prev.filter(l => l.id !== lesson.id)) }
  }

  const removeLesson = async (lesson) => {
    setInCourse(prev => prev.filter(l => l.id !== lesson.id))
    try { await removeCourseLesson(course.id, lesson.id) }
    catch { setInCourse(prev => [...prev, lesson]) }
  }

  // ── drag handlers ──────────────────────────────────────────────────────────
  const onDragStart = (lesson, from) => (e) => {
    setDragSrc({ lesson, from })
    e.dataTransfer.effectAllowed = 'move'
  }

  const onDragEnd = () => { setDragSrc(null); setOverTarget(null) }

  const onDragOver = (target) => (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setOverTarget(target)
  }

  const onDragLeave = () => setOverTarget(null)

  const onDrop = (target) => (e) => {
    e.preventDefault()
    setOverTarget(null)
    if (!dragSrc) return
    if (target === 'course' && dragSrc.from === 'bank') addLesson(dragSrc.lesson)
    if (target === 'bank'   && dragSrc.from === 'course') removeLesson(dragSrc.lesson)
    setDragSrc(null)
  }

  const cat = l => CAT_LABELS[l.cat ?? l.category] ?? l.cat ?? l.category ?? ''
  const dur = l => l.duration ?? (l.duration_minutes ? `${l.duration_minutes} min` : '')

  return (
    <div className="clm-backdrop" onClick={onClose}>
      <div className="clm-modal" onClick={e => e.stopPropagation()}>

        <div className="clm-header">
          <div className="clm-header-left">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
            <span className="clm-course-name">{course.title}</span>
          </div>
          <button className="clm-close" onClick={onClose}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <p className="clm-hint">Drag lessons into the course, or click the <strong>+</strong> / <strong>×</strong> buttons.</p>

        {loading ? (
          <div className="clm-loading">Loading…</div>
        ) : (
          <div className="clm-body">

            {/* ── Lesson bank (left) ── */}
            <div
              className={`clm-col ${overTarget === 'bank' && dragSrc?.from === 'course' ? 'clm-col--over' : ''}`}
              onDragOver={onDragOver('bank')}
              onDragLeave={onDragLeave}
              onDrop={onDrop('bank')}
            >
              <div className="clm-col-hd">
                <span className="clm-col-title">Class Lessons</span>
                <span className="clm-col-count">{available.length}</span>
              </div>
              <div className="clm-col-body">
                {available.length === 0 ? (
                  <p className="clm-empty">All lessons added to course</p>
                ) : (
                  available.map(l => (
                    <div
                      key={l.id}
                      className={`clm-item ${dragSrc?.lesson.id === l.id ? 'clm-item--dragging' : ''}`}
                      draggable
                      onDragStart={onDragStart(l, 'bank')}
                      onDragEnd={onDragEnd}
                    >
                      <div className="clm-item-info">
                        <span className="clm-item-title">{l.title}</span>
                        <div className="clm-item-meta">
                          {cat(l) && <span className="clm-tag">{cat(l)}</span>}
                          {dur(l) && <span className="clm-dur">{dur(l)}</span>}
                        </div>
                      </div>
                      <button className="clm-action clm-action--add" onClick={() => addLesson(l)} title="Add to course">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* ── Arrow ── */}
            <div className="clm-arrow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </div>

            {/* ── Course (right) ── */}
            <div
              className={`clm-col clm-col--course ${overTarget === 'course' && dragSrc?.from === 'bank' ? 'clm-col--over' : ''}`}
              onDragOver={onDragOver('course')}
              onDragLeave={onDragLeave}
              onDrop={onDrop('course')}
            >
              <div className="clm-col-hd">
                <span className="clm-col-title">In Course</span>
                <span className="clm-col-count">{inCourse.length}</span>
              </div>
              <div className="clm-col-body">
                {inCourse.length === 0 ? (
                  <div className="clm-drop-hint">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}>
                      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                    </svg>
                    <span>Drop lessons here</span>
                  </div>
                ) : (
                  inCourse.map(l => (
                    <div
                      key={l.id}
                      className={`clm-item clm-item--in ${dragSrc?.lesson.id === l.id ? 'clm-item--dragging' : ''}`}
                      draggable
                      onDragStart={onDragStart(l, 'course')}
                      onDragEnd={onDragEnd}
                    >
                      <div className="clm-item-info">
                        <span className="clm-item-title">{l.title}</span>
                        <div className="clm-item-meta">
                          {cat(l) && <span className="clm-tag">{cat(l)}</span>}
                          {dur(l) && <span className="clm-dur">{dur(l)}</span>}
                        </div>
                      </div>
                      <button className="clm-action clm-action--remove" onClick={() => removeLesson(l)} title="Remove from course">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        <div className="clm-footer">
          <button className="clm-done" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  )
}
