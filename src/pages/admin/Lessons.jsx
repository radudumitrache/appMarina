import { useState } from 'react'
import NavBar from '../../components/admin/NavBar'
import '../css/admin/Lessons.css'

const CATEGORIES = [
  { id: 'all',   label: 'All Lessons'         },
  { id: 'nav',   label: 'Bridge Navigation'   },
  { id: 'emg',   label: 'Emergency Protocols' },
  { id: 'eng',   label: 'Engine Room'         },
  { id: 'cargo', label: 'Cargo Management'    },
  { id: 'comm',  label: 'Communications'      },
]

const DIFFICULTIES = ['easy', 'intermediate', 'advanced']

let nextId = 13
const INITIAL_LESSONS = [
  { id: 1,  cat: 'nav',   title: 'Helm Control Basics',        duration: '45 min', difficulty: 'easy',         status: 'published', author: 'Capt. Rodriguez', visibility: 'class'  },
  { id: 2,  cat: 'nav',   title: 'Chart Reading Fundamentals', duration: '60 min', difficulty: 'easy',         status: 'published', author: 'Capt. Rodriguez', visibility: 'class'  },
  { id: 3,  cat: 'nav',   title: 'Radar & ARPA Systems',       duration: '75 min', difficulty: 'intermediate', status: 'published', author: 'Prof. Whitmore',  visibility: 'public' },
  { id: 4,  cat: 'nav',   title: 'Celestial Navigation',       duration: '90 min', difficulty: 'advanced',     status: 'draft',     author: 'Prof. Whitmore',  visibility: 'public' },
  { id: 5,  cat: 'emg',   title: 'Fire Safety Protocols',      duration: '50 min', difficulty: 'easy',         status: 'published', author: 'Instr. Chen',     visibility: 'class'  },
  { id: 6,  cat: 'emg',   title: 'Man Overboard Response',     duration: '60 min', difficulty: 'intermediate', status: 'published', author: 'Instr. Chen',     visibility: 'class'  },
  { id: 7,  cat: 'emg',   title: 'Abandon Ship Procedure',     duration: '45 min', difficulty: 'intermediate', status: 'draft',     author: 'Prof. Whitmore',  visibility: 'public' },
  { id: 8,  cat: 'eng',   title: 'Main Engine Operations',     duration: '80 min', difficulty: 'intermediate', status: 'published', author: 'Eng. Vasquez',    visibility: 'class'  },
  { id: 9,  cat: 'eng',   title: 'Fuel Management Systems',    duration: '65 min', difficulty: 'intermediate', status: 'published', author: 'Eng. Vasquez',    visibility: 'class'  },
  { id: 10, cat: 'cargo', title: 'Load Calculation',           duration: '70 min', difficulty: 'advanced',     status: 'published', author: 'Prof. Whitmore',  visibility: 'public' },
  { id: 11, cat: 'cargo', title: 'Stability & Trim',           duration: '85 min', difficulty: 'advanced',     status: 'draft',     author: 'Prof. Whitmore',  visibility: 'public' },
  { id: 12, cat: 'comm',  title: 'GMDSS Radio Operations',     duration: '55 min', difficulty: 'intermediate', status: 'published', author: 'Instr. Chen',     visibility: 'public' },
]

const EMPTY_FORM = {
  title: '', cat: 'nav', duration: '60 min', difficulty: 'intermediate',
  description: '', status: 'draft', visibility: 'class', author: '',
}

const TEACHERS = ['Capt. Rodriguez', 'Prof. Whitmore', 'Instr. Chen', 'Eng. Vasquez']

function catCount(lessons, catId) {
  return catId === 'all' ? lessons.length : lessons.filter(l => l.cat === catId).length
}

