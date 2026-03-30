import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '../../components/teacher/NavBar'
import '../css/teacher/CourseBuilder.css'

// ─── Mock data ────────────────────────────────────────────────────────────
const LESSON_BANK = [
  { id: 101, title: 'Helm Control Basics',        cat: 'Navigation',   duration: '45 min' },
  { id: 102, title: 'Chart Reading Fundamentals', cat: 'Navigation',   duration: '60 min' },
  { id: 103, title: 'Radar & ARPA Systems',       cat: 'Navigation',   duration: '75 min' },
  { id: 104, title: 'Celestial Navigation',       cat: 'Navigation',   duration: '90 min' },
  { id: 105, title: 'Fire Safety Protocols',      cat: 'Emergency',    duration: '50 min' },
  { id: 106, title: 'Man Overboard Response',     cat: 'Emergency',    duration: '60 min' },
  { id: 107, title: 'Abandon Ship Procedure',     cat: 'Emergency',    duration: '45 min' },
  { id: 108, title: 'Main Engine Operations',     cat: 'Engineering',  duration: '80 min' },
  { id: 109, title: 'Fuel Management Systems',    cat: 'Engineering',  duration: '65 min' },
  { id: 110, title: 'Load Calculation',           cat: 'Cargo',        duration: '70 min' },
  { id: 111, title: 'Stability & Trim',           cat: 'Cargo',        duration: '85 min' },
  { id: 112, title: 'GMDSS Radio Operations',     cat: 'Communications', duration: '55 min' },
]

const INITIAL_COURSES = [
  {
    id: 1,
    title: 'Maritime Navigation Fundamentals',
    description: 'Core navigation skills for cadets.',
    status: 'published',
    lessons: [101, 102, 103, 104],
  },
  {
    id: 2,
    title: 'Emergency & Safety Procedures',
    description: 'Essential safety protocols for life at sea.',
    status: 'published',
    lessons: [105, 106, 107],
  },
  {
    id: 3,
    title: 'Engine Room & Engineering',
    description: 'Propulsion systems and maintenance.',
    status: 'draft',
    lessons: [108, 109],
  },
  {
    id: 4,
    title: 'Cargo & Stability',
    description: 'Load management and vessel stability.',
    status: 'draft',
    lessons: [],
  },
]

const CAT_COLORS = {
  'Navigation':     'cat--nav',
  'Emergency':      'cat--emg',
  'Engineering':    'cat--eng',
  'Cargo':          'cat--cargo',
  'Communications': 'cat--comm',
}

