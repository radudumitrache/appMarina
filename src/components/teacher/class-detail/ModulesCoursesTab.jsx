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

function gradeColor(grade) {
  if (grade === null || grade === undefined) return 'pending'
  if (grade >= 70) return 'pass'
  if (grade >= 50) return 'warn'
  return 'fail'
}

function CourseProgressView({ data, loading, diplomas, onAwardStudent }) {
  if (loading) return <p className="lct-cl-empty">Loading progress...</p>
  if (!data)   return <p className="lct-cl-empty">Could not load progress.</p>

  const { items, students } = data

  if (!students || students.length === 0) {
    return <p className="lct-cl-empty">No enrolled students in this department.</p>
  }
  if (!items || items.length === 0) {
    return <p className="lct-cl-empty">This course has no items yet.</p>
  }

  return (
    <div className="lct-ptable-wrap">
      <div className="lct-ptable-scroll">
        <table className="lct-ptable">
          <thead>
            <tr>
              <th className="lct-ptable-th lct-ptable-th--student">Student</th>
              {items.map((item, i) => (
                <th key={`${item.type}-${item.id}`} className={`lct-ptable-th lct-ptable-th--item${item.type === 'test' ? ' lct-ptable-th--test' : ''}`}>
                  <span className="lct-ptable-item-num">{i + 1}</span>
                  <span className="lct-ptable-item-title" title={item.title}>{item.title}</span>
                  {item.type === 'test'
                    ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
                    : <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
                  }
                </th>
              ))}
              <th className="lct-ptable-th lct-ptable-th--score">Score</th>
              <th className="lct-ptable-th lct-ptable-th--actions"></th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => {
              const completedModules = new Set(s.module_completed ?? [])
              const testGrades = s.test_grades ?? {}

              let done = 0
              items.forEach(item => {
                if (item.type === 'module' && completedModules.has(item.id)) done++
                else if (item.type === 'test' && String(item.id) in testGrades) done++
              })
              const total = items.length
              const pct = total > 0 ? Math.round((done / total) * 100) : 0
              const allDone = total > 0 && done === total

              return (
                <tr key={s.id} className={`lct-ptable-row${allDone ? ' lct-ptable-row--done' : ''}`}>
                  <td className="lct-ptable-td lct-ptable-td--student">
                    <div className={`lct-progress-avatar lct-progress-avatar--sm${allDone ? ' lct-progress-avatar--done' : ''}`}>
                      {initials(s.name)}
                    </div>
                    <span className="lct-ptable-name">{s.name}</span>
                  </td>

                  {items.map(item => {
                    if (item.type === 'module') {
                      const done = completedModules.has(item.id)
                      return (
                        <td key={`${item.type}-${item.id}`} className="lct-ptable-td lct-ptable-td--cell">
                          {done
                            ? <span className="lct-ptable-check">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                              </span>
                            : <span className="lct-ptable-empty" />
                          }
                        </td>
                      )
                    } else {
                      const key = String(item.id)
                      const submitted = key in testGrades
                      const grade = testGrades[key]
                      const color = submitted ? gradeColor(grade) : 'none'
                      return (
                        <td key={`${item.type}-${item.id}`} className="lct-ptable-td lct-ptable-td--cell">
                          {!submitted
                            ? <span className="lct-ptable-empty" />
                            : <span className={`lct-ptable-grade lct-ptable-grade--${color}`}>
                                {grade !== null && grade !== undefined ? `${Math.round(grade)}%` : 'Pending'}
                              </span>
                          }
                        </td>
                      )
                    }
                  })}

                  <td className="lct-ptable-td lct-ptable-td--score">
                    <div className="lct-ptable-score-wrap">
                      <div className="lct-ptable-bar">
                        <div className={`lct-ptable-bar-fill lct-ptable-bar-fill--${allDone ? 'done' : 'default'}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className={`lct-ptable-score-label${allDone ? ' lct-ptable-score-label--done' : ''}`}>{done}/{total}</span>
                    </div>
                  </td>

                  <td className="lct-ptable-td lct-ptable-td--actions">
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
    catch { getCourse(courseId).then(d => setCourseModules(prev => ({ ...prev, [courseId]: (d.data.modules ?? []).map(cl => ({ id: cl.id, title: cl.module_detail?.title ?? cl.test_detail?.title ?? '(untitled)', itemType: cl.test_detail ? 'test' : 'module' })) }))).catch(() => {}) }
  }

  useEffect(() => {
    getCourses().then(res => {
      const deptId = Number(departmentId)
      const list = res.data.filter(c => c.department_ids?.includes(deptId))
      setCourses(list)
      setLoadingCourses(false)
      list.forEach(c => {
        getCourse(c.id).then(detail => {
          const mods = (detail.data.modules ?? []).map(cl => ({
            id: cl.id,
            title: cl.module_detail?.title ?? cl.test_detail?.title ?? '(untitled)',
            itemType: cl.test_detail ? 'test' : 'module',
          }))
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
                  {cls && <span className="lct-course-count">{cls.length} item{cls.length !== 1 ? 's' : ''}</span>}
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

                  <button className="lct-manage-btn" onClick={() => setManagingCourse(course)} title="Manage items">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Add Items
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
                              {l.itemType === 'test' && <span className="lct-cl-type-badge">Test</span>}
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
        departmentId={departmentId}
        onClose={() => {
          getCourse(managingCourse.id).then(detail => {
            const mods = (detail.data.modules ?? []).map(cl => ({
              id: cl.id,
              title: cl.module_detail?.title ?? cl.test_detail?.title ?? '(untitled)',
              itemType: cl.test_detail ? 'test' : 'module',
            }))
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
