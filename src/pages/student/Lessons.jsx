import { useState, useRef, useEffect } from 'react'
import NavBar from '../../components/student/NavBar'
import LessonCard from '../../components/student/lessons/LessonCard'
import LessonsSidebar from '../../components/student/lessons/LessonsSidebar'
import LessonsHead from '../../components/student/lessons/LessonsHead'
import LessonsToolbar from '../../components/student/lessons/LessonsToolbar'
import { getLessons, completeLesson, uncompleteLesson } from '../../api/lessons'
import '../css/student/Lessons.css'

export const CATEGORIES = [
  { id: 'all',   label: 'All Modules'         },
  { id: 'nav',   label: 'Bridge Navigation'   },
  { id: 'emg',   label: 'Emergency Protocols' },
  { id: 'eng',   label: 'Engine Room'         },
  { id: 'cargo', label: 'Cargo Management'    },
  { id: 'comm',  label: 'Communications'      },
]

export const DURATIONS = [
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
  authors:    [],
  status:     'all',   // 'all' | 'complete' | 'incomplete'
  durations:  [],
  difficulty: [],
  access:     'all',   // 'all' | 'unlocked' | 'locked'
}

/** Map an API lesson object to the shape LessonCard expects. */
function mapLesson(l) {
  return {
    id:         l.id,
    cat:        l.category   ?? 'nav',
    title:      l.title,
    duration:   l.duration_minutes ? `${l.duration_minutes} min` : '—',
    locked:     l.is_locked   ?? false,
    complete:   l.is_complete ?? false,
    author:     l.author_name ?? l.author ?? '',
    visibility: l.visibility  ?? 'public',
    difficulty: l.difficulty  ?? 'intermediate',
  }
}

function durationBucket(str) {
  const m = parseInt(str, 10)
  if (m < 45)  return 'under45'
  if (m <= 60) return '45to60'
  if (m <= 90) return '60to90'
  return 'over90'
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
  const [lessons, setLessons]               = useState([])
  const [loading, setLoading]               = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')
  const [viewMode, setViewMode]             = useState('grid')
  const [searchQuery, setSearchQuery]       = useState('')
  const [visibilityFilter, setVisFilter]    = useState('all')
  const [filters, setFilters]               = useState(DEFAULT_FILTERS)
  const [filterOpen, setFilterOpen]         = useState(false)

  const filterWrapRef = useRef(null)

  /* ── Fetch lessons from the API ─────────────────────────────────────────── */
  useEffect(() => {
    setLoading(true)
    getLessons()
      .then(res => setLessons((res.data ?? []).map(mapLesson)))
      .catch(() => {}) // keep empty; individual card clicks will surface errors
      .finally(() => setLoading(false))
  }, [])

  /* ── Close filter panel on outside click ────────────────────────────────── */
  useEffect(() => {
    if (!filterOpen) return
    const handler = (e) => {
      if (!filterWrapRef.current?.contains(e.target)) setFilterOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [filterOpen])

  /* ── Toggle completion (optimistic, synced to API) ──────────────────────── */
  const toggleComplete = (id) => {
    const lesson = lessons.find(l => l.id === id)
    if (!lesson || lesson.locked) return
    const wasComplete = lesson.complete
    setLessons(prev => prev.map(l => l.id === id ? { ...l, complete: !l.complete } : l))
    const apiCall = wasComplete ? uncompleteLesson : completeLesson
    apiCall(id).catch(() => {
      // Revert if the API call fails
      setLessons(prev => prev.map(l => l.id === id ? { ...l, complete: wasComplete } : l))
    })
  }

  /* ── Derived ────────────────────────────────────────────────────────────── */
  const authors       = [...new Set(lessons.map(l => l.author).filter(Boolean))]
  const activeFilters = countActiveFilters(filters)

  const filtered = lessons
    .filter(l => activeCategory === 'all' || l.cat === activeCategory)
    .filter(l => visibilityFilter === 'all' || l.visibility === visibilityFilter)
    .filter(l => l.title.toLowerCase().includes(searchQuery.toLowerCase().trim()))
    .filter(l => filters.authors.length    === 0 || filters.authors.includes(l.author))
    .filter(l => filters.status === 'all'  || (filters.status === 'complete' ? l.complete : !l.complete))
    .filter(l => filters.durations.length  === 0 || filters.durations.includes(durationBucket(l.duration)))
    .filter(l => filters.difficulty.length === 0 || filters.difficulty.includes(l.difficulty))
    .filter(l => filters.access === 'all'  || (filters.access === 'locked' ? l.locked : !l.locked))

  return (
    <div className="lessons-page">
      <div className="lessons-layout">
        <NavBar />

        <div className="lessons-body">
          <LessonsSidebar
            lessons={lessons}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />

          <main className="lessons-main">
            <LessonsHead
              title={CATEGORIES.find(c => c.id === activeCategory)?.label}
              count={filtered.length}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />

            <LessonsToolbar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              visibilityFilter={visibilityFilter}
              onVisFilter={setVisFilter}
              filterOpen={filterOpen}
              onFilterToggle={() => setFilterOpen(v => !v)}
              filters={filters}
              authors={authors}
              onFiltersChange={setFilters}
              onFiltersClear={() => setFilters(DEFAULT_FILTERS)}
              filterWrapRef={filterWrapRef}
              activeFilters={activeFilters}
            />

            <div className={`lessons-list lessons-list--${viewMode}`}>
              {loading ? (
                <div className="lessons-loading">
                  <div className="lessons-spinner" />
                </div>
              ) : filtered.length === 0 ? (
                <p className="lessons-empty">
                  {lessons.length === 0 ? 'No lessons available.' : 'No lessons match your filters.'}
                </p>
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
