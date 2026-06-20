import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { getCourse, getModules, addCourseModule, removeCourseModule } from '../../../api/modules'
import { getTests } from '../../../api/tests'
import '../../css/trainer/class-detail/CourseModuleModal.css'

export default function CourseModuleModal({ course, classModules, departmentId, onClose }) {
  const [tab,        setTab]        = useState('modules')
  const [inCourse,   setInCourse]   = useState([])
  const [allModules, setAllModules] = useState([])
  const [allTests,   setAllTests]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [dragSrc,    setDragSrc]    = useState(null)
  const [overTarget, setOverTarget] = useState(null)

  useEffect(() => {
    const classIds = new Set(classModules.map(l => l.id))

    Promise.all([
      getCourse(course.id),
      getModules({ visibility: 'public' }),
      departmentId ? getTests({ class: departmentId }) : Promise.resolve({ data: [] }),
    ]).then(([courseRes, publicRes, testsRes]) => {
      const clMap = new Map(classModules.map(l => [l.id, l]))
      const loaded = (courseRes.data.modules ?? []).map(cl => {
        if (cl.test_detail) {
          return { cmId: cl.id, id: cl.test_detail.id, title: cl.test_detail.title, itemType: 'test' }
        }
        if (cl.module_detail) {
          const fromClass = clMap.get(cl.module_detail.id)
          return {
            cmId: cl.id,
            id: cl.module_detail.id,
            title: cl.module_detail.title,
            duration: cl.module_detail.duration_minutes ? `${cl.module_detail.duration_minutes} min` : '',
            source: fromClass ? 'class' : 'public',
            itemType: 'module',
          }
        }
        return null
      }).filter(Boolean)
      setInCourse(loaded)

      const inCourseModuleIds = new Set(loaded.filter(i => i.itemType === 'module').map(i => i.id))
      const publicModules = (publicRes.data ?? [])
        .filter(l => !classIds.has(l.id) && !inCourseModuleIds.has(l.id))
        .map(l => ({ id: l.id, title: l.title, duration: l.duration_minutes ? `${l.duration_minutes} min` : '', source: 'public', itemType: 'module' }))
      setAllModules([
        ...classModules.map(l => ({ id: l.id, title: l.title, duration: l.duration_minutes ? `${l.duration_minutes} min` : '', source: 'class', itemType: 'module' })),
        ...publicModules,
      ])

      setAllTests((testsRes.data ?? []).map(t => ({ id: t.id, title: t.title, itemType: 'test' })))
    }).finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const inCourseModuleIds = new Set(inCourse.filter(i => i.itemType === 'module').map(i => i.id))
  const inCourseTestIds   = new Set(inCourse.filter(i => i.itemType === 'test').map(i => i.id))
  const availableModules  = allModules.filter(l => !inCourseModuleIds.has(l.id))
  const availableTests    = allTests.filter(t => !inCourseTestIds.has(t.id))

  const addItem = async (item) => {
    const key = item.itemType === 'test' ? 'test' : 'module'
    const optimistic = { ...item, cmId: null }
    setInCourse(prev => [...prev, optimistic])
    try {
      const res = await addCourseModule(course.id, { [key]: item.id })
      setInCourse(prev => prev.map(i =>
        i.id === item.id && i.itemType === item.itemType && i.cmId === null
          ? { ...i, cmId: res.data.id }
          : i
      ))
    } catch {
      setInCourse(prev => prev.filter(i => !(i.id === item.id && i.itemType === item.itemType && i.cmId === null)))
    }
  }

  const removeItem = async (item) => {
    if (!item.cmId) return
    setInCourse(prev => prev.filter(i => i.cmId !== item.cmId))
    try { await removeCourseModule(course.id, item.cmId) }
    catch { setInCourse(prev => [...prev, item]) }
  }

  // -- drag handlers -------------------------------------------------------
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
    if (target === 'course' && dragSrc.from === 'bank') addItem(dragSrc.item)
    if (target === 'bank'   && dragSrc.from === 'course') removeItem(dragSrc.item)
    setDragSrc(null)
  }

  const availableNow = tab === 'modules' ? availableModules : availableTests

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

        <p className="clm-hint">Drag items into the course, or click the <strong>+</strong> / <strong>&times;</strong> buttons.</p>

        {loading ? (
          <div className="clm-loading">Loading...</div>
        ) : (
          <div className="clm-body">

            {/* -- Item bank (left) -- */}
            <div
              className={`clm-col ${overTarget === 'bank' && dragSrc?.from === 'course' ? 'clm-col--over' : ''}`}
              onDragOver={onDragOver('bank')}
              onDragLeave={onDragLeave}
              onDrop={onDrop('bank')}
            >
              <div className="clm-col-hd">
                <div className="clm-tab-bar">
                  <button
                    className={`clm-tab${tab === 'modules' ? ' clm-tab--active' : ''}`}
                    onClick={() => setTab('modules')}
                  >
                    Modules
                  </button>
                  <button
                    className={`clm-tab${tab === 'tests' ? ' clm-tab--active' : ''}`}
                    onClick={() => setTab('tests')}
                  >
                    Tests
                  </button>
                </div>
                <span className="clm-col-count">{availableNow.length}</span>
              </div>
              <div className="clm-col-body">
                {availableNow.length === 0 ? (
                  <p className="clm-empty">
                    {tab === 'modules' ? 'All modules added to course' : 'All tests added to course'}
                  </p>
                ) : (
                  availableNow.map(l => (
                    <div
                      key={`${l.itemType}-${l.id}`}
                      className={`clm-item ${dragSrc?.item.id === l.id && dragSrc?.item.itemType === l.itemType ? 'clm-item--dragging' : ''}`}
                      draggable
                      onDragStart={onDragStart(l, 'bank')}
                      onDragEnd={onDragEnd}
                    >
                      <div className="clm-item-info">
                        <span className="clm-item-title">{l.title}</span>
                        <div className="clm-item-meta">
                          {l.duration && <span className="clm-dur">{l.duration}</span>}
                          {l.source === 'public' && <span className="clm-tag clm-tag--public">PUBLIC</span>}
                        </div>
                      </div>
                      <button className="clm-action clm-action--add" onClick={() => addItem(l)} title="Add to course">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* -- Arrow -- */}
            <div className="clm-arrow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </div>

            {/* -- Course (right) -- */}
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
                    <span>Drop items here</span>
                  </div>
                ) : (
                  inCourse.map(l => (
                    <div
                      key={`${l.itemType}-${l.id}`}
                      className={`clm-item clm-item--in ${dragSrc?.item.id === l.id && dragSrc?.item.itemType === l.itemType ? 'clm-item--dragging' : ''}`}
                      draggable
                      onDragStart={onDragStart(l, 'course')}
                      onDragEnd={onDragEnd}
                    >
                      <div className="clm-item-info">
                        <span className="clm-item-title">{l.title}</span>
                        <div className="clm-item-meta">
                          {l.duration && <span className="clm-dur">{l.duration}</span>}
                          {l.itemType === 'test' && <span className="clm-tag clm-tag--test">TEST</span>}
                        </div>
                      </div>
                      <button
                        className="clm-action clm-action--remove"
                        onClick={() => removeItem(l)}
                        disabled={!l.cmId}
                        title="Remove from course"
                      >
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