export default function Lessons() {
  const [lessons, setLessons]             = useState(INITIAL_LESSONS)
  const [search, setSearch]               = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [statusFilter, setStatusFilter]   = useState('all') // all | published | draft
  const [panel, setPanel]                 = useState(null)  // null | 'create' | lesson-object
  const [form, setForm]                   = useState(EMPTY_FORM)
  const [deleteTarget, setDeleteTarget]   = useState(null)

  const filtered = lessons
    .filter(l => activeCategory === 'all' || l.cat === activeCategory)
    .filter(l => statusFilter === 'all' || l.status === statusFilter)
    .filter(l => l.title.toLowerCase().includes(search.toLowerCase().trim()))

  const openCreate = () => { setForm(EMPTY_FORM); setPanel('create') }

  const openEdit = (lesson) => {
    setForm({
      title: lesson.title, cat: lesson.cat, duration: lesson.duration,
      difficulty: lesson.difficulty, description: lesson.description || '',
      status: lesson.status, visibility: lesson.visibility, author: lesson.author,
    })
    setPanel(lesson)
  }

  const closePanel = () => setPanel(null)

  const handleSave = () => {
    if (!form.title.trim()) return
    if (panel === 'create') {
      setLessons(prev => [...prev, { id: nextId++, ...form }])
    } else {
      setLessons(prev => prev.map(l => l.id === panel.id ? { ...l, ...form } : l))
    }
    closePanel()
  }

  const toggleStatus = (id) =>
    setLessons(prev => prev.map(l =>
      l.id === id ? { ...l, status: l.status === 'published' ? 'draft' : 'published' } : l
    ))

  const confirmDelete = (lesson) => setDeleteTarget(lesson)

  const executeDelete = () => {
    setLessons(prev => prev.filter(l => l.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  return (
    <div className="lessons-adm-page">
      <div className="lessons-adm-layout">
        <NavBar />
        <div className="lessons-adm-body">

          {/* ─── Sidebar ─────────────────────────────────────────────── */}
          <aside className="sidebar">
            <nav className="sidebar-nav">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  className={`sidebar-btn ${activeCategory === cat.id ? 'sidebar-btn--active' : ''}`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  <div className="sidebar-btn-row">
                    <span className="sidebar-label">{cat.label}</span>
                    <span className="sidebar-count">{catCount(lessons, cat.id)}</span>
                  </div>
                </button>
              ))}
            </nav>

            <div className="sidebar-stat">
              <div className="sidebar-stat-bar">
                <div
                  className="sidebar-stat-fill"
                  style={{
                    width: `${lessons.length
                      ? (lessons.filter(l => l.status === 'published').length / lessons.length) * 100
                      : 0}%`,
                  }}
                />
              </div>
              <span className="sidebar-stat-text">
                <span className="sidebar-stat-num">
                  {lessons.filter(l => l.status === 'published').length}
                </span>
                {' '}of{' '}
                <span className="sidebar-stat-num">{lessons.length}</span>
                {' '}published
              </span>
            </div>
          </aside>

          {/* ─── Main ─────────────────────────────────────────────────── */}
          <main className="lessons-adm-main">

            <div className="lessons-adm-head">
              <h2 className="lessons-adm-title">
                {CATEGORIES.find(c => c.id === activeCategory)?.label}
              </h2>
              <span className="lessons-adm-count">{filtered.length} lessons</span>
              <div className="lessons-adm-actions">
                <button className="btn-primary" onClick={openCreate}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  New Lesson
                </button>
              </div>
            </div>

            <div className="lessons-adm-toolbar">
              <div className="search-wrap">
                <svg className="search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  className="search-input"
                  type="text"
                  placeholder="Search lessons…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                {search && (
                  <button className="search-clear" onClick={() => setSearch('')}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                )}
              </div>
              <div className="status-filter">
                {[
                  { id: 'all',       label: 'All'       },
                  { id: 'published', label: 'Published' },
                  { id: 'draft',     label: 'Draft'     },
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
            </div>

            <div className="lessons-adm-list">
              {filtered.length === 0 ? (
                <p className="lessons-adm-empty">No lessons match your filters.</p>
              ) : (
                filtered.map((lesson, i) => (
                  <div
                    key={lesson.id}
                    className="lesson-row"
                    style={{ animationDelay: `${Math.min(i, 12) * 0.025}s` }}
                  >
                    <div className="lesson-row-main">
                      <div className="lesson-row-title">{lesson.title}</div>
                      <div className="lesson-row-meta">
                        <span className="lesson-cat-badge">
                          {CATEGORIES.find(c => c.id === lesson.cat)?.label}
                        </span>
                        <span className="lesson-meta-sep">·</span>
                        <span className="lesson-duration">{lesson.duration}</span>
                        <span className="lesson-meta-sep">·</span>
                        <span className={`lesson-difficulty lesson-difficulty--${lesson.difficulty}`}>
                          {lesson.difficulty}
                        </span>
                        <span className="lesson-meta-sep">·</span>
                        <span className="lesson-author">{lesson.author}</span>
                      </div>
                    </div>

                    <div className="lesson-row-right">
                      <span className={`lesson-status-badge lesson-status-badge--${lesson.status}`}>
                        {lesson.status}
                      </span>
                      <div className="lesson-row-actions">
                        <button className="row-btn" onClick={() => openEdit(lesson)} title="Edit lesson">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button
                          className={`row-btn ${lesson.status === 'published' ? 'row-btn--warn' : 'row-btn--ok'}`}
                          onClick={() => toggleStatus(lesson.id)}
                          title={lesson.status === 'published' ? 'Unpublish' : 'Publish'}
                        >
                          {lesson.status === 'published' ? (
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                              <line x1="1" y1="1" x2="23" y2="23"/>
                            </svg>
                          ) : (
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                              <circle cx="12" cy="12" r="3"/>
                            </svg>
                          )}
                        </button>
                        <button
                          className="row-btn row-btn--delete"
                          onClick={() => confirmDelete(lesson)}
                          title="Delete lesson"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                            <path d="M10 11v6"/><path d="M14 11v6"/>
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

          </main>
        </div>
      </div>

      {/* ─── Create / Edit panel ──────────────────────────────────────────── */}
      {panel !== null && (
        <>
          <div className="panel-backdrop" onClick={closePanel} />
          <aside className="lesson-panel">
            <div className="panel-header">
              <h3 className="panel-title">{panel === 'create' ? 'New Lesson' : 'Edit Lesson'}</h3>
              <button className="modal-close" onClick={closePanel}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="panel-body">
              <div className="form-row">
                <label className="form-label">Title</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="e.g. Helm Control Basics"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div className="form-row">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={form.cat}
                  onChange={e => setForm(f => ({ ...f, cat: e.target.value }))}
                >
                  {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-row-2col">
                <div className="form-row">
                  <label className="form-label">Duration</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="e.g. 45 min"
                    value={form.duration}
                    onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                  />
                </div>
                <div className="form-row">
                  <label className="form-label">Difficulty</label>
                  <select
                    className="form-select"
                    value={form.difficulty}
                    onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}
                  >
                    {DIFFICULTIES.map(d => (
                      <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <label className="form-label">Author</label>
                <select
                  className="form-select"
                  value={form.author}
                  onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
                >
                  <option value="">Select a teacher…</option>
                  {TEACHERS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-row">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  placeholder="Brief description of this lesson…"
                  rows={3}
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div className="form-row-2col">
                <div className="form-row">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
                <div className="form-row">
                  <label className="form-label">Visibility</label>
                  <select
                    className="form-select"
                    value={form.visibility}
                    onChange={e => setForm(f => ({ ...f, visibility: e.target.value }))}
                  >
                    <option value="class">Class only</option>
                    <option value="public">Public</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="panel-footer">
              <button className="btn-ghost" onClick={closePanel}>Cancel</button>
              <button
                className="btn-primary"
                onClick={handleSave}
                disabled={!form.title.trim()}
              >
                {panel === 'create' ? 'Create Lesson' : 'Save Changes'}
              </button>
            </div>
          </aside>
        </>
      )}

      {/* ─── Delete confirmation ──────────────────────────────────────────── */}
      {deleteTarget && (
        <div className="modal-backdrop" onClick={() => setDeleteTarget(null)}>
          <div className="modal modal--sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Delete Lesson</h3>
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
                <strong className="confirm-name">{deleteTarget.title}</strong>?
                This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn-danger" onClick={executeDelete}>Delete Lesson</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
