import { useState } from 'react'
import NavBar from '../../components/shared/NavBar'
import TestCard from '../../components/student/tests/TestCard'
import '../css/student/Tests.css'

const CLASSES = [
  { id: 'all',    label: 'All Tests'          },
  { id: 'nav',    label: 'Maritime Nav 101'   },
  { id: 'safety', label: 'Safety & Emergency' },
  { id: 'eng',    label: 'Engineering Ops'    },
  { id: 'comms',  label: 'Communications'     },
  { id: 'open',   label: 'Open Access'        },
]

const CLASS_LABELS = {
  nav:    'Maritime Nav 101',
  safety: 'Safety & Emergency',
  eng:    'Engineering Ops',
  comms:  'Communications',
}

// Today is 2026-03-29
const INITIAL_TESTS = [
  { id: 1,  title: 'Bridge Navigation Fundamentals', author: 'Capt. Rodriguez', classId: 'nav',    dueDate: '2026-04-01', completed: false, grade: null },
  { id: 2,  title: 'Emergency Protocol Assessment',  author: 'Instr. Chen',     classId: 'safety', dueDate: '2026-04-12', completed: false, grade: null },
  { id: 3,  title: 'Radar & ARPA Systems Exam',      author: 'Prof. Whitmore',  classId: null,     dueDate: null,         completed: false, grade: null },
  { id: 4,  title: 'Engine Room Operations Quiz',    author: 'Eng. Vasquez',    classId: 'eng',    dueDate: '2026-04-20', completed: false, grade: null },
  { id: 5,  title: 'GMDSS Radio Procedures',         author: 'Instr. Chen',     classId: 'comms',  dueDate: '2026-03-27', completed: false, grade: null },
  { id: 6,  title: 'Helm Control Basics Test',       author: 'Capt. Rodriguez', classId: 'nav',    dueDate: null,         completed: true,  grade: 92   },
  { id: 7,  title: 'Fire Safety Assessment',         author: 'Instr. Chen',     classId: 'safety', dueDate: null,         completed: true,  grade: 78   },
  { id: 8,  title: 'Chart Reading Fundamentals',     author: 'Prof. Whitmore',  classId: null,     dueDate: null,         completed: true,  grade: 85   },
  { id: 9,  title: 'Load Calculation Quiz',          author: 'Prof. Whitmore',  classId: null,     dueDate: null,         completed: true,  grade: 61   },
  { id: 10, title: 'Man Overboard Drill Test',       author: 'Instr. Chen',     classId: 'safety', dueDate: null,         completed: true,  grade: 45   },
]

function getClassStats(tests, classId) {
  const subset =
    classId === 'all'  ? tests :
    classId === 'open' ? tests.filter(t => t.classId === null) :
    tests.filter(t => t.classId === classId)
  return {
    total:   subset.length,
    pending: subset.filter(t => !t.completed).length,
    done:    subset.filter(t => t.completed).length,
  }
}

function avgGrade(tests) {
  const completed = tests.filter(t => t.completed && t.grade !== null)
  if (!completed.length) return null
  return Math.round(completed.reduce((s, t) => s + t.grade, 0) / completed.length)
}

