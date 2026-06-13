import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { getCourse, getModules, addCourseModule, removeCourseModule } from '../../../api/modules'
import '../../css/teacher/class-detail/CourseModuleModal.css'

export default function CourseModuleModal({ course, classModules, onClose }) {
  const [inCourse,  setInCourse]  = useState([])
  const [allModules, setAllModules] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [dragSrc,   setDragSrc]   = useState(null)
  const [overTarget, setOverTarget] = useState(null)

  useEffect(() => {
    const classIds = new Set(classModules.map(l => l.id))

    Promise.all([
      getCourse(course.id),
      getModules({ visibility: 'public' }),
    ]).then(([courseRes, publicRes]) => {
      // Build inCourse list
      const clMap = new Map(classModules.map(l => [l.id, l]))
      const loaded = (courseRes.data.modules ?? []).map(cl => {
        const id = cl.module_detail?.id ?? cl.id
        return clMap.get(id) ?? { id, title: cl.module_detail?.title ?? 'â€”', duration: cl.module_detail?.duration_minutes ? `${cl.module_detail.duration_minutes} min` : 'â€”' }
      }).filter(Boolean)
      setInCourse(loaded)

      // Merge class lessons + public lessons, deduped
      const publicModules = (publicRes.data ?? [])
        .filter(l => !classIds.has(l.id))
        .map(l => ({ id: l.id, title: l.title, duration: l.duration_minutes ? `${l.duration_minutes} min` : 'â€”', source: 'public' }))

      setAllModules([
        ...classModules.map(l => ({ ...l, source: 'class' })),
        ...publicModules,
      ])
    }).finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const available = allModules.filter(l => !inCourse.some(c => c.id === l.id))

  const addModule = async (item) => {
    if (inCourse.some(l => l.id === item.id)) return
    setInCourse(prev => [...prev, item])
    try { await addCourseModule(course.id, { module: item.id }) }
    catch { setInCourse(prev => prev.filter(l => l.id !== item.id)) }
  }

  const removeModule = async (item) => {
    setInCourse(prev => prev.filter(l => l.id !== item.id))
    try { await removeCourseModule(course.id, item.id) }
    catch { setInCourse(prev => [...prev, item]) }
  }

  // â”€â”€ drag handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const onDragStart = (dragItem, from) => (e) => {
    setDragSrc({ item: dragItem, from })
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
    if (target === 'course' && dragSrc.from === 'bank') addModule(dragSrc.item)
    if (target === 'bank'   && dragSrc.from === 'course') removeModule(dragSrc.item)
    setDragSrc(null)
  }

  const dur = l => l.duration ?? (l.duration_minutes ? `${l.duration_minutes} min` : '')

  return createPortal(
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

        <p className="clm-hint">Drag modules into the course, or click the <strong>+</strong> / <strong>Ã—</strong> buttons.</p>

        {loading ? (
          <div className="clm-loading">Loadingâ€¦</div>
        ) : (
          <div className="clm-body">

            {/* â”€â”€ Lesson bank (left) â”€â”€ */}
            <div
              className={`clm-col ${overTarget === 'bank' && dragSrc?.from === 'course' ? 'clm-col--over' : ''}`}
              onDragOver={onDragOver('bank')}
              onDragLeave={onDragLeave}
              onDrop={onDrop('bank')}
            >
              <div className="clm-col-hd">
                <span className="clm-col-title">Available Modules</span>
                <span className="clm-col-count">{available.length}</span>
              </div>
              <div className="clm-col-body">
                {available.length === 0 ? (
                  <p className="clm-empty">All modules added to course</p>
                ) : (
                  available.map(l => (
                    <div
                      key={l.id}
                      className={`clm-item ${dragSrc?.item.id === l.id ? 'clm-item--dragging' : ''}`}
                      draggable
                      onDragStart={onDragStart(l, 'bank')}
                      onDragEnd={onDragEnd}
                    >
                      <div className="clm-item-info">
                        <span className="clm-item-title">{l.title}</span>
                        <div className="clm-item-meta">
                          {dur(l) && <span className="clm-dur">{dur(l)}</span>}
                          {l.source === 'public' && <span className="clm-tag clm-tag--public">PUBLIC</span>}
                        </div>
                      </div>
                      <button className="clm-action clm-action--add" onClick={() => addModule(l)} title="Add to course">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* â”€â”€ Arrow â”€â”€ */}
            <div className="clm-arrow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </div>

            {/* â”€â”€ Course (right) â”€â”€ */}
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
                    <span>Drop modules here</span>
                  </div>
                ) : (
                  inCourse.map(l => (
                    <div
                      key={l.id}
                      className={`clm-item clm-item--in ${dragSrc?.item.id === l.id ? 'clm-item--dragging' : ''}`}
                      draggable
                      onDragStart={onDragStart(l, 'course')}
                      onDragEnd={onDragEnd}
                    >
                      <div className="clm-item-info">
                        <span className="clm-item-title">{l.title}</span>
                        <div className="clm-item-meta">
                          {dur(l) && <span className="clm-dur">{dur(l)}</span>}
                        </div>
                      </div>
                      <button className="clm-action clm-action--remove" onClick={() => removeModule(l)} title="Remove from course">
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
    </div>,
    document.body
  )
}
