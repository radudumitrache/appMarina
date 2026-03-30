import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import NavBar from '../../components/teacher/NavBar'
import '../css/teacher/ClassDetail.css'

// ─── Mock class registry (mirrors Classes.jsx) ────────────────────────────
const CLASSES = {
  1: { name: 'Maritime Navigation — Alpha', code: 'MN-2024-A', subject: 'Bridge Navigation',   status: 'active',   lessonsTotal: 12 },
  2: { name: 'Emergency Protocols — Beta',  code: 'EP-2024-B', subject: 'Emergency Protocols', status: 'active',   lessonsTotal:  8 },
  3: { name: 'Engine Room Ops — Charlie',   code: 'ER-2024-C', subject: 'Engine Room',         status: 'active',   lessonsTotal: 10 },
  4: { name: 'Cargo & Logistics — Delta',   code: 'CL-2024-D', subject: 'Cargo Management',    status: 'active',   lessonsTotal:  6 },
  5: { name: 'Communications — Echo',       code: 'CM-2024-E', subject: 'Communications',      status: 'complete', lessonsTotal:  5 },
  6: { name: 'Advanced Navigation — 2023',  code: 'AN-2023-F', subject: 'Bridge Navigation',   status: 'archived', lessonsTotal: 14 },
}

// ─── Mock students ────────────────────────────────────────────────────────
const STUDENTS = [
  { id: 1,  initials: 'JH', name: 'James Harrington',   email: 'j.harrington@seafarer.edu', done: 10, lastActive: '2h ago',   status: 'active'   },
  { id: 2,  initials: 'SP', name: 'Sofia Petrova',      email: 's.petrova@seafarer.edu',    done:  7, lastActive: '1d ago',   status: 'active'   },
  { id: 3,  initials: 'ML', name: 'Marcus Lee',         email: 'm.lee@seafarer.edu',        done: 12, lastActive: '30m ago',  status: 'active'   },
  { id: 4,  initials: 'AT', name: 'Amara Toure',        email: 'a.toure@seafarer.edu',      done:  5, lastActive: '3d ago',   status: 'active'   },
  { id: 5,  initials: 'RC', name: 'Rafael Cruz',        email: 'r.cruz@seafarer.edu',       done:  9, lastActive: '5h ago',   status: 'active'   },
  { id: 6,  initials: 'EV', name: 'Elena Voronova',     email: 'e.voronova@seafarer.edu',   done:  3, lastActive: '1w ago',   status: 'inactive' },
  { id: 7,  initials: 'TN', name: 'Thomas Nakamura',    email: 't.nakamura@seafarer.edu',   done: 11, lastActive: '1h ago',   status: 'active'   },
  { id: 8,  initials: 'IB', name: 'Ingrid Bjornsen',    email: 'i.bjornsen@seafarer.edu',   done:  6, lastActive: '2d ago',   status: 'active'   },
  { id: 9,  initials: 'KO', name: 'Kwame Osei',         email: 'k.osei@seafarer.edu',       done:  8, lastActive: '4h ago',   status: 'active'   },
  { id: 10, initials: 'PD', name: 'Priya Desai',        email: 'p.desai@seafarer.edu',      done:  1, lastActive: '2w ago',   status: 'inactive' },
  { id: 11, initials: 'LM', name: 'Luca Moretti',       email: 'l.moretti@seafarer.edu',    done: 12, lastActive: '45m ago',  status: 'active'   },
  { id: 12, initials: 'YS', name: 'Yuki Sato',          email: 'y.sato@seafarer.edu',       done:  4, lastActive: '6d ago',   status: 'active'   },
]

