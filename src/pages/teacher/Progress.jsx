import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '../../components/teacher/NavBar'
import '../css/teacher/Progress.css'

// ─── Mock data ────────────────────────────────────────────────────────────
const CLASSES = [
  { id: 'all', label: 'All Classes' },
  { id: 1,     label: 'MN-2024-A — Navigation Alpha'  },
  { id: 2,     label: 'EP-2024-B — Emergency Beta'    },
  { id: 3,     label: 'ER-2024-C — Engine Charlie'    },
  { id: 4,     label: 'CL-2024-D — Cargo Delta'       },
  { id: 5,     label: 'CM-2024-E — Comms Echo'        },
]

const STUDENTS = [
  { id:  1, initials: 'JH', name: 'James Harrington',  classId: 1, className: 'Navigation Alpha',  lessonsDone: 10, lessonsTotal: 12, avgScore: 88, lastActive: '2h ago',  status: 'on-track'  },
  { id:  2, initials: 'SP', name: 'Sofia Petrova',     classId: 1, className: 'Navigation Alpha',  lessonsDone:  7, lessonsTotal: 12, avgScore: 72, lastActive: '1d ago',  status: 'on-track'  },
  { id:  3, initials: 'ML', name: 'Marcus Lee',        classId: 1, className: 'Navigation Alpha',  lessonsDone: 12, lessonsTotal: 12, avgScore: 95, lastActive: '30m ago', status: 'complete'  },
  { id:  4, initials: 'AT', name: 'Amara Toure',       classId: 1, className: 'Navigation Alpha',  lessonsDone:  3, lessonsTotal: 12, avgScore: 54, lastActive: '5d ago',  status: 'at-risk'   },
  { id:  5, initials: 'RC', name: 'Rafael Cruz',       classId: 2, className: 'Emergency Beta',    lessonsDone:  6, lessonsTotal:  8, avgScore: 81, lastActive: '3h ago',  status: 'on-track'  },
  { id:  6, initials: 'EV', name: 'Elena Voronova',    classId: 2, className: 'Emergency Beta',    lessonsDone:  1, lessonsTotal:  8, avgScore: 40, lastActive: '2w ago',  status: 'at-risk'   },
  { id:  7, initials: 'TN', name: 'Thomas Nakamura',   classId: 2, className: 'Emergency Beta',    lessonsDone:  8, lessonsTotal:  8, avgScore: 91, lastActive: '1h ago',  status: 'complete'  },
  { id:  8, initials: 'IB', name: 'Ingrid Bjornsen',   classId: 3, className: 'Engine Charlie',    lessonsDone:  7, lessonsTotal: 10, avgScore: 76, lastActive: '2d ago',  status: 'on-track'  },
  { id:  9, initials: 'KO', name: 'Kwame Osei',        classId: 3, className: 'Engine Charlie',    lessonsDone:  9, lessonsTotal: 10, avgScore: 83, lastActive: '4h ago',  status: 'on-track'  },
  { id: 10, initials: 'PD', name: 'Priya Desai',       classId: 3, className: 'Engine Charlie',    lessonsDone:  2, lessonsTotal: 10, avgScore: 48, lastActive: '3w ago',  status: 'at-risk'   },
  { id: 11, initials: 'LM', name: 'Luca Moretti',      classId: 4, className: 'Cargo Delta',       lessonsDone:  5, lessonsTotal:  6, avgScore: 79, lastActive: '6h ago',  status: 'on-track'  },
  { id: 12, initials: 'YS', name: 'Yuki Sato',         classId: 4, className: 'Cargo Delta',       lessonsDone:  2, lessonsTotal:  6, avgScore: 63, lastActive: '4d ago',  status: 'on-track'  },
  { id: 13, initials: 'OB', name: 'Oluwaseun Balogun', classId: 4, className: 'Cargo Delta',       lessonsDone:  0, lessonsTotal:  6, avgScore: null, lastActive: 'Never', status: 'at-risk'   },
  { id: 14, initials: 'HK', name: 'Hiroshi Kimura',    classId: 5, className: 'Comms Echo',        lessonsDone:  5, lessonsTotal:  5, avgScore: 97, lastActive: '1d ago',  status: 'complete'  },
  { id: 15, initials: 'NW', name: 'Nadia Wozniak',     classId: 5, className: 'Comms Echo',        lessonsDone:  4, lessonsTotal:  5, avgScore: 85, lastActive: '2d ago',  status: 'on-track'  },
]

