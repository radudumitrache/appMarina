import { useState, useRef, useEffect } from 'react'
import NavBar from '../../components/student/NavBar'
import LessonCard from '../../components/student/lessons/LessonCard'
import FilterPanel from '../../components/student/lessons/FilterPanel'
import '../css/student/Lessons.css'

const CATEGORIES = [
  { id: 'all',   label: 'All Modules'         },
  { id: 'nav',   label: 'Bridge Navigation'   },
  { id: 'emg',   label: 'Emergency Protocols' },
  { id: 'eng',   label: 'Engine Room'         },
  { id: 'cargo', label: 'Cargo Management'    },
  { id: 'comm',  label: 'Communications'      },
]

const INITIAL_LESSONS = [
  { id: 1,  cat: 'nav',   title: 'Helm Control Basics',        duration: '45 min', locked: false, complete: true,  author: 'Capt. Rodriguez', visibility: 'class',  difficulty: 'easy'         },
  { id: 2,  cat: 'nav',   title: 'Chart Reading Fundamentals', duration: '60 min', locked: false, complete: true,  author: 'Capt. Rodriguez', visibility: 'class',  difficulty: 'easy'         },
  { id: 3,  cat: 'nav',   title: 'Radar & ARPA Systems',       duration: '75 min', locked: false, complete: false, author: 'Prof. Whitmore',  visibility: 'public', difficulty: 'intermediate' },
  { id: 4,  cat: 'nav',   title: 'Celestial Navigation',       duration: '90 min', locked: false, complete: false, author: 'Prof. Whitmore',  visibility: 'public', difficulty: 'advanced'     },
  { id: 5,  cat: 'emg',   title: 'Fire Safety Protocols',      duration: '50 min', locked: false, complete: true,  author: 'Instr. Chen',     visibility: 'class',  difficulty: 'easy'         },
  { id: 6,  cat: 'emg',   title: 'Man Overboard Response',     duration: '60 min', locked: false, complete: false, author: 'Instr. Chen',     visibility: 'class',  difficulty: 'intermediate' },
  { id: 7,  cat: 'emg',   title: 'Abandon Ship Procedure',     duration: '45 min', locked: false, complete: false, author: 'Prof. Whitmore',  visibility: 'public', difficulty: 'intermediate' },
  { id: 8,  cat: 'eng',   title: 'Main Engine Operations',     duration: '80 min', locked: false, complete: true,  author: 'Eng. Vasquez',    visibility: 'class',  difficulty: 'intermediate' },
  { id: 9,  cat: 'eng',   title: 'Fuel Management Systems',    duration: '65 min', locked: false, complete: true,  author: 'Eng. Vasquez',    visibility: 'class',  difficulty: 'intermediate' },
  { id: 10, cat: 'cargo', title: 'Load Calculation',           duration: '70 min', locked: true,  complete: false, author: 'Prof. Whitmore',  visibility: 'public', difficulty: 'advanced'     },
  { id: 11, cat: 'cargo', title: 'Stability & Trim',           duration: '85 min', locked: true,  complete: false, author: 'Prof. Whitmore',  visibility: 'public', difficulty: 'advanced'     },
  { id: 12, cat: 'comm',  title: 'GMDSS Radio Operations',     duration: '55 min', locked: false, complete: false, author: 'Instr. Chen',     visibility: 'public', difficulty: 'intermediate' },
]

export const AUTHORS    = [...new Set(INITIAL_LESSONS.map(l => l.author))]
export const DURATIONS  = [
  { id: 'under45', label: 'Under 45 min' },
  { id: '45to60',  label: '45 – 60 min'  },
  { id: '60to90',  label: '60 – 90 min'  },
  { id: 'over90',  label: '90+ min'      },
]
export const DIFFICULTIES = [
  { id: 'easy',         label: 'Easy'         },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced',     label: 'Advanced'     },
]

export const DEFAULT_FILTERS = {
  authors:    [],    // empty = all
  status:     'all', // 'all' | 'complete' | 'incomplete'
  durations:  [],    // empty = all
  difficulty: [],    // empty = all
  access:     'all', // 'all' | 'unlocked' | 'locked'
}