// ─── Mock lessons ─────────────────────────────────────────────────────────
const LESSONS = [
  { id:  1, num: '01', title: 'Helm Control Basics',        cat: 'Navigation',   duration: '45 min', completed: 24, total: 24 },
  { id:  2, num: '02', title: 'Chart Reading Fundamentals', cat: 'Navigation',   duration: '60 min', completed: 22, total: 24 },
  { id:  3, num: '03', title: 'Radar & ARPA Systems',       cat: 'Navigation',   duration: '75 min', completed: 17, total: 24 },
  { id:  4, num: '04', title: 'Celestial Navigation',       cat: 'Navigation',   duration: '90 min', completed: 10, total: 24 },
  { id:  5, num: '05', title: 'Fire Safety Protocols',      cat: 'Emergency',    duration: '50 min', completed: 24, total: 24 },
  { id:  6, num: '06', title: 'Man Overboard Response',     cat: 'Emergency',    duration: '60 min', completed: 19, total: 24 },
  { id:  7, num: '07', title: 'Abandon Ship Procedure',     cat: 'Emergency',    duration: '45 min', completed: 13, total: 24 },
  { id:  8, num: '08', title: 'Main Engine Operations',     cat: 'Engineering',  duration: '80 min', completed: 24, total: 24 },
  { id:  9, num: '09', title: 'Fuel Management Systems',    cat: 'Engineering',  duration: '65 min', completed: 21, total: 24 },
  { id: 10, num: '10', title: 'Load Calculation',           cat: 'Cargo',        duration: '70 min', completed:  8, total: 24 },
  { id: 11, num: '11', title: 'Stability & Trim',           cat: 'Cargo',        duration: '85 min', completed:  3, total: 24 },
  { id: 12, num: '12', title: 'GMDSS Radio Operations',     cat: 'Comms',        duration: '55 min', completed:  0, total: 24 },
]

// ─── Mock assignments ─────────────────────────────────────────────────────
const ASSIGNMENTS = [
  { id: 1, title: 'Navigation Chart Exercise',  dueDate: 'Apr 5, 2026',  submitted: 20, total: 24, avgScore: 84 },
  { id: 2, title: 'Radar Plot Assessment',       dueDate: 'Apr 12, 2026', submitted: 15, total: 24, avgScore: 71 },
  { id: 3, title: 'Emergency Drill Report',      dueDate: 'Apr 19, 2026', submitted:  4, total: 24, avgScore: null },
  { id: 4, title: 'Engine Room Inspection Log',  dueDate: 'Apr 26, 2026', submitted:  0, total: 24, avgScore: null },
]

const STATUS_LABELS = { active: 'Active', complete: 'Complete', archived: 'Archived' }

const TABS = [
  { id: 'students',    label: 'Students'    },
  { id: 'lessons',     label: 'Lessons'     },
  { id: 'assignments', label: 'Assignments' },
]

