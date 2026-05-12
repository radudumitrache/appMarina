import { useState, useEffect, useRef } from 'react'
import { getCourses, getCourse, createCourse, deleteCourse, updateCourse, removeCourseLesson } from '../../../api/lessons'
import { unassignLesson, getClasses } from '../../../api/classes'
import CourseLessonModal from './CourseLessonModal'
import '../../css/teacher/class-detail/LessonsCoursesTab.css'

const CAT_LABELS = { nav: 'NAV', emg: 'EMG', eng: 'ENG', cargo: 'CARGO', comm: 'COMM' }

export default function LessonsCoursesTab({ classId, classLessons, onNewLesson, onClassLessonUpdate }) {
  const [courses, setCourses]             = useState([])
  const [courseLessons, setCourseLessons] = useState({}) // courseId → lesson[]
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [creatingCourse, setCreatingCourse] = useState(false)
  const [newTitle, setNewTitle]           = useState('')
  const [savingCourse, setSavingCourse]   = useState(false)
  const [confirmCourse, setConfirmCourse] = useState(null)
  const [managingCourse, setManagingCourse] = useState(null)
  const [confirmClassLesson, setConfirmClassLesson] = useState(null)
  const [removingLesson, setRemovingLesson] = useState(null)
  const [expandedCourses, setExpandedCourses] = useState(new Set())
  const [confirmCourseLesson, setConfirmCourseLesson] = useState(null)
  const [allClasses, setAllClasses] = useState([])
  const newTitleRef = useRef(null)

  const toggleCourse = (id) => setExpandedCourses(prev => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })

  const handleRemoveFromCourse = async ({ courseId, lessonId }) => {
    setCourseLessons(prev => ({ ...prev, [courseId]: prev[courseId].filter(l => l.id !== lessonId) }))
    setConfirmCourseLesson(null)
    try { await removeCourseLesson(courseId, lessonId) }
    catch { getCourse(courseId).then(d => setCourseLessons(prev => ({ ...prev, [courseId]: (d.data.lessons ?? []).map(cl => cl.lesson_detail ?? cl) }))).catch(() => {}) }
  }

  useEffect(() => {
    getCourses().then(res => {
      const list = res.data.filter(c => c.classroom_id === classId || c.classroom_id === Number(classId))
      setCourses(list)
      setLoadingCourses(false)
      list.forEach(c => {
        getCourse(c.id).then(detail => {
          const lessons = (detail.data.lessons ?? []).map(cl => cl.lesson_detail ?? cl)
          setCourseLessons(prev => ({ ...prev, [c.id]: lessons }))
        }).catch(() => {})
      })
    }).catch(() => setLoadingCourses(false))
    getClasses().then(r => setAllClasses(r.data)).catch(() => {})
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
      const { data } = await createCourse({ title: newTitle.trim(), description: '', status: 'draft', classroom_id: classId })
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

  const handleRemoveClassLesson = async (lessonId) => {
    setRemovingLesson(lessonId)
    try { await unassignLesson(classId, lessonId) } finally {
      setRemovingLesson(null)
      setConfirmClassLesson(null)
    }
  }

  const handleToggleCourseStatus = async (course) => {
    const newStatus = course.status === 'published' ? 'draft' : 'published'
    setCourses(prev => prev.map(c => c.id === course.id ? { ...c, status: newStatus } : c))
    try { await updateCourse(course.id, { status: newStatus }) }
    catch { setCourses(prev => prev.map(c => c.id === course.id ? { ...c, status: course.status } : c)) }
  }

  const handleCourseClassroomChange = async (course, newClassroomId) => {
    const prevClassroomId = course.classroom_id ?? null
    const next = newClassroomId ? Number(newClassroomId) : null
    setCourses(prev => prev.map(c => c.id === course.id ? { ...c, classroom_id: next } : c))
    try { await updateCourse(course.id, { classroom_id: next }) }
    catch { setCourses(prev => prev.map(c => c.id === course.id ? { ...c, classroom_id: prevClassroomId } : c)) }
  }

  const lessonCat = l => CAT_LABELS[l.cat ?? l.category] ?? l.cat ?? l.category ?? '—'

  return (
    <>
    <div className="lct">

      {/* ── Courses ───────────────────────────────────────────────────────── */}
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
            placeholder="Course title…"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
          />
          <button className="lct-confirm-btn lct-confirm-btn--primary" type="submit" disabled={savingCourse}>
            {savingCourse ? '…' : 'Create'}
          </button>
          <button className="lct-confirm-btn" type="button" onClick={() => setCreatingCourse(false)}>
            Cancel
          </button>
        </form>
      )}

      {loadingCourses ? (
        <p className="lct-empty">Loading…</p>
      ) : courses.length === 0 && !creatingCourse ? (
        <p className="lct-empty">No courses yet — create one to group your lessons.</p>
      ) : (
        courses.map(course => {
          const isDelConf  = confirmCourse === course.id
          const isExpanded = expandedCourses.has(course.id)
          const cls        = courseLessons[course.id]
          return (
            <div key={course.id} className="lct-course-block">
              {/* ── Course header row ── */}
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
                  <span className="lct-course-title">{course.title}</span>
                  <span className={`lct-status lct-status--${course.status}`}>{course.status}</span>
                  {cls && <span className="lct-course-count">{cls.length} lesson{cls.length !== 1 ? 's' : ''}</span>}
                  {allClasses.length > 0 && (
                    <select
                      className="lct-classroom-select"
                      value={course.classroom_id ?? ''}
                      onChange={e => handleCourseClassroomChange(course, e.target.value)}
                      onClick={e => e.stopPropagation()}
                    >
                      <option value="">— no class —</option>
                      {allClasses.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                      ))}
                    </select>
                  )}
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

                  <button className="lct-manage-btn" onClick={() => setManagingCourse(course)} title="Manage lessons">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Lessons
                  </button>
                </div>
              </div>

              {/* ── Collapsible lesson list ── */}
              {isExpanded && (
                <div className="lct-cl-list">
                  {!cls ? (
                    <p className="lct-cl-empty">Loading…</p>
                  ) : cls.length === 0 ? (
                    <p className="lct-cl-empty">No lessons in this course yet.</p>
                  ) : (
                    cls.map((l, i) => {
                      const isConf = confirmCourseLesson?.courseId === course.id && confirmCourseLesson?.lessonId === l.id
                      return (
                        <div key={l.id} className="lct-cl-item">
                          <span className="lct-cl-num">{i + 1}</span>
                          <span className="lct-cl-title">{l.title}</span>
                          {lessonCat(l) !== '—' && <span className="lct-cat-tag">{lessonCat(l)}</span>}

                          <div className="lct-cl-actions">
                            {isConf ? (
                              <div className="lct-inline-confirm">
                                <span className="lct-confirm-label">Remove?</span>
                                <button className="lct-icon-btn lct-icon-btn--danger" onClick={() => handleRemoveFromCourse({ courseId: course.id, lessonId: l.id })}>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                </button>
                                <button className="lct-icon-btn" onClick={() => setConfirmCourseLesson(null)}>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                </button>
                              </div>
                            ) : (
                              <>
                                <button className="lct-icon-btn" onClick={() => setConfirmCourseLesson({ courseId: course.id, lessonId: l.id })} title="Remove from course">
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6"/>
                                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                    <path d="M10 11v6M14 11v6"/>
                                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                                  </svg>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              )}
            </div>
          )
        })
      )}

      {/* ── Class Lessons ─────────────────────────────────────────────────── */}
      <div className="lct-divider" />

      <div className="lct-section-hd">
        <span className="lct-section-label">Class Lessons</span>
        {/* New Lesson button disabled for teachers — admins only
        <button className="lct-btn-add" onClick={onNewLesson}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Lesson
        </button>
        */}
      </div>

      {classLessons.length === 0 ? (
        <p className="lct-empty">No lessons assigned to this class yet.</p>
      ) : (
        classLessons.map(l => {
          const isConf = confirmClassLesson === l.id
          const isBusy = removingLesson === l.id
          const pct    = l.total > 0 ? Math.round((l.completed / l.total) * 100) : 0
          const isDone = l.total > 0 && l.completed === l.total

          return (
            <div key={l.id} className="lct-lesson-row">
              <span className="lct-lesson-num">{l.num}</span>
              <span className="lct-lesson-title">{l.title}</span>
              <span className="lct-cat-tag">{lessonCat(l)}</span>
              <span className="lct-dur">{l.duration}</span>

              <div className="lct-mini-progress">
                <div className="lct-mini-bar">
                  <div className={`lct-mini-fill ${isDone ? 'lct-mini-fill--done' : ''}`} style={{ width: `${pct}%` }} />
                </div>
                <span className="lct-mono">{l.completed}/{l.total}</span>
              </div>

              <div className="lct-lesson-actions">
                {isConf ? (
                  <div className="lct-inline-confirm">
                    <span className="lct-confirm-label">Remove?</span>
                    <button className="lct-icon-btn lct-icon-btn--danger" onClick={() => handleRemoveClassLesson(l.id)} disabled={isBusy}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </button>
                    <button className="lct-icon-btn" onClick={() => setConfirmClassLesson(null)}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                ) : (
                  <>
                    <button className="lct-icon-btn" onClick={() => setConfirmClassLesson(l.id)} title="Remove from class">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        <path d="M10 11v6M14 11v6"/>
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                      </svg>
                    </button>
                  </>
                )}
              </div>
            </div>
          )
        })
      )}
    </div>

    {managingCourse && (
      <CourseLessonModal
        course={managingCourse}
        classLessons={classLessons}
        onClose={() => {
          // refresh lesson list for this course so chips update
          getCourse(managingCourse.id).then(detail => {
            const lessons = (detail.data.lessons ?? []).map(cl => cl.lesson_detail ?? cl)
            setCourseLessons(prev => ({ ...prev, [managingCourse.id]: lessons }))
          }).catch(() => {})
          setManagingCourse(null)
        }}
      />
    )}

</>
  )
}