export default function Tests() {
  const [tests, setTests]               = useState(INITIAL_TESTS)
  const [activeClass, setActiveClass]   = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [searchQuery, setSearchQuery]   = useState('')

  // Filter by class sidebar
  const byClass =
    activeClass === 'all'  ? tests :
    activeClass === 'open' ? tests.filter(t => t.classId === null) :
    tests.filter(t => t.classId === activeClass)

  // Filter by source toggle
  const bySource =
    sourceFilter === 'all'     ? byClass :
    sourceFilter === 'class'   ? byClass.filter(t => t.classId !== null) :
    byClass.filter(t => t.classId === null)

  // Filter by search
  const filtered = bySource.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase().trim())
  )

  const pending   = filtered.filter(t => !t.completed)
  const completed = filtered.filter(t => t.completed)

  // Sort pending: overdue first, then by due date, then no due date
  const sortedPending = [...pending].sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0
    if (!a.dueDate) return 1
    if (!b.dueDate) return -1
    return new Date(a.dueDate) - new Date(b.dueDate)
  })

  const overall  = getClassStats(tests, 'all')
  const avg      = avgGrade(tests)

  return (
    <div className="tests-page">
      <div className="tests-layout">
        <NavBar />

        <div className="tests-body">

          {/* Sidebar */}
          <aside className="tests-sidebar">
            <nav className="tests-sidebar-nav">
              {CLASSES.map((cls) => {
                const stats = getClassStats(tests, cls.id)
                return (
                  <button
                    key={cls.id}
                    className={`tests-sidebar-btn ${activeClass === cls.id ? 'tests-sidebar-btn--active' : ''}`}
                    onClick={() => setActiveClass(cls.id)}
                  >
                    <div className="tests-sidebar-row">
                      <span className="tests-sidebar-label">{cls.label}</span>
                      <span className="tests-sidebar-count">{stats.pending}/{stats.total}</span>
                    </div>
                  </button>
                )
              })}
            </nav>

            <div className="tests-sidebar-footer">
              <div className="tests-sidebar-stat">
                <span className="tests-sidebar-stat-num">{overall.done}</span>
                <span className="tests-sidebar-stat-text"> of </span>
                <span className="tests-sidebar-stat-num">{overall.total}</span>
                <span className="tests-sidebar-stat-text"> completed</span>
              </div>
              {avg !== null && (
                <div className="tests-sidebar-avg">
                  <span className="tests-sidebar-avg-label">Avg grade</span>
                  <span className="tests-sidebar-avg-value">{avg}%</span>
                </div>
              )}
            </div>
          </aside>

          {/* Main */}
          <main className="tests-main">

            <div className="tests-head">
              <h2 className="tests-title">
                {CLASSES.find(c => c.id === activeClass)?.label}
              </h2>
              <span className="tests-count">{filtered.length} tests</span>
            </div>

            <div className="tests-toolbar">
              <div className="tests-search-wrap">
                <svg className="tests-search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  className="tests-search-input"
                  type="text"
                  placeholder="Search tests…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button className="tests-search-clear" onClick={() => setSearchQuery('')} title="Clear">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6"  x2="6"  y2="18"/>
                      <line x1="6"  y1="6"  x2="18" y2="18"/>
                    </svg>
                  </button>
                )}
              </div>

              <div className="tests-source-filter">
                {[
                  { id: 'all',   label: 'All'          },
                  { id: 'class', label: 'My Classes'    },
                  { id: 'open',  label: 'Open Access'   },
                ].map(v => (
                  <button
                    key={v.id}
                    className={`tests-source-btn ${sourceFilter === v.id ? 'tests-source-btn--active' : ''}`}
                    onClick={() => setSourceFilter(v.id)}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="tests-content">

              {/* Upcoming section */}
              <section className="tests-section">
                <div className="tests-section-head">
                  <span className="tests-section-title">Upcoming</span>
                  <span className="tests-section-badge">{sortedPending.length}</span>
                </div>

                {sortedPending.length === 0 ? (
                  <p className="tests-empty">No upcoming tests.</p>
                ) : (
                  <div className="tests-list">
                    {sortedPending.map((test, i) => (
                      <TestCard
                        key={test.id}
                        test={test}
                        index={i}
                        className={test.classId ? CLASS_LABELS[test.classId] : null}
                      />
                    ))}
                  </div>
                )}
              </section>

              {/* Completed section */}
              <section className="tests-section">
                <div className="tests-section-head">
                  <span className="tests-section-title">Completed</span>
                  <span className="tests-section-badge">{completed.length}</span>
                  {completed.length > 0 && (
                    <span className="tests-section-avg">
                      avg&nbsp;
                      <span className="tests-section-avg-num">{avgGrade(completed)}%</span>
                    </span>
                  )}
                </div>

                {completed.length === 0 ? (
                  <p className="tests-empty">No completed tests yet.</p>
                ) : (
                  <div className="tests-list">
                    {completed.map((test, i) => (
                      <TestCard
                        key={test.id}
                        test={test}
                        index={i}
                        className={test.classId ? CLASS_LABELS[test.classId] : null}
                      />
                    ))}
                  </div>
                )}
              </section>

            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
