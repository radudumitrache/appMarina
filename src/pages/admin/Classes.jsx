import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '../../components/admin/NavBar'
import '../css/admin/Classes.css'

const TEACHERS = ['Capt. Rodriguez', 'Prof. Whitmore', 'Instr. Chen', 'Eng. Vasquez']

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

let nextId = 5
const INITIAL_CLASSES = [
  {
    id: 1,
    name: 'SEC-2024-A',
    teacher: 'Capt. Rodriguez',
    students: [1, 2, 5],
    lessons: [1, 2, 3, 5],
    status: 'active',
    description: 'Main cohort — Spring 2024',
  },
  {
    id: 2,
    name: 'SEC-2024-B',
    teacher: 'Prof. Whitmore',
    students: [3, 4, 11],
    lessons: [1, 3, 6, 8],
    status: 'active',
    description: 'Advanced track — Spring 2024',
  },
  {
    id: 3,
    name: 'SEC-2024-C',
    teacher: 'Instr. Chen',
    students: [6, 8, 12],
    lessons: [1, 2, 5, 12],
    status: 'active',
    description: 'Evening cohort — Spring 2024',
  },
  {
    id: 4,
    name: 'SEC-2023-A',
    teacher: 'Eng. Vasquez',
    students: [7, 9, 10],
    lessons: [1, 2, 3, 8, 10],
    status: 'archived',
    description: 'Completed cohort — 2023',
  },
]

const EMPTY_FORM = {
  name: '', teacher: TEACHERS[0], students: [], lessons: [], status: 'active', description: '',
}

function toggleItem(arr, id) {
  return arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id]
}

