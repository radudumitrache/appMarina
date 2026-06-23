import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import {
  getCourses, getCourse, createCourse, deleteCourse, updateCourse,
  addCourseModule, removeCourseModule, createModule, getModules,
} from '../../../api/modules'
import { getTests, createTest } from '../../../api/tests'
import { getClassCourseProgress, getDiplomas, awardDiploma, revokeDiploma } from '../../../api/departments'
import '../../css/admin/class-detail/AdminCoursesPanel.css'

function initials(name) {
  return (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

// ── Diploma quick-award modal ──────────────────────────────────────────────

function DiplomaModal({ departmentId, student, diplomas, onClose, onDiplomasChange }) {
  const [busy, setBusy]   = useState(false)
  const [err,  setErr]    = useState(null)

  async function toggle(diploma) {
    const awarded = diploma.recipients.some(r => r.id === student.id)
    setBusy(true); setErr(null)
    try {
      let updated
      if (awarded) {
        await revokeDiploma(departmentId, diploma.id, student.id)
        updated = { ...diploma, recipients: diploma.recipients.filter(r => r.id !== student.id), recipient_count: diploma.recipient_count - 1 }
      } else {
        const { data } = await awardDiploma(departmentId, diploma.id, { student_ids: [student.id] })
        updated = data
      }
      onDiplomasChange(prev => prev.map(d => d.id === updated.id ? updated : d))
    } catch { setErr('Could not update.') }
    finally { setBusy(false) }
  }

  return createPortal(
    <div className="acp-modal-overlay" onMouseDown={e => { if (e.target === e.currentTarget && !busy) onClose() }}>
      <div className="acp-modal">
        <div className="acp-modal-hd">
          <div>
            <div className="acp-modal-title">Grant Diploma</div>
            <div className="acp-modal-sub">{student.name}</div>
          </div>
          <button className="acp-modal-close" onClick={onClose} disabled={busy}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        {err && <p className="acp-modal-err">{err}</p>}
        <div className="acp-modal-body">
          {diplomas.length === 0
            ? <p className="acp-modal-empty">No diplomas for this department yet.</p>
            : diplomas.map(d => {
                const awarded = d.recipients.some(r => r.id === student.id)
                return (
                  <div key={d.id} className={`acp-dip-row${awarded ? ' acp-dip-row--awarded' : ''}`}>
                    <div className="acp-dip-info">
                      <span className="acp-dip-name">{d.title}</span>
                      {awarded && <span className="acp-dip-badge">Awarded</span>}
                    </div>
                    <button
                      className={awarded ? 'acp-btn-revoke' : 'acp-btn-award'}
                      onClick={() => toggle(d)}
                      disabled={busy}
                    >
                      {awarded ? 'Revoke' : 'Award'}
                    </button>
                  </div>
                )
              })
          }
        </div>
      </div>
    </div>,
    document.body
  )
}

// ── Progress table ─────────────────────────────────────────────────────────

function gradeColor(grade) {
  if (grade === null || grade === undefined) return 'pending'
  if (grade >= 70) return 'pass'
  if (grade >= 50) return 'warn'
  return 'fail'
}

function ProgressTable({ data, loading, diplomas, onAwardStudent }) {
  if (loading) return <p className="acp-cl-empty">Loading progress…</p>
  if (!data)   return <p className="acp-cl-empty">Could not load progress.</p>

  const { items, students } = data
  if (!students?.length) return <p className="acp-cl-empty">No enrolled students.</p>
  if (!items?.length)    return <p className="acp-cl-empty">This course has no items yet.</p>

  return (
    <div className="acp-ptable-wrap">
      <div className="acp-ptable-scroll">
        <table className="acp-ptable">
          <thead>
            <tr>
              <th className="acp-pth acp-pth--student">Student</th>
              {items.map((item, i) => (
                <th key={`${item.type}-${item.id}`} className={`acp-pth acp-pth--item${item.type === 'test' ? ' acp-pth--test' : ''}`}>
                  <span className="acp-pth-num">{i + 1}</span>
                  <span className="acp-pth-label" title={item.title}>{item.title}</span>
                  {item.type === 'test'
                    ? <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
                    : <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
                  }
                </th>
              ))}
              <th className="acp-pth acp-pth--score">Score</th>
              <th className="acp-pth acp-pth--act" />
            </tr>
          </thead>
          <tbody>
            {students.map(s => {
              const completedModules = new Set(s.module_completed ?? [])
              const testGrades       = s.test_grades ?? {}
              let done = 0
              items.forEach(item => {
                if (item.type === 'module' && completedModules.has(item.id)) done++
                else if (item.type === 'test' && String(item.id) in testGrades) done++
              })
              const total  = items.length
              const pct    = total > 0 ? Math.round((done / total) * 100) : 0
              const allDone = total > 0 && done === total

              return (
                <tr key={s.id} className={`acp-ptr${allDone ? ' acp-ptr--done' : ''}`}>
                  <td className="acp-ptd acp-ptd--student">
                    <div className={`acp-ptavatar${allDone ? ' acp-ptavatar--done' : ''}`}>{initials(s.name)}</div>
                    <span className="acp-pt-name">{s.name}</span>
                  </td>

                  {items.map(item => {
                    if (item.type === 'module') {
                      const d = completedModules.has(item.id)
                      return (
                        <td key={`${item.type}-${item.id}`} className="acp-ptd acp-ptd--cell">
                          {d
                            ? <span className="acp-ptcheck"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>
                            : <span className="acp-ptdash" />
                          }
                        </td>
                      )
                    }
                    const key       = String(item.id)
                    const submitted = key in testGrades
                    const grade     = testGrades[key]
                    const color     = submitted ? gradeColor(grade) : 'none'
                    return (
                      <td key={`${item.type}-${item.id}`} className="acp-ptd acp-ptd--cell">
                        {submitted
                          ? <span className={`acp-ptgrade acp-ptgrade--${color}`}>{grade !== null && grade !== undefined ? `${Math.round(grade)}%` : 'Pending'}</span>
                          : <span className="acp-ptdash" />
                        }
                      </td>
                    )
                  })}

                  <td className="acp-ptd acp-ptd--score">
                    <div className="acp-pt-score-wrap">
                      <div className="acp-pt-bar">
                        <div className={`acp-pt-bar-fill${allDone ? ' acp-pt-bar-fill--done' : ''}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className={`acp-pt-label${allDone ? ' acp-pt-label--done' : ''}`}>{done}/{total}</span>
                    </div>
                  </td>

                  <td className="acp-ptd acp-ptd--act">
                    <button className="acp-pt-dip-btn" onClick={() => onAwardStudent(s.id, s.name)} title="Grant diploma">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="8" r="6"/>
                        <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
                      </svg>
                      Diploma
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Main panel ─────────────────────────────────────────────────────────────

export default function AdminCoursesPanel({ departmentId }) {
  const navigate = useNavigate()

  const [courses,        setCourses]        = useState([])
  const [courseItems,    setCourseItems]    = useState({})   // courseId → [{id, cmId, title, itemType, moduleId, testId}]
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [expanded,       setExpanded]       = useState(new Set())
  const [courseViews,    setCourseViews]    = useState({})   // courseId → 'items' | 'progress'
  const [confirmDel,     setConfirmDel]     = useState(null) // courseId
  const [confirmItem,    setConfirmItem]    = useState(null) // {courseId, cmId}
  const [progressData,   setProgressData]   = useState({})
  const [progressLoading, setProgressLoading] = useState(new Set())
  const [diplomas,       setDiplomas]       = useState([])
  const [diplomasLoaded, setDiplomasLoaded] = useState(false)
  const [awardTarget,    setAwardTarget]    = useState(null)

  // Inline create course
  const [creatingCourse, setCreatingCourse] = useState(false)
  const [newCourseTitle, setNewCourseTitle] = useState('')
  const [savingCourse,   setSavingCourse]   = useState(false)
  const newCourseTitleRef = useRef(null)

  // Add-items panel state per course: { open, tab, search, creating, createTitle, saving }
  const [addPanels,    setAddPanels]    = useState({})
  const [allModules,   setAllModules]   = useState(null)
  const [allTests,     setAllTests]     = useState(null)
  const [itemsLoading, setItemsLoading] = useState(false)

  // ── Load courses ────────────────────────────────────
  useEffect(() => {
    getCourses().then(res => {
      const deptId = Number(departmentId)
      const list   = (res.data ?? []).filter(c => c.department_ids?.includes(deptId))
      setCourses(list)
      setLoadingCourses(false)
      list.forEach(c => fetchCourseItems(c.id))
    }).catch(() => setLoadingCourses(false))
  }, [departmentId])

  function fetchCourseItems(courseId) {
    getCourse(courseId).then(detail => {
      const items = (detail.data.modules ?? []).map(cl => ({
        id:       cl.id,
        cmId:     cl.id,
        moduleId: cl.module  ?? null,
        testId:   cl.test    ?? null,
        title:    cl.module_detail?.title ?? cl.test_detail?.title ?? '(untitled)',
        itemType: cl.test_detail ? 'test' : 'module',
      }))
      setCourseItems(prev => ({ ...prev, [courseId]: items }))
    }).catch(() => {})
  }

  // ── Expand / collapse ───────────────────────────────
  function toggleExpand(id) {
    setExpanded(prev => {
      const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next
    })
  }

  // ── Course views ────────────────────────────────────
  function getView(id) { return courseViews[id] || 'items' }

  async function switchToProgress(courseId) {
    setCourseViews(prev => ({ ...prev, [courseId]: 'progress' }))
    if (!progressData[courseId] && !progressLoading.has(courseId)) {
      setProgressLoading(prev => new Set([...prev, courseId]))
      try {
        const { data } = await getClassCourseProgress(departmentId, courseId)
        setProgressData(prev => ({ ...prev, [courseId]: data }))
      } catch {} finally {
        setProgressLoading(prev => { const n = new Set(prev); n.delete(courseId); return n })
      }
    }
    if (!diplomasLoaded) {
      try { const { data } = await getDiplomas(departmentId); setDiplomas(data) }
      catch {} finally { setDiplomasLoaded(true) }
    }
  }

  // ── Create course ───────────────────────────────────
  const openCreate = () => {
    setCreatingCourse(true); setNewCourseTitle('')
    setTimeout(() => newCourseTitleRef.current?.focus(), 40)
  }

  async function handleCreateCourse(e) {
    e?.preventDefault()
    if (!newCourseTitle.trim()) return
    setSavingCourse(true)
    try {
      const { data } = await createCourse({ title: newCourseTitle.trim(), status: 'draft', department_id: departmentId })
      setCourses(prev => [data, ...prev])
      setCourseItems(prev => ({ ...prev, [data.id]: [] }))
      setExpanded(prev => new Set([...prev, data.id]))
      setCreatingCourse(false); setNewCourseTitle('')
    } finally { setSavingCourse(false) }
  }

  // ── Delete course ───────────────────────────────────
  async function handleDeleteCourse(courseId) {
    await deleteCourse(courseId)
    setCourses(prev => prev.filter(c => c.id !== courseId))
    setConfirmDel(null)
  }

  // ── Publish toggle ──────────────────────────────────
  async function handleToggleStatus(course) {
    const next = course.status === 'published' ? 'draft' : 'published'
    setCourses(prev => prev.map(c => c.id === course.id ? { ...c, status: next } : c))
    try { await updateCourse(course.id, { status: next }) }
    catch { setCourses(prev => prev.map(c => c.id === course.id ? { ...c, status: course.status } : c)) }
  }

  // ── Remove item from course ─────────────────────────
  async function handleRemoveItem(courseId, cmId) {
    setCourseItems(prev => ({ ...prev, [courseId]: (prev[courseId] ?? []).filter(i => i.cmId !== cmId) }))
    setConfirmItem(null)
    try { await removeCourseModule(courseId, cmId) }
    catch { fetchCourseItems(courseId) }
  }

  // ── Add-items panel helpers ─────────────────────────
  function getAddPanel(courseId) {
    return addPanels[courseId] ?? { open: false, tab: 'modules', search: '', creating: false, createTitle: '', saving: false }
  }

  function setAddPanel(courseId, patch) {
    setAddPanels(prev => ({ ...prev, [courseId]: { ...getAddPanel(courseId), ...patch } }))
  }

  async function openAddPanel(courseId) {
    const current = getAddPanel(courseId)
    if (!current.open) {
      setAddPanel(courseId, { open: true })
      if (!allModules && !itemsLoading) {
        setItemsLoading(true)
        const [modRes, tstRes] = await Promise.allSettled([getModules(), getTests()])
        setAllModules(modRes.status === 'fulfilled' ? (modRes.value.data ?? []) : [])
        setAllTests(tstRes.status === 'fulfilled'  ? (tstRes.value.data ?? [])  : [])
        setItemsLoading(false)
      }
    } else {
      setAddPanel(courseId, { open: false, creating: false })
    }
  }

  async function addItemToCourse(courseId, item) {
    const key      = item.itemType === 'test' ? 'test' : 'module'
    const optimistic = { id: null, cmId: null, moduleId: item.itemType === 'module' ? item.id : null, testId: item.itemType === 'test' ? item.id : null, title: item.title, itemType: item.itemType }
    setCourseItems(prev => ({ ...prev, [courseId]: [...(prev[courseId] ?? []), optimistic] }))
    try {
      const { data } = await addCourseModule(courseId, { [key]: item.id })
      setCourseItems(prev => ({
        ...prev,
        [courseId]: (prev[courseId] ?? []).map(i => i.cmId === null && i.title === item.title && i.itemType === item.itemType
          ? { ...i, id: data.id, cmId: data.id }
          : i
        ),
      }))
    } catch {
      setCourseItems(prev => ({ ...prev, [courseId]: (prev[courseId] ?? []).filter(i => i.cmId !== null) }))
    }
  }

  async function handleCreateModule(courseId) {
    const panel = getAddPanel(courseId)
    if (!panel.createTitle.trim()) return
    setAddPanel(courseId, { saving: true })
    try {
      const { data: mod } = await createModule({ title: panel.createTitle.trim(), visibility: 'public' })
      setAllModules(prev => [...(prev ?? []), mod])
      await addItemToCourse(courseId, { id: mod.id, title: mod.title, itemType: 'module' })
      setAddPanel(courseId, { saving: false, creating: false, createTitle: '' })
      navigate(`/admin/modules/${mod.id}/panels`)
    } catch { setAddPanel(courseId, { saving: false }) }
  }

  async function handleCreateTest(courseId) {
    const panel = getAddPanel(courseId)
    if (!panel.createTitle.trim()) return
    setAddPanel(courseId, { saving: true })
    try {
      const { data: test } = await createTest({ title: panel.createTitle.trim(), status: 'draft' })
      setAllTests(prev => [...(prev ?? []), test])
      await addItemToCourse(courseId, { id: test.id, title: test.title, itemType: 'test' })
      setAddPanel(courseId, { saving: false, creating: false, createTitle: '' })
      navigate(`/admin/tests`)
    } catch { setAddPanel(courseId, { saving: false }) }
  }

  // ── Render ──────────────────────────────────────────
  return (
    <div className="acp">
      {/* Panel header */}
      <div className="acp-hd">
        <div className="acp-hd-left">
          <span className="acp-hd-title">Courses</span>
          <span className="acp-hd-count">{courses.length}</span>
        </div>
        <button className="acp-new-btn" onClick={openCreate}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Course
        </button>
      </div>

      {/* Inline create course */}
      {creatingCourse && (
        <form className="acp-create-row" onSubmit={handleCreateCourse}>
          <input
            ref={newCourseTitleRef}
            className="acp-create-input"
            placeholder="Course title…"
            value={newCourseTitle}
            onChange={e => setNewCourseTitle(e.target.value)}
          />
          <button className="acp-confirm-btn acp-confirm-btn--primary" type="submit" disabled={savingCourse}>
            {savingCourse ? '…' : 'Create'}
          </button>
          <button className="acp-confirm-btn" type="button" onClick={() => setCreatingCourse(false)}>Cancel</button>
        </form>
      )}

      {/* Courses list */}
      <div className="acp-courses">
        {loadingCourses ? (
          <p className="acp-empty">Loading…</p>
        ) : courses.length === 0 && !creatingCourse ? (
          <p className="acp-empty">No courses yet — click <strong>New Course</strong> to create one.</p>
        ) : courses.map(course => {
          const isExpanded = expanded.has(course.id)
          const isDelConf  = confirmDel === course.id
          const items      = courseItems[course.id]
          const view       = getView(course.id)
          const addPanel   = getAddPanel(course.id)

          // Compute items not yet in course for the add panel
          const inModIds = new Set((items ?? []).filter(i => i.itemType === 'module').map(i => i.moduleId))
          const inTstIds = new Set((items ?? []).filter(i => i.itemType === 'test').map(i => i.testId))
          const searchQ  = addPanel.search.toLowerCase().trim()
          const filteredModules = (allModules ?? []).filter(m => !inModIds.has(m.id) && (!searchQ || m.title.toLowerCase().includes(searchQ)))
          const filteredTests   = (allTests   ?? []).filter(t => !inTstIds.has(t.id) && (!searchQ || t.title.toLowerCase().includes(searchQ)))

          return (
            <div key={course.id} className="acp-course-block">
              {/* Course row */}
              <div className="acp-course-row">
                <button className="acp-toggle" onClick={() => toggleExpand(course.id)}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform .18s ease' }}>
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>

                <div className="acp-course-info">
                  <button
                    className="acp-course-title"
                    onClick={() => navigate(`/admin/courses/${course.id}`)}
                    title="Open course detail"
                  >
                    {course.title}
                  </button>
                  <span className={`acp-status acp-status--${course.status}`}>{course.status}</span>
                  {items && <span className="acp-item-count">{items.length} item{items.length !== 1 ? 's' : ''}</span>}
                </div>

                <div className="acp-course-actions">
                  <button
                    className={`acp-publish-btn acp-publish-btn--${course.status}`}
                    onClick={() => handleToggleStatus(course)}
                  >
                    {course.status === 'published' ? 'Unpublish' : 'Publish'}
                  </button>

                  {isDelConf ? (
                    <div className="acp-inline-confirm">
                      <span className="acp-confirm-label">Delete?</span>
                      <button className="acp-icon-btn acp-icon-btn--danger" onClick={() => handleDeleteCourse(course.id)}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </button>
                      <button className="acp-icon-btn" onClick={() => setConfirmDel(null)}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                  ) : (
                    <button className="acp-icon-btn" onClick={() => setConfirmDel(course.id)} title="Delete course">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        <path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div className="acp-expanded">
                  {/* Inner tab bar */}
                  <div className="acp-inner-tabs">
                    <button className={`acp-inner-tab${view === 'items' ? ' acp-inner-tab--active' : ''}`}
                      onClick={() => setCourseViews(prev => ({ ...prev, [course.id]: 'items' }))}>
                      Items
                    </button>
                    <button className={`acp-inner-tab${view === 'progress' ? ' acp-inner-tab--active' : ''}`}
                      onClick={() => switchToProgress(course.id)}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
                      </svg>
                      Student Progress
                    </button>
                  </div>

                  {/* Items view */}
                  {view === 'items' && (
                    <div className="acp-items-view">
                      {/* Item list */}
                      <div className="acp-item-list">
                        {!items ? (
                          <p className="acp-cl-empty">Loading…</p>
                        ) : items.length === 0 ? (
                          <p className="acp-cl-empty">No items yet — add modules or tests below.</p>
                        ) : (
                          items.map((item, idx) => {
                            const isConf = confirmItem?.courseId === course.id && confirmItem?.cmId === item.cmId
                            return (
                              <div key={item.cmId ?? idx} className="acp-item-row">
                                <span className="acp-item-num">{idx + 1}</span>
                                {item.itemType === 'module' && item.moduleId ? (
                                  <button className="acp-item-title acp-item-title--link"
                                    onClick={() => navigate(`/admin/modules/${item.moduleId}/panels`)}>
                                    {item.title}
                                  </button>
                                ) : item.itemType === 'test' && item.testId ? (
                                  <button className="acp-item-title acp-item-title--link"
                                    onClick={() => navigate('/admin/tests', { state: { openTestId: item.testId } })}>
                                    {item.title}
                                  </button>
                                ) : (
                                  <span className="acp-item-title">{item.title}</span>
                                )}
                                <span className={`acp-item-type acp-item-type--${item.itemType}`}>
                                  {item.itemType === 'test' ? 'Test' : 'Module'}
                                </span>
                                <div className="acp-item-actions">
                                  {isConf ? (
                                    <div className="acp-inline-confirm">
                                      <span className="acp-confirm-label">Remove?</span>
                                      <button className="acp-icon-btn acp-icon-btn--danger" onClick={() => handleRemoveItem(course.id, item.cmId)}>
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                      </button>
                                      <button className="acp-icon-btn" onClick={() => setConfirmItem(null)}>
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                      </button>
                                    </div>
                                  ) : (
                                    <button className="acp-icon-btn" title="Remove from course"
                                      onClick={() => setConfirmItem({ courseId: course.id, cmId: item.cmId })}>
                                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                        <path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                                      </svg>
                                    </button>
                                  )}
                                </div>
                              </div>
                            )
                          })
                        )}
                      </div>

                      {/* Add-items panel */}
                      <div className="acp-add-section">
                        <button className="acp-add-toggle" onClick={() => openAddPanel(course.id)}>
                          {addPanel.open ? (
                            <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Close</>
                          ) : (
                            <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add Items</>
                          )}
                        </button>

                        {addPanel.open && (
                          <div className="acp-add-panel">
                            {/* Tab switcher */}
                            <div className="acp-add-tabs">
                              {['modules', 'tests'].map(t => (
                                <button key={t} className={`acp-add-tab${addPanel.tab === t ? ' acp-add-tab--active' : ''}`}
                                  onClick={() => setAddPanel(course.id, { tab: t, search: '', creating: false })}>
                                  {t === 'modules' ? 'Modules' : 'Tests'}
                                </button>
                              ))}
                            </div>

                            {/* Search */}
                            <div className="acp-add-search-box">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                              </svg>
                              <input
                                className="acp-add-search"
                                placeholder={addPanel.tab === 'modules' ? 'Search modules…' : 'Search tests…'}
                                value={addPanel.search}
                                onChange={e => setAddPanel(course.id, { search: e.target.value })}
                              />
                            </div>

                            {/* Available items */}
                            <div className="acp-add-list">
                              {itemsLoading ? (
                                <p className="acp-add-empty">Loading…</p>
                              ) : addPanel.tab === 'modules' ? (
                                filteredModules.length === 0
                                  ? <p className="acp-add-empty">{searchQ ? 'No modules match.' : 'All modules already added.'}</p>
                                  : filteredModules.slice(0, 12).map(m => (
                                    <button key={m.id} className="acp-add-item" onClick={() => addItemToCourse(course.id, { id: m.id, title: m.title, itemType: 'module' })}>
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
                                      </svg>
                                      <span className="acp-add-item-title">{m.title}</span>
                                      <svg className="acp-add-plus" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                                      </svg>
                                    </button>
                                  ))
                              ) : (
                                filteredTests.length === 0
                                  ? <p className="acp-add-empty">{searchQ ? 'No tests match.' : 'All tests already added.'}</p>
                                  : filteredTests.slice(0, 12).map(t => (
                                    <button key={t.id} className="acp-add-item" onClick={() => addItemToCourse(course.id, { id: t.id, title: t.title, itemType: 'test' })}>
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                                      </svg>
                                      <span className="acp-add-item-title">{t.title}</span>
                                      <svg className="acp-add-plus" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                                      </svg>
                                    </button>
                                  ))
                              )}
                            </div>

                            {/* Create new */}
                            <div className="acp-add-create">
                              {!addPanel.creating ? (
                                <button className="acp-create-new-btn" onClick={() => setAddPanel(course.id, { creating: true, createTitle: '' })}>
                                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                                  </svg>
                                  Create new {addPanel.tab === 'modules' ? 'module' : 'test'}
                                </button>
                              ) : (
                                <form className="acp-create-inline" onSubmit={e => { e.preventDefault(); addPanel.tab === 'modules' ? handleCreateModule(course.id) : handleCreateTest(course.id) }}>
                                  <input
                                    autoFocus
                                    className="acp-create-inline-input"
                                    placeholder={addPanel.tab === 'modules' ? 'Module title…' : 'Test title…'}
                                    value={addPanel.createTitle}
                                    onChange={e => setAddPanel(course.id, { createTitle: e.target.value })}
                                  />
                                  <button className="acp-confirm-btn acp-confirm-btn--primary" type="submit" disabled={addPanel.saving}>
                                    {addPanel.saving ? '…' : 'Create & open editor'}
                                  </button>
                                  <button className="acp-confirm-btn" type="button" onClick={() => setAddPanel(course.id, { creating: false })}>Cancel</button>
                                </form>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Progress view */}
                  {view === 'progress' && (
                    <ProgressTable
                      data={progressData[course.id]}
                      loading={progressLoading.has(course.id)}
                      diplomas={diplomas}
                      onAwardStudent={(sid, sname) => setAwardTarget({ id: sid, name: sname })}
                    />
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {awardTarget && (
        <DiplomaModal
          departmentId={departmentId}
          student={awardTarget}
          diplomas={diplomas}
          onClose={() => setAwardTarget(null)}
          onDiplomasChange={setDiplomas}
        />
      )}
    </div>
  )
}