function durationBucket(str) {
  const m = parseInt(str, 10)
  if (m < 45)  return 'under45'
  if (m <= 60) return '45to60'
  if (m <= 90) return '60to90'
  return 'over90'
}

function getCatStats(lessons, catId) {
  const subset = catId === 'all' ? lessons : lessons.filter(l => l.cat === catId)
  return { total: subset.length, done: subset.filter(l => l.complete).length }
}

function countActiveFilters(f) {
  return (
    f.authors.length +
    (f.status !== 'all' ? 1 : 0) +
    f.durations.length +
    f.difficulty.length +
    (f.access !== 'all' ? 1 : 0)
  )
}

export default function Lessons() {
  const [lessons, setLessons]               = useState(INITIAL_LESSONS)
  const [activeCategory, setActiveCategory] = useState('all')
  const [viewMode, setViewMode]             = useState('grid')
  const [searchQuery, setSearchQuery]       = useState('')
  const [visibilityFilter, setVisFilter]    = useState('all')
  const [filters, setFilters]               = useState(DEFAULT_FILTERS)
  const [filterOpen, setFilterOpen]         = useState(false)

  const filterWrapRef = useRef(null)

  // Close panel on outside click
  useEffect(() => {
    if (!filterOpen) return
    const handler = (e) => {
      if (!filterWrapRef.current?.contains(e.target)) setFilterOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [filterOpen])

  const toggleComplete = (id) =>
    setLessons(prev => prev.map(l =>
      l.id === id && !l.locked ? { ...l, complete: !l.complete } : l
    ))

  const filtered = lessons
    .filter(l => activeCategory === 'all' || l.cat === activeCategory)
    .filter(l => visibilityFilter === 'all' || l.visibility === visibilityFilter)
    .filter(l => l.title.toLowerCase().includes(searchQuery.toLowerCase().trim()))
    .filter(l => filters.authors.length    === 0 || filters.authors.includes(l.author))
    .filter(l => filters.status === 'all'  || (filters.status === 'complete' ? l.complete : !l.complete))
    .filter(l => filters.durations.length  === 0 || filters.durations.includes(durationBucket(l.duration)))
    .filter(l => filters.difficulty.length === 0 || filters.difficulty.includes(l.difficulty))
    .filter(l => filters.access === 'all' || (filters.access === 'locked' ? l.locked : !l.locked))

  const overall       = getCatStats(lessons, 'all')
  const overallPct    = overall.total > 0 ? (overall.done / overall.total) * 100 : 0
  const activeFilters = countActiveFilters(filters)

  return (
    <div className="lessons-page">
      <div className="lessons-layout">
        <NavBar />

        <div className="lessons-body">

          {/* ─── Sidebar ──────────────────────────────────────────────── */}
          <aside className="sidebar">
            <nav className="sidebar-nav">
              {CATEGORIES.map((cat) => {
                const stats = getCatStats(lessons, cat.id)
                const pct   = stats.total > 0 ? (stats.done / stats.total) * 100 : 0
                return (
                  <button
                    key={cat.id}
                    className={`sidebar-btn ${activeCategory === cat.id ? 'sidebar-btn--active' : ''}`}
                    onClick={() => setActiveCategory(cat.id)}
                  >
                    <div className="sidebar-btn-row">
                      <span className="sidebar-label">{cat.label}</span>
                      <span className="sidebar-count">{stats.done}/{stats.total}</span>
                    </div>
                    <div className="sidebar-chapter-bar">
                      <div className="sidebar-chapter-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </button>
                )
              })}
            </nav>

            <div className="sidebar-stat">
              <div className="sidebar-stat-bar">
                <div className="sidebar-stat-fill" style={{ width: `${overallPct}%` }} />
              </div>
              <span className="sidebar-stat-text">
                <span className="sidebar-stat-num">{overall.done}</span>
                {' '}of{' '}
                <span className="sidebar-stat-num">{overall.total}</span>
                {' '}complete
              </span>
            </div>
          </aside>

          {/* ─── Main ─────────────────────────────────────────────────── */}
          <main className="lessons-main">

            {/* Head: title + count + view toggle */}
            <div className="lessons-head">
              <h2 className="lessons-title">
                {CATEGORIES.find(c => c.id === activeCategory)?.label}
              </h2>
              <span className="lessons-count">{filtered.length} lessons</span>

              <div className="view-toggle">
                <button
                  className={`view-btn ${viewMode === 'grid' ? 'view-btn--active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Grid view"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" rx="1"/>
                    <rect x="14" y="3" width="7" height="7" rx="1"/>
                    <rect x="3" y="14" width="7" height="7" rx="1"/>
                    <rect x="14" y="14" width="7" height="7" rx="1"/>
                  </svg>
                </button>
                <button
                  className={`view-btn ${viewMode === 'list' ? 'view-btn--active' : ''}`}
                  onClick={() => setViewMode('list')}
                  title="List view"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="6"  x2="21" y2="6"/>
                    <line x1="3" y1="12" x2="21" y2="12"/>
                    <line x1="3" y1="18" x2="21" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Toolbar: search + visibility filter + filter button */}
            <div className="lessons-toolbar">
              <div className="search-wrap">
                <svg className="search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  className="search-input"
                  type="text"
                  placeholder="Search chapters…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button className="search-clear" onClick={() => setSearchQuery('')} title="Clear">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6"  x2="6"  y2="18"/>
                      <line x1="6"  y1="6"  x2="18" y2="18"/>
                    </svg>
                  </button>
                )}
              </div>

              <div className="vis-filter">
                {[
                  { id: 'all',    label: 'All'      },
                  { id: 'class',  label: 'My Class' },
                  { id: 'public', label: 'Public'   },
                ].map(v => (
                  <button
                    key={v.id}
                    className={`vis-btn ${visibilityFilter === v.id ? 'vis-btn--active' : ''}`}
                    onClick={() => setVisFilter(v.id)}
                  >
                    {v.label}
                  </button>
                ))}
              </div>

              {/* Filter button + popup */}
              <div className="filter-wrap" ref={filterWrapRef}>
                <button
                  className={`filter-btn ${filterOpen ? 'filter-btn--open' : ''} ${activeFilters > 0 ? 'filter-btn--active' : ''}`}
                  onClick={() => setFilterOpen(v => !v)}
                  title="Filters"
                >
                  {/* SlidersHorizontal icon */}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="21" y1="4"  x2="14" y2="4"/>
                    <line x1="10" y1="4"  x2="3"  y2="4"/>
                    <circle cx="12" cy="4"  r="2"/>
                    <line x1="21" y1="12" x2="12" y2="12"/>
                    <line x1="8"  y1="12" x2="3"  y2="12"/>
                    <circle cx="10" cy="12" r="2"/>
                    <line x1="21" y1="20" x2="16" y2="20"/>
                    <line x1="12" y1="20" x2="3"  y2="20"/>
                    <circle cx="14" cy="20" r="2"/>
                  </svg>
                  <span>Filters</span>
                  {activeFilters > 0 && (
                    <span className="filter-count">{activeFilters}</span>
                  )}
                </button>

                {filterOpen && (
                  <FilterPanel
                    filters={filters}
                    onChange={setFilters}
                    onClear={() => setFilters(DEFAULT_FILTERS)}
                  />
                )}
              </div>
            </div>

            {/* Lesson cards */}
            <div className={`lessons-list lessons-list--${viewMode}`}>
              {filtered.length === 0 ? (
                <p className="lessons-empty">No lessons match your filters.</p>
              ) : (
                filtered.map((lesson, i) => (
                  <LessonCard
                    key={lesson.id}
                    lesson={lesson}
                    index={i}
                    viewMode={viewMode}
                    onToggleComplete={toggleComplete}
                  />
                ))
              )}
            </div>

          </main>
        </div>
      </div>
    </div>
  )
}