export default function Classes() {
  const navigate                       = useNavigate()
  const [classes, setClasses]         = useState(INITIAL_CLASSES)
  const [search, setSearch]           = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // all | active | archived
  const [modal, setModal]             = useState(null)    // null | 'create' | class-object
  const [form, setForm]               = useState(EMPTY_FORM)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [expandedStudents, setExpandedStudents] = useState(null) // class id
  const [expandedLessons, setExpandedLessons]   = useState(null)

  const filtered = classes
    .filter(c => statusFilter === 'all' || c.status === statusFilter)
    .filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.teacher.toLowerCase().includes(search.toLowerCase())
    )

  const openCreate = () => { setForm(EMPTY_FORM); setModal('create') }

  const openEdit = (cls) => {
    setForm({
      name: cls.name, teacher: cls.teacher, students: [...cls.students],
      lessons: [...cls.lessons], status: cls.status, description: cls.description || '',
    })
    setModal(cls)
  }

  const closeModal = () => setModal(null)

  const handleSave = () => {
    if (!form.name.trim()) return
    if (modal === 'create') {
      setClasses(prev => [...prev, { id: nextId++, ...form }])
    } else {
      setClasses(prev => prev.map(c => c.id === modal.id ? { ...c, ...form } : c))
    }
    closeModal()
  }

  const toggleArchive = (id) =>
    setClasses(prev => prev.map(c =>
      c.id === id ? { ...c, status: c.status === 'active' ? 'archived' : 'active' } : c
    ))

  const confirmDelete = (cls) => setDeleteTarget(cls)

  const executeDelete = () => {
    setClasses(prev => prev.filter(c => c.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  const stats = {
    total:    classes.length,
    active:   classes.filter(c => c.status === 'active').length,
    archived: classes.filter(c => c.status === 'archived').length,
    students: new Set(classes.flatMap(c => c.students)).size,
  }

  return (
    <div className="classes-adm-page">
      <div className="classes-adm-layout">
        <NavBar />

        {/* ─── Page header ─────────────────────────────────────────────── */}
        <div className="classes-adm-header">
          <div className="classes-adm-header-left">
            <h1 className="classes-adm-title">Classes</h1>
            <span className="classes-adm-count">{filtered.length} classes</span>
          </div>
          <div className="classes-adm-header-right">
            <div className="search-wrap-inline">
              <svg className="search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                className="search-input-inline"
                type="text"
                placeholder="Search classes or teachers…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="classes-status-filter">
              {[
                { id: 'all',      label: 'All'      },
                { id: 'active',   label: 'Active'   },
                { id: 'archived', label: 'Archived' },
              ].map(s => (
                <button
                  key={s.id}
                  className={`status-filter-btn ${statusFilter === s.id ? 'status-filter-btn--active' : ''}`}
                  onClick={() => setStatusFilter(s.id)}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <button className="btn-primary" onClick={openCreate}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New Class
            </button>
          </div>
        </div>

        {/* ─── Stats strip ─────────────────────────────────────────────── */}
        <div className="classes-stats">
          {[
            { label: 'Total Classes',    value: stats.total    },
            { label: 'Active',           value: stats.active   },
            { label: 'Archived',         value: stats.archived },
            { label: 'Students Enrolled', value: stats.students },
          ].map(s => (
            <div key={s.label} className="stat-pill">
              <span className="stat-pill-value">{s.value}</span>
              <span className="stat-pill-label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* ─── Class cards grid ─────────────────────────────────────────── */}
        <div className="classes-adm-main">
          {filtered.length === 0 ? (
            <p className="classes-adm-empty">No classes found.</p>
          ) : (
            <div className="classes-grid">
              {filtered.map((cls, i) => (
                <div
                  key={cls.id}
                  className={`class-card ${cls.status === 'archived' ? 'class-card--archived' : ''}`}
                  style={{ animationDelay: `${Math.min(i, 8) * 0.04}s` }}
                >
                  <div className="class-card-header">
                    <div className="class-card-name-row">
                      <h3 className="class-card-name">{cls.name}</h3>
                      <span className={`class-status-badge class-status-badge--${cls.status}`}>
                        {cls.status}
                      </span>
                    </div>
                    {cls.description && (
                      <p className="class-card-desc">{cls.description}</p>
                    )}
                  </div>

                  <div className="class-card-teacher">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <span className="class-teacher-name">{cls.teacher}</span>
                  </div>

                  <div className="class-card-counts">
                    <button
                      className="class-count-btn"
                      onClick={() => setExpandedStudents(expandedStudents === cls.id ? null : cls.id)}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                      <span className="class-count-num">{cls.students.length}</span>
                      <span className="class-count-label">students</span>
                    </button>
                    <span className="class-count-sep">·</span>
                    <button
                      className="class-count-btn"
                      onClick={() => setExpandedLessons(expandedLessons === cls.id ? null : cls.id)}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                      </svg>
                      <span className="class-count-num">{cls.lessons.length}</span>
                      <span className="class-count-label">lessons</span>
                    </button>
                  </div>

                  {/* Expandable student list */}
                  {expandedStudents === cls.id && (
                    <div className="class-expand">
                      <p className="class-expand-label">Students</p>
                      <div className="class-expand-list">
                        {cls.students.length === 0
                          ? <span className="class-expand-empty">No students assigned</span>
                          : cls.students.map(sid => {
                              const s = ALL_STUDENTS.find(x => x.id === sid)
                              return s ? (
                                <span key={sid} className="class-expand-chip">{s.name}</span>
                              ) : null
                            })
                        }
                      </div>
                    </div>
                  )}

                  {/* Expandable lesson list */}
                  {expandedLessons === cls.id && (
                    <div className="class-expand">
                      <p className="class-expand-label">Lessons</p>
                      <div className="class-expand-list">
                        {cls.lessons.length === 0
                          ? <span className="class-expand-empty">No lessons assigned</span>
                          : cls.lessons.map(lid => {
                              const l = ALL_LESSONS.find(x => x.id === lid)
                              return l ? (
                                <span key={lid} className="class-expand-chip">{l.title}</span>
                              ) : null
                            })
                        }
                      </div>
                    </div>
                  )}

                  <div className="class-card-actions">
                    <button
                      className="class-action-btn class-action-btn--manage"
                      onClick={() => navigate(`/admin/classes/${cls.id}`)}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                      Manage
                    </button>
                    <button className="class-action-btn" onClick={() => openEdit(cls)}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                      Edit
                    </button>
                    <button
                      className="class-action-btn"
                      onClick={() => toggleArchive(cls.id)}
                    >
                      {cls.status === 'active' ? (
                        <>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="21 8 21 21 3 21 3 8"/>
                            <rect x="1" y="3" width="22" height="5"/>
                            <line x1="10" y1="12" x2="14" y2="12"/>
                          </svg>
                          Archive
                        </>
                      ) : (
                        <>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="1 4 1 10 7 10"/>
                            <path d="M3.51 15a9 9 0 1 0 .49-4.95"/>
                          </svg>
                          Restore
                        </>
                      )}
                    </button>
                    <button
                      className="class-action-btn class-action-btn--delete"
                      onClick={() => confirmDelete(cls)}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        <path d="M10 11v6"/><path d="M14 11v6"/>
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── Create / Edit modal ──────────────────────────────────────────── */}
      {modal !== null && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal modal--wide" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{modal === 'create' ? 'New Class' : 'Edit Class'}</h3>
              <button className="modal-close" onClick={closeModal}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="modal-body modal-body--scroll">
              <div className="form-2col">
                <div className="form-row">
                  <label className="form-label">Class Name</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="e.g. SEC-2025-A"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div className="form-row">
                  <label className="form-label">Teacher</label>
                  <select
                    className="form-select"
                    value={form.teacher}
                    onChange={e => setForm(f => ({ ...f, teacher: e.target.value }))}
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
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div className="form-row">
                <label className="form-label">Status</label>
                <div className="form-radio-group">
                  {['active', 'archived'].map(s => (
                    <label
                      key={s}
                      className={`form-radio ${form.status === s ? 'form-radio--active' : ''}`}
                    >
                      <input
                        type="radio"
                        name="class-status"
                        value={s}
                        checked={form.status === s}
                        onChange={() => setForm(f => ({ ...f, status: s }))}
                      />
                      <span>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-2col">
                <div className="form-row">
                  <label className="form-label">Students</label>
                  <div className="checklist">
                    {ALL_STUDENTS.map(s => (
                      <label
                        key={s.id}
                        className={`checklist-item ${form.students.includes(s.id) ? 'checklist-item--checked' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={form.students.includes(s.id)}
                          onChange={() => setForm(f => ({ ...f, students: toggleItem(f.students, s.id) }))}
                        />
                        <span className="checklist-check">
                          {form.students.includes(s.id) && (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          )}
                        </span>
                        <span className="checklist-label">{s.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="form-row">
                  <label className="form-label">Lessons</label>
                  <div className="checklist">
                    {ALL_LESSONS.map(l => (
                      <label
                        key={l.id}
                        className={`checklist-item ${form.lessons.includes(l.id) ? 'checklist-item--checked' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={form.lessons.includes(l.id)}
                          onChange={() => setForm(f => ({ ...f, lessons: toggleItem(f.lessons, l.id) }))}
                        />
                        <span className="checklist-check">
                          {form.lessons.includes(l.id) && (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          )}
                        </span>
                        <span className="checklist-label">{l.title}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={closeModal}>Cancel</button>
              <button
                className="btn-primary"
                onClick={handleSave}
                disabled={!form.name.trim()}
              >
                {modal === 'create' ? 'Create Class' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Delete confirmation ──────────────────────────────────────────── */}
      {deleteTarget && (
        <div className="modal-backdrop" onClick={() => setDeleteTarget(null)}>
          <div className="modal modal--sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Delete Class</h3>
              <button className="modal-close" onClick={() => setDeleteTarget(null)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <p className="confirm-text">
                Are you sure you want to delete{' '}
                <strong className="confirm-name">{deleteTarget.name}</strong>?
                This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn-danger" onClick={executeDelete}>Delete Class</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
