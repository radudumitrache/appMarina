import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { getCourses, getCourse, createCourse, deleteCourse, updateCourse, removeCourseModule } from '../../../api/modules'
import { getDiplomas, awardDiploma, revokeDiploma, getClassCourseProgress } from '../../../api/departments'
import CourseModuleModal from './CourseModuleModal'
import '../../css/teacher/class-detail/ModulesCoursesTab.css'

function initials(name) {
  return (name || '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

// Quick diploma award modal

function QuickAwardModal({ classId, student, diplomas, onClose, onDiplomasChange }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  async function toggle(diploma) {
    const isAwarded = diploma.recipients.some(r => r.id === student.id)
    setBusy(true); setError(null)
    try {
      let updated
      if (isAwarded) {
        await revokeDiploma(classId, diploma.id, student.id)
        updated = {
          ...diploma,
          recipients: diploma.recipients.filter(r => r.id !== student.id),
          recipient_count: diploma.recipient_count - 1,
        }
      } else {
        const { data } = await awardDiploma(classId, diploma.id, { student_ids: [student.id] })
        updated = data
      }
      onDiplomasChange(prev => prev.map(d => d.id === updated.id ? updated : d))
    } catch {
      setError('Could not update. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return createPortal(
    <div className="lct-qa-overlay" onMouseDown={e => { if (e.target === e.currentTarget && !busy) onClose() }}>
      <div className="lct-qa-modal">
        <div className="lct-qa-header">
          <div className="lct-qa-header-left">
            <span className="lct-qa-title">Grant Diploma</span>
            <span className="lct-qa-student">{student.name}</span>
          </div>
          <button className="lct-qa-close" onClick={onClose} disabled={busy}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {error && <p className="lct-qa-error">{error}</p>}

        <div className="lct-qa-body">
          {diplomas.length === 0 ? (
            <p className="lct-qa-empty">No diplomas created for this class yet.</p>
          ) : (
            diplomas.map(d => {
              const isAwarded = d.recipients.some(r => r.id === student.id)
              return (
                <div key={d.id} className={`lct-qa-row${isAwarded ? ' lct-qa-row--awarded' : ''}`}>
                  <div className="lct-qa-dip-info">
                    <span className="lct-qa-dip-title">{d.title}</span>
                    {isAwarded && <span className="lct-qa-awarded-badge">Awarded</span>}
                  </div>
                  <button
                    className={isAwarded ? 'lct-qa-revoke-btn' : 'lct-qa-award-btn'}
                    onClick={() => toggle(d)}
                    disabled={busy}
                  >
                    {isAwarded ? 'Revoke' : 'Award'}
                  </button>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

// Per-course progress view

function CourseProgressView({ data, loading, diplomas, onAwardStudent }) {
  if (loading || !data) {
    return <p className="lct-cl-empty">Loading progress...</p>
  }

  const { modules, students } = data

  if (students.length === 0) {
    return <p className="lct-cl-empty">No enrolled students in this class.</p>
  }

  if (modules.length === 0) {
    return <p className="lct-cl-empty">This course has no modules yet.</p>
  }

  const useDots = modules.length <= 12

  return (
    <div className="lct-progress-wrap">
      {useDots && (
        <div className="lct-progress-legend">
          {modules.map((l, i) => (
            <span key={l.id} className="lct-progress-legend-item" title={l.title}>
              <span className="lct-progress-legend-num">{i + 1}</span>
              <span className="lct-progress-legend-label">{l.title}</span>
            </span>
          ))}
        </div>
      )}

      <div className="lct-progress-list">
        {students.map(s => {
          const completedSet = new Set(s.completed)
          const doneCount = s.completed.length
          const total = modules.length
          const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0
          const allDone = total > 0 && doneCount === total

          return (
            <div key={s.id} className="lct-progress-row">
              <div className={`lct-progress-avatar${allDone ? ' lct-progress-avatar--done' : ''}`}>
                {initials(s.name)}
              </div>
              <span className="lct-progress-name">{s.name}</span>

              {useDots ? (
                <div className="lct-progress-dots">
                  {modules.map(l => (
                    <span
                      key={l.id}
                      className={`lct-progress-dot${completedSet.has(l.id) ? ' lct-progress-dot--done' : ''}`}
                      title={`${l.title}: ${completedSet.has(l.id) ? 'Completed' : 'Not completed'}`}
                    />
                  ))}
                </div>
              ) : (
                <div className="lct-progress-bar-wrap">
                  <div className="lct-mini-bar">
                    <div
                      className={`lct-mini-fill${allDone ? ' lct-mini-fill--done' : ''}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )}

              <span className={`lct-progress-count${allDone ? ' lct-progress-count--done' : ''}`}>
                {doneCount}/{total}
              </span>

              <button
                className="lct-progress-award-btn"
                onClick={() => onAwardStudent(s.id, s.name)}
                title="Grant diploma"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="6"/>
                  <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
                </svg>
                Diploma
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Main tab

export default function ModulesCoursesTab({ departmentId, classModules, onNewModule, onModuleUpdate }) {
  const navigate = useNavigate()
  const [courses, setCourses]               = useState([])
  const [courseModules, setCourseModules]   = useState({})
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [creatingCourse, setCreatingCourse] = useState(false)
  const [newTitle, setNewTitle]             = useState('')
  const [savingCourse, setSavingCourse]     = useState(false)
  const [confirmCourse, setConfirmCourse]   = useState(null)
  const [managingCourse, setManagingCourse] = useState(null)
  const [expandedCourses, setExpandedCourses] = useState(new Set())
  const [confirmCourseModule, setConfirmCourseModule] = useState(null)

  const [courseViews, setCourseViews]       = useState({})
  const [progressData, setProgressData]     = useState({})
  const [progressLoading, setProgressLoading] = useState(new Set())
  const [diplomas, setDiplomas]             = useState([])
  const [diplomasLoaded, setDiplomasLoaded] = useState(false)
  const [awardTarget, setAwardTarget]       = useState(null)

  const newTitleRef = useRef(null)

  const toggleCourse = (id) => setExpandedCourses(prev => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })

  function getCourseView(id) { return courseViews[id] || 'modules' }

  async function switchToProgress(courseId) {
    setCourseViews(prev => ({ ...prev, [courseId]: 'progress' }))
    if (!progressData[courseId] && !progressLoading.has(courseId)) {
      setProgressLoading(prev => new Set([...prev, courseId]))
      try {
        const { data } = await getClassCourseProgress(departmentId, courseId)
        setProgressData(prev => ({ ...prev, [courseId]: data }))
      } catch {
      } finally {
        setProgressLoading(prev => { const n = new Set(prev); n.delete(courseId); return n })
      }
    }
    if (!diplomasLoaded) {
      try {
        const { data } = await getDiplomas(departmentId)
        setDiplomas(data)
      } catch {
      } finally {
        setDiplomasLoaded(true)
      }
    }
  }

  const handleRemoveFromCourse = async ({ courseId, moduleId }) => {
    setCourseModules(prev => ({ ...prev, [courseId]: prev[courseId].filter(l => l.id !== moduleId) }))
    setConfirmCourseModule(null)
    try { await removeCourseModule(courseId, moduleId) }
    catch { getCourse(courseId).then(d => setCourseModules(prev => ({ ...prev, [courseId]: (d.data.modules ?? []).map(cl => cl.module_detail ?? cl) }))).catch(() => {}) }
  }

  useEffect(() => {
    getCourses().then(res => {
      const list = res.data.filter(c => c.department_id === departmentId || c.department_id === Number(departmentId))
      setCourses(list)
      setLoadingCourses(false)
      list.forEach(c => {
        getCourse(c.id).then(detail => {
          const mods = (detail.data.modules ?? []).map(cl => cl.module_detail ?? cl)
          setCourseModules(prev => ({ ...prev, [c.id]: mods }))
        }).catch(() => {})
      })
    }).catch(() => setLoadingCourses(false))
  }, [])

  const openCreate = () => {
    setCreatingCourse(true)
    setNewTitle('')
    setTimeout(() => newTitleRef.current?.focus(), 40)
  }

  const handleCreateCourse = async (e) => {
    e?.preventDefault()
    if (!newTitle.trim()) return
    setSavingCourse(true)
    try {
      const { data } = await createCourse({ title: newTitle.trim(), description: '', status: 'draft', department_id: departmentId })
      setCourses(prev => [data, ...prev])
      setCreatingCourse(false)
      setNewTitle('')
      setManagingCourse(data)
    } finally {
      setSavingCourse(false)
    }
  }

  const handleDeleteCourse = async (courseId) => {
    await deleteCourse(courseId)
    setCourses(prev => prev.filter(c => c.id !== courseId))
    setConfirmCourse(null)
  }

  const handleToggleCourseStatus = async (course) => {
    const newStatus = course.status === 'published' ? 'draft' : 'published'
    setCourses(prev => prev.map(c => c.id === course.id ? { ...c, status: newStatus } : c))
    try { await updateCourse(course.id, { status: newStatus }) }
    catch { setCourses(prev => prev.map(c => c.id === course.id ? { ...c, status: course.status } : c)) }
  }

  return (
    <>
    <div className="lct">

      <div className="lct-section-hd">
        <span className="lct-section-label">Courses</span>
        <button className="lct-btn-add" onClick={openCreate}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Course
        </button>
      </div>

      {creatingCourse && (
        <form className="lct-new-course-row" onSubmit={handleCreateCourse}>
          <input
            ref={newTitleRef}
            className="lct-course-input"
            type="text"
            placeholder="Course title..."
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
          />
          <button className="lct-confirm-btn lct-confirm-btn--primary" type="submit" disabled={savingCourse}>
            {savingCourse ? '...' : 'Create'}
          </button>
          <button className="lct-confirm-btn" type="button" onClick={() => setCreatingCourse(false)}>
            Cancel
          </button>
        </form>
      )}

      {loadingCourses ? (
        <p className="lct-empty">Loading...</p>
      ) : courses.length === 0 && !creatingCourse ? (
        <p className="lct-empty">No courses yet -- create one to group your lessons.</p>
      ) : (
        courses.map(course => {
          const isDelConf  = confirmCourse === course.id
          const isExpanded = expandedCourses.has(course.id)
          const cls        = courseModules[course.id]
          const view       = getCourseView(course.id)

          return (
            <div key={course.id} className="lct-course-block">
              <div className="lct-course-row">
                <button className="lct-toggle-btn" onClick={() => toggleCourse(course.id)} title={isExpanded ? 'Collapse' : 'Expand'}>
                  <svg
                    width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.18s ease' }}
                  >
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>

                <div className="lct-course-info">
                  <button
                    className="lct-course-title lct-course-title--link"
                    onClick={() => navigate(`/teacher/builder?select=${course.id}`)}
                  >
                    {course.title}
                  </button>
                  <span className={`lct-status lct-status--${course.status}`}>{course.status}</span>
                  {cls && <span className="lct-course-count">{cls.length} module{cls.length !== 1 ? 's' : ''}</span>}
                </div>

                <div className="lct-course-actions">
                  <button
                    className={`lct-publish-btn lct-publish-btn--${course.status}`}
                    onClick={() => handleToggleCourseStatus(course)}
                    title={course.status === 'published' ? 'Unpublish course' : 'Publish course'}
                  >
                    {course.status === 'published' ? 'Unpublish' : 'Publish'}
                  </button>

                  {isDelConf ? (
                    <div className="lct-inline-confirm">
                      <span className="lct-confirm-label">Delete?</span>
                      <button className="lct-icon-btn lct-icon-btn--danger" onClick={() => handleDeleteCourse(course.id)}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </button>
                      <button className="lct-icon-btn" onClick={() => setConfirmCourse(null)}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                  ) : (
                    <button className="lct-icon-btn" onClick={() => setConfirmCourse(course.id)} title="Delete course">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        <path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                      </svg>
                    </button>
                  )}

                  <button className="lct-manage-btn" onClick={() => setManagingCourse(course)} title="Manage modules">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Modules
                  </button>
                </div>
              </div>

              {isExpanded && (
                <>
                  <div className="lct-inner-tab-bar">
                    <button
                      className={`lct-inner-tab${view === 'modules' ? ' lct-inner-tab--active' : ''}`}
                      onClick={() => setCourseViews(prev => ({ ...prev, [course.id]: 'modules' }))}
                    >
                      Modules
                    </button>
                    <button
                      className={`lct-inner-tab${view === 'progress' ? ' lct-inner-tab--active' : ''}`}
                      onClick={() => switchToProgress(course.id)}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="8" r="6"/>
                        <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
                      </svg>
                      Student Progress
                    </button>
                  </div>

                  {view === 'modules' && (
                    <div className="lct-cl-list">
                      {!cls ? (
                        <p className="lct-cl-empty">Loading...</p>
                      ) : cls.length === 0 ? (
                        <p className="lct-cl-empty">No modules in this course yet.</p>
                      ) : (
                        cls.map((l, i) => {
                          const isConf = confirmCourseModule?.courseId === course.id && confirmCourseModule?.moduleId === l.id
                          return (
                            <div key={l.id} className="lct-cl-item">
                              <span className="lct-cl-num">{i + 1}</span>
                              <span className="lct-cl-title">{l.title}</span>
                              <div className="lct-cl-actions">
                                {isConf ? (
                                  <div className="lct-inline-confirm">
                                    <span className="lct-confirm-label">Remove?</span>
                                    <button className="lct-icon-btn lct-icon-btn--danger" onClick={() => handleRemoveFromCourse({ courseId: course.id, moduleId: l.id })}>
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                    </button>
                                    <button className="lct-icon-btn" onClick={() => setConfirmCourseModule(null)}>
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                    </button>
                                  </div>
                                ) : (
                                  <button className="lct-icon-btn" onClick={() => setConfirmCourseModule({ courseId: course.id, moduleId: l.id })} title="Remove from course">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                      <polyline points="3 6 5 6 21 6"/>
                                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                      <path d="M10 11v6M14 11v6"/>
                                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                                    </svg>
                                  </button>
                                )}
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  )}

                  {view === 'progress' && (
                    <CourseProgressView
                      data={progressData[course.id]}
                      loading={progressLoading.has(course.id)}
                      diplomas={diplomas}
                      onAwardStudent={(studentId, studentName) => setAwardTarget({ id: studentId, name: studentName })}
                    />
                  )}
                </>
              )}
            </div>
          )
        })
      )}

    </div>

    {managingCourse && (
      <CourseModuleModal
        course={managingCourse}
        classModules={classModules}
        onClose={() => {
          getCourse(managingCourse.id).then(detail => {
            const mods = (detail.data.modules ?? []).map(cl => cl.module_detail ?? cl)
            setCourseModules(prev => ({ ...prev, [managingCourse.id]: mods }))
          }).catch(() => {})
          setManagingCourse(null)
        }}
      />
    )}

    {awardTarget && (
      <QuickAwardModal
        classId={departmentId}
        student={awardTarget}
        diplomas={diplomas}
        onClose={() => setAwardTarget(null)}
        onDiplomasChange={setDiplomas}
      />
    )}
    </>
  )
}
