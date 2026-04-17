import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import NavBar from '../../components/admin/NavBar'
import '../css/admin/ClassDetail.css'

/* ─── Shared mock data (mirrors Classes.jsx until a real API is wired) ─── */
const ALL_STUDENTS = [
  { id: 1,  name: 'Alice Chen'      },
  { id: 2,  name: 'Bob Martinez'    },
  { id: 3,  name: 'Clara Novak'     },
  { id: 4,  name: 'Daniel Park'     },
  { id: 5,  name: 'Eva Rossi'       },
  { id: 6,  name: 'Frank Okafor'    },
  { id: 7,  name: 'Grace Yamamoto'  },
  { id: 8,  name: 'Hugo Brennan'    },
  { id: 9,  name: 'Isla Torres'     },
  { id: 10, name: 'James Okonkwo'   },
  { id: 11, name: 'Kira Petrov'     },
  { id: 12, name: 'Liam Walsh'      },
]

const ALL_LESSONS = [
  { id: 1,  title: 'Helm Control Basics'        },
  { id: 2,  title: 'Chart Reading Fundamentals' },
  { id: 3,  title: 'Radar & ARPA Systems'       },
  { id: 5,  title: 'Fire Safety Protocols'      },
  { id: 6,  title: 'Man Overboard Response'     },
  { id: 8,  title: 'Main Engine Operations'     },
  { id: 10, title: 'Load Calculation'           },
  { id: 12, title: 'GMDSS Radio Operations'     },
]

const TEACHERS = ['Capt. Rodriguez', 'Prof. Whitmore', 'Instr. Chen', 'Eng. Vasquez']

const INITIAL_CLASSES = [
  { id: 1, name: 'SEC-2024-A', teacher: 'Capt. Rodriguez',  students: [1, 2, 5],    lessons: [1, 2, 3, 5],    status: 'active',   description: 'Main cohort — Spring 2024'     },
  { id: 2, name: 'SEC-2024-B', teacher: 'Prof. Whitmore',   students: [3, 4, 11],   lessons: [1, 3, 6, 8],    status: 'active',   description: 'Advanced track — Spring 2024'  },
  { id: 3, name: 'SEC-2024-C', teacher: 'Instr. Chen',      students: [6, 8, 12],   lessons: [1, 2, 5, 12],   status: 'active',   description: 'Evening cohort — Spring 2024'  },
  { id: 4, name: 'SEC-2023-A', teacher: 'Eng. Vasquez',     students: [7, 9, 10],   lessons: [1, 2, 3, 8, 10],status: 'archived', description: 'Completed cohort — 2023'       },
]

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function ChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  )
}
function XIcon({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}
function PlusIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  )
}