export default function ClassDetail() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const cls      = CLASSES[Number(id)]

  const [tab, setTab]       = useState('students')
  const [search, setSearch] = useState('')

  if (!cls) {
    return (
      <div className="cd-page">
        <div className="cd-layout">
          <NavBar />
          <div className="cd-not-found">Class not found.</div>
        </div>
      </div>
    )
  }

  const totalStudents = STUDENTS.length
  const activeStudents = STUDENTS.filter(s => s.status === 'active').length
  const avgProgress = Math.round(
    STUDENTS.reduce((sum, s) => sum + (s.done / cls.lessonsTotal) * 100, 0) / STUDENTS.length
  )
  const lessonsComplete = LESSONS.filter(l => l.completed === l.total).length

  const filteredStudents = STUDENTS.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase().trim()) ||
    s.email.toLowerCase().includes(search.toLowerCase().trim())
  )

  const filteredLessons = LESSONS.filter(l =>
    l.title.toLowerCase().includes(search.toLowerCase().trim()) ||
    l.cat.toLowerCase().includes(search.toLowerCase().trim())
  )

  return (
    <div className="cd-page">
      <div className="cd-layout">
        <NavBar />

        {/* ─── Page header ──────────────────────────────────────────────── */}
        <div className="cd-header">
          <div className="cd-header-left">
            <div className="cd-breadcrumb">
              <button className="cd-crumb-link" onClick={() => navigate('/teacher/dashboard')}>Dashboard</button>
              <span className="cd-crumb-sep">/</span>
              <button className="cd-crumb-link" onClick={() => navigate('/teacher/classes')}>My Classes</button>
              <span className="cd-crumb-sep">/</span>
            </div>
            <div className="cd-title-row">
              <h1 className="cd-title">{cls.name}</h1>
              <span className="cd-code-badge">{cls.code}</span>
              <span className={`cd-status-badge cd-status--${cls.status}`}>
                {STATUS_LABELS[cls.status]}
              </span>
            </div>
          </div>
          <div className="cd-header-actions">
            <button className="cd-btn-secondary">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit Class
            </button>
            <button className="cd-btn-icon" title="More options">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="5"  r="1"/>
                <circle cx="12" cy="12" r="1"/>
                <circle cx="12" cy="19" r="1"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="cd-content">

          {/* ─── Stat cards ───────────────────────────────────────────────── */}
          <div className="cd-stats">
            <div className="cd-stat-card">
              <span className="cd-stat-label">Students</span>
              <span className="cd-stat-value">{totalStudents}</span>
              <span className="cd-stat-sub">{activeStudents} active</span>
            </div>
            <div className="cd-stat-card">
              <span className="cd-stat-label">Avg. Progress</span>
              <span className="cd-stat-value">{avgProgress}%</span>
              <span className="cd-stat-sub">across all students</span>
            </div>
            <div className="cd-stat-card">
              <span className="cd-stat-label">Lessons Complete</span>
              <span className="cd-stat-value">{lessonsComplete}/{LESSONS.length}</span>
              <span className="cd-stat-sub">by the whole class</span>
            </div>
            <div className="cd-stat-card">
              <span className="cd-stat-label">Subject</span>
              <span className="cd-stat-subject">{cls.subject}</span>
            </div>
          </div>

          {/* ─── Tabs ─────────────────────────────────────────────────────── */}
          <div className="cd-tab-bar">
            <div className="cd-tabs">
              {TABS.map(t => (
                <button
                  key={t.id}
                  className={`cd-tab ${tab === t.id ? 'cd-tab--active' : ''}`}
                  onClick={() => { setTab(t.id); setSearch('') }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Contextual toolbar per tab */}
            {tab === 'students' && (
              <div className="cd-toolbar">
                <SearchBar value={search} onChange={setSearch} placeholder="Search students…" />
                <button className="cd-btn-primary">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5"  y1="12" x2="19" y2="12"/>
                  </svg>
                  Enroll Student
                </button>
              </div>
            )}
            {tab === 'lessons' && (
              <div className="cd-toolbar">
                <SearchBar value={search} onChange={setSearch} placeholder="Search lessons…" />
                <button className="cd-btn-primary">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5"  y1="12" x2="19" y2="12"/>
                  </svg>
                  Assign Lesson
                </button>
              </div>
            )}
            {tab === 'assignments' && (
              <div className="cd-toolbar">
                <button className="cd-btn-primary">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5"  y1="12" x2="19" y2="12"/>
                  </svg>
                  New Assignment
                </button>
              </div>
            )}
          </div>

          {/* ─── Tab content ──────────────────────────────────────────────── */}
          <div className="cd-tab-content">

            {/* Students */}
            {tab === 'students' && (
              <div className="cd-list">
                <div className="cd-list-header">
                  <span className="cd-col cd-col--student">Student</span>
                  <span className="cd-col cd-col--progress">Progress</span>
                  <span className="cd-col cd-col--lessons">Lessons</span>
                  <span className="cd-col cd-col--last">Last Active</span>
                  <span className="cd-col cd-col--status">Status</span>
                  <span className="cd-col cd-col--action" />
                </div>

                {filteredStudents.length === 0 ? (
                  <p className="cd-empty">No students match your search.</p>
                ) : (
                  filteredStudents.map((s, i) => {
                    const pct = Math.round((s.done / cls.lessonsTotal) * 100)
                    return (
                      <div
                        key={s.id}
                        className="cd-row cd-row--student"
                        style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
                      >
                        <div className="cd-col cd-col--student cd-student-cell">
                          <div className="cd-avatar">{s.initials}</div>
                          <div className="cd-student-info">
                            <span className="cd-student-name">{s.name}</span>
                            <span className="cd-student-email">{s.email}</span>
                          </div>
                        </div>
                        <div className="cd-col cd-col--progress cd-progress-cell">
                          <div className="cd-mini-bar">
                            <div className="cd-mini-fill" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="cd-pct">{pct}%</span>
                        </div>
                        <div className="cd-col cd-col--lessons">
                          <span className="cd-mono">{s.done}/{cls.lessonsTotal}</span>
                        </div>
                        <div className="cd-col cd-col--last">
                          <span className="cd-mono cd-muted">{s.lastActive}</span>
                        </div>
                        <div className="cd-col cd-col--status">
                          <span className={`cd-badge cd-badge--${s.status}`}>
                            {s.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="cd-col cd-col--action">
                          <button className="cd-row-action" title="Remove student">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                              <path d="M10 11v6M14 11v6"/>
                              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}

            {/* Lessons */}
            {tab === 'lessons' && (
              <div className="cd-list">
                <div className="cd-list-header">
                  <span className="cd-col cd-col--num">#</span>
                  <span className="cd-col cd-col--lesson">Lesson</span>
                  <span className="cd-col cd-col--cat">Category</span>
                  <span className="cd-col cd-col--dur">Duration</span>
                  <span className="cd-col cd-col--completion">Completion</span>
                  <span className="cd-col cd-col--action" />
                </div>

                {filteredLessons.length === 0 ? (
                  <p className="cd-empty">No lessons match your search.</p>
                ) : (
                  filteredLessons.map((l, i) => {
                    const pct = Math.round((l.completed / l.total) * 100)
                    const isDone = l.completed === l.total
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
                        <div className="cd-col cd-col--cat">
                          <span className="cd-cat-tag">{l.cat}</span>
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
                        <div className="cd-col cd-col--action">
                          <button className="cd-row-action" title="Remove lesson">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                              <path d="M10 11v6M14 11v6"/>
                              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}

            {/* Assignments */}
            {tab === 'assignments' && (
              <div className="cd-list">
                <div className="cd-list-header">
                  <span className="cd-col cd-col--assignment">Assignment</span>
                  <span className="cd-col cd-col--due">Due Date</span>
                  <span className="cd-col cd-col--submissions">Submissions</span>
                  <span className="cd-col cd-col--score">Avg. Score</span>
                  <span className="cd-col cd-col--action" />
                </div>

                {ASSIGNMENTS.map((a, i) => {
                  const subPct = Math.round((a.submitted / a.total) * 100)
                  return (
                    <div
                      key={a.id}
                      className="cd-row cd-row--assignment"
                      style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
                    >
                      <div className="cd-col cd-col--assignment">
                        <span className="cd-assignment-title">{a.title}</span>
                      </div>
                      <div className="cd-col cd-col--due">
                        <span className="cd-mono cd-muted">{a.dueDate}</span>
                      </div>
                      <div className="cd-col cd-col--submissions cd-completion-cell">
                        <div className="cd-mini-bar">
                          <div className="cd-mini-fill" style={{ width: `${subPct}%` }} />
                        </div>
                        <span className="cd-mono cd-completion-count">{a.submitted}/{a.total}</span>
                      </div>
                      <div className="cd-col cd-col--score">
                        {a.avgScore !== null
                          ? <span className="cd-mono">{a.avgScore}<span className="cd-muted">%</span></span>
                          : <span className="cd-mono cd-muted">—</span>
                        }
                      </div>
                      <div className="cd-col cd-col--action">
                        <button className="cd-row-action cd-row-action--view" title="View submissions">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Shared search bar ────────────────────────────────────────────────────
function SearchBar({ value, onChange, placeholder }) {
  return (
    <div className="cd-search-wrap">
      <svg className="cd-search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input
        className="cd-search-input"
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
      {value && (
        <button className="cd-search-clear" onClick={() => onChange('')} title="Clear">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6"  x2="6"  y2="18"/>
            <line x1="6"  y1="6"  x2="18" y2="18"/>
          </svg>
        </button>
      )}
    </div>
  )
}