const STATUS_ORDER = { 'at-risk': 0, 'on-track': 1, 'complete': 2 }

const STATUS_META = {
  'at-risk':  { label: 'At Risk',   className: 'badge--risk'     },
  'on-track': { label: 'On Track',  className: 'badge--on-track' },
  'complete': { label: 'Complete',  className: 'badge--complete' },
}

const SORT_OPTIONS = [
  { id: 'name',       label: 'Name'        },
  { id: 'progress',   label: 'Progress'    },
  { id: 'score',      label: 'Avg. Score'  },
  { id: 'lastActive', label: 'Last Active' },
  { id: 'status',     label: 'Status'      },
]

function scoreColor(s) {
  if (s === null) return 'score--none'
  if (s >= 90)   return 'score--pass'
  if (s >= 70)   return 'score--good'
  if (s >= 50)   return 'score--warn'
  return 'score--fail'
}

export default function Progress() {
  const navigate = useNavigate()

  const [classFilter, setClassFilter] = useState('all')
  const [search, setSearch]           = useState('')
  const [sortBy, setSortBy]           = useState('status')
  const [statusFilter, setStatusFilter] = useState('all')

  const visible = STUDENTS
    .filter(s => classFilter === 'all' || s.classId === classFilter)
    .filter(s => statusFilter === 'all' || s.status === statusFilter)
    .filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase().trim()) ||
      s.className.toLowerCase().includes(search.toLowerCase().trim())
    )
    .sort((a, b) => {
      if (sortBy === 'name')     return a.name.localeCompare(b.name)
      if (sortBy === 'progress') return (b.lessonsDone / b.lessonsTotal) - (a.lessonsDone / a.lessonsTotal)
      if (sortBy === 'score')    return (b.avgScore ?? -1) - (a.avgScore ?? -1)
      if (sortBy === 'status')   return STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
      return 0
    })

  const atRiskCount     = STUDENTS.filter(s => s.status === 'at-risk').length
  const completeCount   = STUDENTS.filter(s => s.status === 'complete').length
  const avgPct = Math.round(
    STUDENTS.reduce((sum, s) => sum + (s.lessonsDone / s.lessonsTotal) * 100, 0) / STUDENTS.length
  )
  const avgScore = Math.round(
    STUDENTS.filter(s => s.avgScore !== null).reduce((sum, s) => sum + s.avgScore, 0) /
    STUDENTS.filter(s => s.avgScore !== null).length
  )

  return (
    <div className="tp-page">
      <NavBar />

      {/* ─── Header ───────────────────────────────────────────────────────── */}
      <header className="tp-header">
        <div className="tp-header-left">
          <div className="tp-breadcrumb">
            <button className="tp-crumb-link" onClick={() => navigate('/teacher/dashboard')}>
              Dashboard
            </button>
            <span className="tp-crumb-sep">/</span>
          </div>
          <h1 className="tp-title">Student Progress</h1>
        </div>
      </header>

      <div className="tp-content">

        {/* ─── Stat cards ───────────────────────────────────────────────── */}
        <div className="tp-stats">
          <div className="tp-stat-card">
            <span className="tp-stat-label">Total Students</span>
            <span className="tp-stat-value">{STUDENTS.length}</span>
            <span className="tp-stat-sub">across {CLASSES.length - 1} classes</span>
          </div>
          <div className="tp-stat-card">
            <span className="tp-stat-label">Avg. Progress</span>
            <span className="tp-stat-value">{avgPct}%</span>
            <span className="tp-stat-sub">lesson completion</span>
          </div>
          <div className="tp-stat-card">
            <span className="tp-stat-label">Avg. Test Score</span>
            <span className="tp-stat-value">{avgScore}%</span>
            <span className="tp-stat-sub">across all tests</span>
          </div>
          <div className="tp-stat-card tp-stat-card--risk">
            <span className="tp-stat-label">At Risk</span>
            <span className="tp-stat-value tp-stat-value--risk">{atRiskCount}</span>
            <span className="tp-stat-sub">students need attention</span>
          </div>
        </div>

        {/* ─── Class filter tabs ─────────────────────────────────────────── */}
        <div className="tp-class-tabs">
          {CLASSES.map(c => (
            <button
              key={c.id}
              className={`tp-class-tab ${classFilter === c.id ? 'tp-class-tab--active' : ''}`}
              onClick={() => setClassFilter(c.id)}
            >
              {c.label}
              {c.id !== 'all' && (
                <span className="tp-class-count">
                  {STUDENTS.filter(s => s.classId === c.id).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ─── Toolbar: status filter + search + sort ────────────────────── */}
        <div className="tp-toolbar">
          <div className="tp-status-filter">
            {[
              { id: 'all',      label: 'All'       },
              { id: 'at-risk',  label: 'At Risk'   },
              { id: 'on-track', label: 'On Track'  },
              { id: 'complete', label: 'Complete'  },
            ].map(f => (
              <button
                key={f.id}
                className={`tp-filter-btn ${statusFilter === f.id ? 'tp-filter-btn--active' : ''} ${f.id !== 'all' ? `tp-filter-btn--${f.id}` : ''}`}
                onClick={() => setStatusFilter(f.id)}
              >
                {f.label}
                {f.id !== 'all' && (
                  <span className="tp-filter-count">
                    {STUDENTS.filter(s => s.status === f.id && (classFilter === 'all' || s.classId === classFilter)).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="tp-toolbar-right">
            <div className="tp-search-wrap">
              <svg className="tp-search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                className="tp-search"
                type="text"
                placeholder="Search students…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button className="tp-search-clear" onClick={() => setSearch('')}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6"  x2="6"  y2="18"/>
                    <line x1="6"  y1="6"  x2="18" y2="18"/>
                  </svg>
                </button>
              )}
            </div>

            <div className="tp-sort-wrap">
              <span className="tp-sort-label">Sort by</span>
              <select
                className="tp-sort-select"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.id} value={o.id}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ─── Student table ─────────────────────────────────────────────── */}
        <div className="tp-table-wrap">
          <div className="tp-table-head">
            <span className="tp-col tp-col--student">Student</span>
            <span className="tp-col tp-col--class">Class</span>
            <span className="tp-col tp-col--progress">Progress</span>
            <span className="tp-col tp-col--lessons">Lessons</span>
            <span className="tp-col tp-col--score">Avg. Score</span>
            <span className="tp-col tp-col--last">Last Active</span>
            <span className="tp-col tp-col--status">Status</span>
          </div>

          {visible.length === 0 ? (
            <p className="tp-empty">No students match your filters.</p>
          ) : (
            visible.map((s, i) => {
              const pct    = Math.round((s.lessonsDone / s.lessonsTotal) * 100)
              const status = STATUS_META[s.status]
              return (
                <div
                  key={s.id}
                  className={`tp-row ${s.status === 'at-risk' ? 'tp-row--risk' : ''}`}
                  style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
                >
                  <div className="tp-col tp-col--student tp-student-cell">
                    <div className={`tp-avatar tp-avatar--${s.status}`}>{s.initials}</div>
                    <span className="tp-student-name">{s.name}</span>
                  </div>

                  <div className="tp-col tp-col--class">
                    <span className="tp-class-name">{s.className}</span>
                  </div>

                  <div className="tp-col tp-col--progress tp-progress-cell">
                    <div className="tp-bar-track">
                      <div
                        className={`tp-bar-fill ${pct === 100 ? 'tp-bar-fill--complete' : ''}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="tp-pct">{pct}%</span>
                  </div>

                  <div className="tp-col tp-col--lessons">
                    <span className="tp-mono">{s.lessonsDone}/{s.lessonsTotal}</span>
                  </div>

                  <div className="tp-col tp-col--score">
                    {s.avgScore !== null
                      ? <span className={`tp-score ${scoreColor(s.avgScore)}`}>{s.avgScore}%</span>
                      : <span className="tp-mono tp-muted">—</span>
                    }
                  </div>

                  <div className="tp-col tp-col--last">
                    <span className="tp-mono tp-muted">{s.lastActive}</span>
                  </div>

                  <div className="tp-col tp-col--status">
                    <span className={`tp-badge ${status.className}`}>{status.label}</span>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div className="tp-table-footer">
          <span className="tp-footer-count">
            Showing <span className="tp-footer-num">{visible.length}</span> of <span className="tp-footer-num">{STUDENTS.length}</span> students
          </span>
        </div>

      </div>
    </div>
  )
}