/* ─── Main page ──────────────────────────────────────────────────────────── */
export default function AdminClassDetail() {
  const { id }   = useParams()
  const navigate = useNavigate()

  const base = INITIAL_CLASSES.find(c => c.id === Number(id))

  // Local editable state
  const [cls, setCls]               = useState(base || null)
  const [editMode, setEditMode]     = useState(false)
  const [editForm, setEditForm]     = useState(null)
  const [studentSearch, setStudentSearch] = useState('')
  const [lessonSearch,  setLessonSearch]  = useState('')
  const [studentFocus,  setStudentFocus]  = useState(false)
  const [lessonFocus,   setLessonFocus]   = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  if (!cls) {
    return (
      <div className="cd-page">
        <NavBar />
        <div className="cd-not-found">
          <p>Class not found.</p>
          <button className="btn-ghost" onClick={() => navigate('/admin/classes')}>Back to Classes</button>
        </div>
      </div>
    )
  }

  /* ── Edit metadata ──────────────────────────────────────────────────── */
  const openEdit = () => {
    setEditForm({ name: cls.name, teacher: cls.teacher, description: cls.description || '', status: cls.status })
    setEditMode(true)
  }
  const saveEdit = () => {
    if (!editForm.name.trim()) return
    setCls(c => ({ ...c, ...editForm }))
    setEditMode(false)
  }

  /* ── Students ───────────────────────────────────────────────────────── */
  const enrolledStudents = ALL_STUDENTS.filter(s => cls.students.includes(s.id))

  const studentSuggestions = useMemo(() => {
    const q = studentSearch.trim().toLowerCase()
    if (!q) return []
    return ALL_STUDENTS.filter(
      s => !cls.students.includes(s.id) && s.name.toLowerCase().includes(q)
    )
  }, [studentSearch, cls.students])

  const addStudent = (student) => {
    setCls(c => ({ ...c, students: [...c.students, student.id] }))
    setStudentSearch('')
  }
  const removeStudent = (sid) =>
    setCls(c => ({ ...c, students: c.students.filter(x => x !== sid) }))

  /* ── Lessons ────────────────────────────────────────────────────────── */
  const assignedLessons = ALL_LESSONS.filter(l => cls.lessons.includes(l.id))

  const lessonSuggestions = useMemo(() => {
    const q = lessonSearch.trim().toLowerCase()
    if (!q) return []
    return ALL_LESSONS.filter(
      l => !cls.lessons.includes(l.id) && l.title.toLowerCase().includes(q)
    )
  }, [lessonSearch, cls.lessons])

  const addLesson = (lesson) => {
    setCls(c => ({ ...c, lessons: [...c.lessons, lesson.id] }))
    setLessonSearch('')
  }
  const removeLesson = (lid) =>
    setCls(c => ({ ...c, lessons: c.lessons.filter(x => x !== lid) }))

  /* ── Archive toggle ─────────────────────────────────────────────────── */
  const toggleArchive = () =>
    setCls(c => ({ ...c, status: c.status === 'active' ? 'archived' : 'active' }))

  return (
    <div className="cd-page">
      <NavBar />

      {/* ─── Breadcrumb / back bar ───────────────────────────────────────── */}
      <div className="cd-topbar">
        <button className="cd-back-btn" onClick={() => navigate('/admin/classes')}>
          <ChevronLeft />
          Classes
        </button>
        <div className="cd-topbar-right">
          <button
            className={`cd-archive-btn ${cls.status === 'archived' ? 'cd-archive-btn--restore' : ''}`}
            onClick={toggleArchive}
          >
            {cls.status === 'active' ? 'Archive' : 'Restore'}
          </button>
          <button className="btn-primary-sm" onClick={openEdit}>Edit Details</button>
        </div>
      </div>

      {/* ─── Class header ───────────────────────────────────────────────── */}
      <div className="cd-header">
        <div className="cd-header-left">
          <div className="cd-name-row">
            <h1 className="cd-name">{cls.name}</h1>
            <span className={`cd-status-badge cd-status-badge--${cls.status}`}>{cls.status}</span>
          </div>
          {cls.description && <p className="cd-description">{cls.description}</p>}
          <div className="cd-teacher-row">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span className="cd-teacher-name">{cls.teacher}</span>
          </div>
        </div>
        <div className="cd-header-stats">
          <div className="cd-stat">
            <span className="cd-stat-value">{cls.students.length}</span>
            <span className="cd-stat-label">Students</span>
          </div>
          <div className="cd-stat-sep" />
          <div className="cd-stat">
            <span className="cd-stat-value">{cls.lessons.length}</span>
            <span className="cd-stat-label">Lessons</span>
          </div>
        </div>
      </div>

      {/* ─── Two-panel management area ──────────────────────────────────── */}
      <div className="cd-panels">

        {/* Students panel */}
        <div className="cd-panel">
          <div className="cd-panel-header">
            <span className="cd-panel-title">Students</span>
            <span className="cd-panel-count">{enrolledStudents.length}</span>
          </div>

          {/* Quick-add search */}
          <div className="cd-adder">
            <div className="cd-adder-wrap">
              <svg className="cd-adder-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                className="cd-adder-input"
                type="text"
                placeholder="Search students to add…"
                value={studentSearch}
                onChange={e => setStudentSearch(e.target.value)}
                onFocus={() => setStudentFocus(true)}
                onBlur={() => setTimeout(() => setStudentFocus(false), 150)}
              />
            </div>
            {studentFocus && studentSuggestions.length > 0 && (
              <div className="cd-dropdown">
                {studentSuggestions.map(s => (
                  <button
                    key={s.id}
                    className="cd-dropdown-item"
                    onMouseDown={() => addStudent(s)}
                  >
                    <PlusIcon />
                    {s.name}
                  </button>
                ))}
              </div>
            )}
            {studentFocus && studentSearch.trim() && studentSuggestions.length === 0 && (
              <div className="cd-dropdown">
                <span className="cd-dropdown-empty">No matching students available</span>
              </div>
            )}
          </div>

          {/* Enrolled list */}
          <div className="cd-member-list">
            {enrolledStudents.length === 0 ? (
              <p className="cd-empty-hint">No students enrolled yet.</p>
            ) : (
              enrolledStudents.map((s, i) => (
                <div
                  key={s.id}
                  className="cd-member-row"
                  style={{ animationDelay: `${Math.min(i, 8) * 0.03}s` }}
                >
                  <div className="cd-member-avatar">
                    {s.name.charAt(0)}
                  </div>
                  <span className="cd-member-name">{s.name}</span>
                  <button
                    className="cd-remove-btn"
                    title="Remove student"
                    onClick={() => removeStudent(s.id)}
                  >
                    <XIcon />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Lessons panel */}
        <div className="cd-panel">
          <div className="cd-panel-header">
            <span className="cd-panel-title">Lessons</span>
            <span className="cd-panel-count">{assignedLessons.length}</span>
          </div>

          {/* Quick-add search */}
          <div className="cd-adder">
            <div className="cd-adder-wrap">
              <svg className="cd-adder-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                className="cd-adder-input"
                type="text"
                placeholder="Search lessons to assign…"
                value={lessonSearch}
                onChange={e => setLessonSearch(e.target.value)}
                onFocus={() => setLessonFocus(true)}
                onBlur={() => setTimeout(() => setLessonFocus(false), 150)}
              />
            </div>
            {lessonFocus && lessonSuggestions.length > 0 && (
              <div className="cd-dropdown">
                {lessonSuggestions.map(l => (
                  <button
                    key={l.id}
                    className="cd-dropdown-item"
                    onMouseDown={() => addLesson(l)}
                  >
                    <PlusIcon />
                    {l.title}
                  </button>
                ))}
              </div>
            )}
            {lessonFocus && lessonSearch.trim() && lessonSuggestions.length === 0 && (
              <div className="cd-dropdown">
                <span className="cd-dropdown-empty">No matching lessons available</span>
              </div>
            )}
          </div>

          {/* Assigned lessons list */}
          <div className="cd-member-list">
            {assignedLessons.length === 0 ? (
              <p className="cd-empty-hint">No lessons assigned yet.</p>
            ) : (
              assignedLessons.map((l, i) => (
                <div
                  key={l.id}
                  className="cd-member-row cd-member-row--lesson"
                  style={{ animationDelay: `${Math.min(i, 8) * 0.03}s` }}
                >
                  <div className="cd-lesson-icon">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                    </svg>
                  </div>
                  <span className="cd-member-name">{l.title}</span>
                  <button
                    className="cd-remove-btn"
                    title="Unassign lesson"
                    onClick={() => removeLesson(l.id)}
                  >
                    <XIcon />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ─── Edit details modal ──────────────────────────────────────────── */}
      {editMode && (
        <div className="modal-backdrop" onClick={() => setEditMode(false)}>
          <div className="modal modal--wide" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Class Details</h3>
              <button className="modal-close" onClick={() => setEditMode(false)}>
                <XIcon size={15} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-2col">
                <div className="form-row">
                  <label className="form-label">Class Name</label>
                  <input
                    className="form-input"
                    type="text"
                    value={editForm.name}
                    onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div className="form-row">
                  <label className="form-label">Teacher</label>
                  <select
                    className="form-select"
                    value={editForm.teacher}
                    onChange={e => setEditForm(f => ({ ...f, teacher: e.target.value }))}
                  >
                    {TEACHERS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <label className="form-label">Description</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="e.g. Main cohort — Spring 2025"
                  value={editForm.description}
                  onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div className="form-row">
                <label className="form-label">Status</label>
                <div className="form-radio-group">
                  {['active', 'archived'].map(s => (
                    <label
                      key={s}
                      className={`form-radio ${editForm.status === s ? 'form-radio--active' : ''}`}
                    >
                      <input
                        type="radio"
                        name="cd-status"
                        value={s}
                        checked={editForm.status === s}
                        onChange={() => setEditForm(f => ({ ...f, status: s }))}
                      />
                      <span>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => setEditMode(false)}>Cancel</button>
              <button className="btn-primary" onClick={saveEdit} disabled={!editForm.name.trim()}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