function totalDuration(lessonIds) {
  const mins = lessonIds.reduce((sum, id) => {
    const l = LESSON_BANK.find(b => b.id === id)
    return sum + (l ? parseInt(l.duration, 10) : 0)
  }, 0)
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h === 0) return `${m} min`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export default function CourseBuilder() {
  const navigate = useNavigate()
  const [courses, setCourses]         = useState(INITIAL_COURSES)
  const [selectedId, setSelected]     = useState(1)
  const [search, setSearch]           = useState('')
  const [bankSearch, setBankSearch]   = useState('')
  const [bankOpen, setBankOpen]       = useState(false)

  const selected = courses.find(c => c.id === selectedId)

  const visible = courses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase().trim())
  )

  const bankFiltered = LESSON_BANK.filter(l =>
    l.title.toLowerCase().includes(bankSearch.toLowerCase().trim()) ||
    l.cat.toLowerCase().includes(bankSearch.toLowerCase().trim())
  )

  function updateCourse(id, patch) {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c))
  }

  function removeLesson(courseId, lessonId) {
    setCourses(prev => prev.map(c =>
      c.id === courseId ? { ...c, lessons: c.lessons.filter(l => l !== lessonId) } : c
    ))
  }

  function addLesson(lessonId) {
    if (selected.lessons.includes(lessonId)) return
    setCourses(prev => prev.map(c =>
      c.id === selectedId ? { ...c, lessons: [...c.lessons, lessonId] } : c
    ))
  }

  function moveLesson(courseId, fromIdx, toIdx) {
    setCourses(prev => prev.map(c => {
      if (c.id !== courseId) return c
      const ls = [...c.lessons]
      const [item] = ls.splice(fromIdx, 1)
      ls.splice(toIdx, 0, item)
      return { ...c, lessons: ls }
    }))
  }

  function toggleStatus(id) {
    setCourses(prev => prev.map(c =>
      c.id === id ? { ...c, status: c.status === 'published' ? 'draft' : 'published' } : c
    ))
  }

  return (
    <div className="cb-page">
      <div className="cb-layout">
        <NavBar />

        <div className="cb-body">

          {/* ─── Sidebar: course list ───────────────────────────────────── */}
          <aside className="cb-sidebar">
            <div className="cb-sidebar-top">
              <div className="cb-sidebar-search-wrap">
                <svg className="cb-sidebar-search-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  className="cb-sidebar-search"
                  type="text"
                  placeholder="Search courses…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <button className="cb-new-btn" onClick={() => {
                const id = Date.now()
                setCourses(prev => [...prev, { id, title: 'Untitled Course', description: '', status: 'draft', lessons: [] }])
                setSelected(id)
              }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                New
              </button>
            </div>

            <nav className="cb-course-nav">
              {visible.map(c => (
                <button
                  key={c.id}
                  className={`cb-course-item ${selectedId === c.id ? 'cb-course-item--active' : ''}`}
                  onClick={() => setSelected(c.id)}
                >
                  <div className="cb-course-item-row">
                    <span className="cb-course-item-title">{c.title}</span>
                    <span className={`cb-course-item-status ${c.status === 'published' ? 'cb-status--published' : 'cb-status--draft'}`}>
                      {c.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <div className="cb-course-item-meta">
                    <span>{c.lessons.length} lessons</span>
                    {c.lessons.length > 0 && <span>{totalDuration(c.lessons)}</span>}
                  </div>
                </button>
              ))}
            </nav>

            <div className="cb-sidebar-footer">
              <span className="cb-sidebar-footer-num">{courses.filter(c => c.status === 'published').length}</span>
              {' '}of{' '}
              <span className="cb-sidebar-footer-num">{courses.length}</span>
              {' '}published
            </div>
          </aside>

          {/* ─── Main: course editor ────────────────────────────────────── */}
          {selected ? (
            <main className="cb-main" key={selected.id}>

              {/* Editor header */}
              <div className="cb-editor-header">
                <div className="cb-editor-header-left">
                  <button className="cb-crumb-link" onClick={() => navigate('/teacher/dashboard')}>
                    Dashboard /
                  </button>
                  <input
                    className="cb-title-input"
                    value={selected.title}
                    onChange={e => updateCourse(selected.id, { title: e.target.value })}
                    placeholder="Course title…"
                  />
                  <input
                    className="cb-desc-input"
                    value={selected.description}
                    onChange={e => updateCourse(selected.id, { description: e.target.value })}
                    placeholder="Short description…"
                  />
                </div>
                <div className="cb-editor-header-right">
                  <span className={`cb-status-badge ${selected.status === 'published' ? 'cb-status--published' : 'cb-status--draft'}`}>
                    {selected.status === 'published' ? 'Published' : 'Draft'}
                  </span>
                  <button className="cb-toggle-btn" onClick={() => toggleStatus(selected.id)}>
                    {selected.status === 'draft' ? 'Publish' : 'Unpublish'}
                  </button>
                </div>
              </div>

              {/* Summary bar */}
              <div className="cb-summary-bar">
                <div className="cb-summary-stat">
                  <span className="cb-summary-value">{selected.lessons.length}</span>
                  <span className="cb-summary-label">lessons</span>
                </div>
                <div className="cb-summary-divider" />
                <div className="cb-summary-stat">
                  <span className="cb-summary-value">{selected.lessons.length > 0 ? totalDuration(selected.lessons) : '—'}</span>
                  <span className="cb-summary-label">total duration</span>
                </div>
                <div className="cb-summary-divider" />
                <div className="cb-summary-stat">
                  <span className="cb-summary-value">
                    {[...new Set(selected.lessons.map(id => LESSON_BANK.find(l => l.id === id)?.cat).filter(Boolean))].length}
                  </span>
                  <span className="cb-summary-label">categories</span>
                </div>
              </div>

              <div className="cb-divider" />

              {/* Lesson list */}
              <div className="cb-section-head">
                <span className="cb-section-title">Course Lessons</span>
                <span className="cb-section-hint">Use arrows to reorder</span>
              </div>

              <div className="cb-lesson-list">
                {selected.lessons.length === 0 && (
                  <div className="cb-empty">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-3)' }}>
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                    </svg>
                    <span>No lessons yet. Add from the bank below.</span>
                  </div>
                )}

                {selected.lessons.map((lessonId, i) => {
                  const lesson = LESSON_BANK.find(l => l.id === lessonId)
                  if (!lesson) return null
                  return (
                    <div
                      key={lessonId}
                      className="cb-lesson-row"
                      style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
                    >
                      <span className="cb-lesson-num">{String(i + 1).padStart(2, '0')}</span>
                      <div className="cb-lesson-body">
                        <span className="cb-lesson-title">{lesson.title}</span>
                        <div className="cb-lesson-meta">
                          <span className={`cb-cat-tag ${CAT_COLORS[lesson.cat] || ''}`}>{lesson.cat}</span>
                          <span className="cb-lesson-duration">{lesson.duration}</span>
                        </div>
                      </div>
                      <div className="cb-lesson-actions">
                        <button
                          className="cb-reorder-btn"
                          disabled={i === 0}
                          onClick={() => moveLesson(selected.id, i, i - 1)}
                          title="Move up"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="18 15 12 9 6 15"/>
                          </svg>
                        </button>
                        <button
                          className="cb-reorder-btn"
                          disabled={i === selected.lessons.length - 1}
                          onClick={() => moveLesson(selected.id, i, i + 1)}
                          title="Move down"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9"/>
                          </svg>
                        </button>
                        <button
                          className="cb-remove-btn"
                          onClick={() => removeLesson(selected.id, lessonId)}
                          title="Remove"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6"  y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* ─── Lesson bank ──────────────────────────────────────────── */}
              <div className="cb-bank-section">
                <button
                  className={`cb-bank-toggle ${bankOpen ? 'cb-bank-toggle--open' : ''}`}
                  onClick={() => setBankOpen(v => !v)}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                  </svg>
                  Lesson Bank
                  <span className="cb-bank-count">{LESSON_BANK.length}</span>
                  <svg className="cb-bank-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>

                {bankOpen && (
                  <div className="cb-bank-panel">
                    <div className="cb-bank-search-wrap">
                      <svg className="cb-bank-search-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                      </svg>
                      <input
                        className="cb-bank-search"
                        type="text"
                        placeholder="Filter lessons…"
                        value={bankSearch}
                        onChange={e => setBankSearch(e.target.value)}
                      />
                    </div>
                    <div className="cb-bank-list">
                      {bankFiltered.map((lesson, i) => {
                        const added = selected.lessons.includes(lesson.id)
                        return (
                          <div
                            key={lesson.id}
                            className={`cb-bank-row ${added ? 'cb-bank-row--added' : ''}`}
                            style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
                          >
                            <div className="cb-bank-row-body">
                              <span className="cb-bank-title">{lesson.title}</span>
                              <div className="cb-bank-meta">
                                <span className={`cb-cat-tag ${CAT_COLORS[lesson.cat] || ''}`}>{lesson.cat}</span>
                                <span className="cb-bank-dur">{lesson.duration}</span>
                              </div>
                            </div>
                            <button
                              className={`cb-bank-add-btn ${added ? 'cb-bank-add-btn--added' : ''}`}
                              onClick={() => !added && addLesson(lesson.id)}
                              disabled={added}
                            >
                              {added ? (
                                <>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"/>
                                  </svg>
                                  Added
                                </>
                              ) : (
                                <>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                                  </svg>
                                  Add
                                </>
                              )}
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

            </main>
          ) : (
            <main className="cb-main cb-main--empty">
              <span>Select a course to edit</span>
            </main>
          )}

        </div>
      </div>
    </div>
  )
}
