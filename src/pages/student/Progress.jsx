import { useNavigate } from 'react-router-dom'
import NavBar from '../../components/shared/NavBar'
import '../css/student/Progress.css'

// ── Data ──────────────────────────────────────────────────────────────────────

const STAT_CARDS = [
  { label: 'Lessons Complete', value: '5',    suffix: '/12',  sub: '42% of curriculum'      },
  { label: 'Avg Test Grade',   value: '72',   suffix: '%',    sub: '5 tests taken'           },
  { label: 'Hours Trained',    value: '5.9',  suffix: 'h',    sub: 'across all modules'      },
  { label: 'Active Streak',    value: '3',    suffix: 'd',    sub: 'days in a row'           },
]

const MODULES = [
  { id: 'nav',   label: 'Bridge Navigation',   total: 4, done: 2, hours: 2.5  },
  { id: 'emg',   label: 'Emergency Protocols', total: 3, done: 1, hours: 0.8  },
  { id: 'eng',   label: 'Engine Room',         total: 2, done: 2, hours: 2.4  },
  { id: 'cargo', label: 'Cargo Management',    total: 2, done: 0, hours: 0    },
  { id: 'comm',  label: 'Communications',      total: 1, done: 0, hours: 0.2  },
]

const TEST_RESULTS = [
  { id: 1, title: 'Helm Control Basics Test',    author: 'Capt. Rodriguez', date: '2026-03-20', grade: 92 },
  { id: 2, title: 'Chart Reading Fundamentals',  author: 'Prof. Whitmore',  date: '2026-03-15', grade: 85 },
  { id: 3, title: 'Fire Safety Assessment',      author: 'Instr. Chen',     date: '2026-03-10', grade: 78 },
  { id: 4, title: 'Load Calculation Quiz',       author: 'Prof. Whitmore',  date: '2026-02-28', grade: 61 },
  { id: 5, title: 'Man Overboard Drill Test',    author: 'Instr. Chen',     date: '2026-02-20', grade: 45 },
]

const ACTIVITY = [
  { id: 1, type: 'lesson',  text: 'Completed Fuel Management Systems',  sub: 'Engine Room · 65 min',     date: 'Mar 28' },
  { id: 2, type: 'test',    text: 'Scored 92% on Helm Control Basics',  sub: 'By Capt. Rodriguez',        date: 'Mar 20' },
  { id: 3, type: 'lesson',  text: 'Completed Main Engine Operations',   sub: 'Engine Room · 80 min',     date: 'Mar 18' },
  { id: 4, type: 'test',    text: 'Scored 85% on Chart Reading',        sub: 'By Prof. Whitmore',         date: 'Mar 15' },
  { id: 5, type: 'lesson',  text: 'Completed Fire Safety Protocols',    sub: 'Emergency Protocols · 50 min', date: 'Mar 12' },
  { id: 6, type: 'test',    text: 'Scored 78% on Fire Safety Assessment', sub: 'By Instr. Chen',          date: 'Mar 10' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function gradeClass(g) {
  if (g >= 90) return 'grade--pass'
  if (g >= 70) return 'grade--good'
  if (g >= 50) return 'grade--warn'
  return 'grade--fail'
}

function gradeLabel(g) {
  if (g >= 90) return 'Excellent'
  if (g >= 70) return 'Good'
  if (g >= 50) return 'Pass'
  return 'Fail'
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Progress() {
  const navigate = useNavigate()

  const totalDone  = MODULES.reduce((s, m) => s + m.done, 0)
  const totalAll   = MODULES.reduce((s, m) => s + m.total, 0)
  const overallPct = totalAll > 0 ? Math.round((totalDone / totalAll) * 100) : 0

  return (
    <div className="progress-page">
      <NavBar />

      {/* Page header */}
      <header className="progress-header">
        <div className="progress-breadcrumb">
          <button className="breadcrumb-link" onClick={() => navigate('/student/dashboard')}>
            Dashboard
          </button>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
          <span className="breadcrumb-current">My Progress</span>
        </div>
        <h1 className="progress-page-title">My Progress</h1>
      </header>

      {/* Scrollable content */}
      <div className="progress-content">

        {/* Stat cards */}
        <div className="progress-stats">
          {STAT_CARDS.map((card, i) => (
            <div
              className="stat-card"
              key={card.label}
              style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
            >
              <span className="stat-label">{card.label}</span>
              <div className="stat-value-row">
                <span className="stat-value">{card.value}</span>
                <span className="stat-suffix">{card.suffix}</span>
              </div>
              <span className="stat-sub">{card.sub}</span>
            </div>
          ))}
        </div>

        {/* Two-column layout */}
        <div className="progress-grid">

          {/* LEFT: Module progress */}
          <section className="progress-section">
            <div className="section-head">
              <span className="section-title">Module Progress</span>
              <span className="section-meta">
                <span className="section-meta-num">{overallPct}%</span> overall
              </span>
            </div>

            <div className="module-list">
              {MODULES.map((mod, i) => {
                const pct    = mod.total > 0 ? (mod.done / mod.total) * 100 : 0
                const status = mod.done === mod.total && mod.total > 0 ? 'complete' : mod.done > 0 ? 'progress' : 'none'
                return (
                  <div
                    className="module-row"
                    key={mod.id}
                    style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
                  >
                    <div className="module-row-top">
                      <span className="module-label">{mod.label}</span>
                      <div className="module-row-right">
                        {mod.hours > 0 && (
                          <span className="module-hours">{mod.hours}h</span>
                        )}
                        <span className="module-fraction">{mod.done}/{mod.total}</span>
                      </div>
                    </div>
                    <div className="module-bar-track">
                      <div
                        className={`module-bar-fill module-bar-fill--${status}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* RIGHT: Test results */}
          <section className="progress-section">
            <div className="section-head">
              <span className="section-title">Test Results</span>
              <button className="section-link" onClick={() => navigate('/student/tests')}>
                View all
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5"  y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </button>
            </div>

            <div className="test-results-list">
              {TEST_RESULTS.map((t, i) => (
                <div
                  className="test-result-row"
                  key={t.id}
                  style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
                >
                  <div className={`test-result-grade ${gradeClass(t.grade)}`}>
                    <span className="test-result-grade-num">{t.grade}</span>
                    <span className="test-result-grade-pct">%</span>
                  </div>
                  <div className="test-result-body">
                    <span className="test-result-title">{t.title}</span>
                    <span className="test-result-meta">By {t.author} · {formatDate(t.date)}</span>
                  </div>
                  <span className={`test-result-badge ${gradeClass(t.grade)}`}>
                    {gradeLabel(t.grade)}
                  </span>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* Activity feed */}
        <section className="progress-section progress-section--wide">
          <div className="section-head">
            <span className="section-title">Recent Activity</span>
          </div>

          <div className="activity-list">
            {ACTIVITY.map((item, i) => (
              <div
                className="activity-row"
                key={item.id}
                style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
              >
                <div className={`activity-icon activity-icon--${item.type}`}>
                  {item.type === 'lesson' ? (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                    </svg>
                  ) : (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 11 12 14 22 4"/>
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                    </svg>
                  )}
                </div>
                <div className="activity-body">
                  <span className="activity-text">{item.text}</span>
                  <span className="activity-sub">{item.sub}</span>
                </div>
                <span className="activity-date">{item.date}</span>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
