import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar        from '../../components/student/NavBar'
import ModuleProgress from '../../components/student/progress/ModuleProgress'
import TestResults    from '../../components/student/progress/TestResults'
import ActivityFeed   from '../../components/student/progress/ActivityFeed'
import { getProgress, getTestResults, getActivity } from '../../api/progress'
import '../css/student/Progress.css'

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function Progress() {
  const navigate = useNavigate()

  const [summary,     setSummary]     = useState(null)
  const [testResults, setTestResults] = useState([])
  const [activity,    setActivity]    = useState([])
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    Promise.all([getProgress(), getTestResults(), getActivity()])
      .then(([progRes, testsRes, actRes]) => {
        setSummary(progRes.data)
        setTestResults(testsRes.data.map(s => ({
          id:     s.id,
          testId: s.test,
          title:  s.test_title,
          author: s.test_author_name,
          date:   s.submitted_at,
          grade:  Math.round(s.grade),
        })))
        setActivity(actRes.data.map(log => ({
          id:    log.id,
          type:  log.type,
          text:  log.description,
          sub:   log.sub_info,
          refId: log.ref_id,
          date:  fmtDate(log.created_at),
        })))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading || !summary) {
    return (
      <div className="progress-page">
        <NavBar />
        <header className="progress-header">
          <div className="progress-breadcrumb">
            <button className="breadcrumb-link" onClick={() => navigate('/student/dashboard')}>Dashboard</button>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
            <span className="breadcrumb-current">My Progress</span>
          </div>
          <h1 className="progress-page-title">My Progress</h1>
        </header>
        <div className="progress-content">
          <div className="progress-stats">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="stat-card" style={{ opacity: 1 - i * 0.15 }}>
                <span className="stat-label" style={{ background: 'var(--surface-3)', borderRadius: 4, color: 'transparent' }}>Loading</span>
                <div className="stat-value-row">
                  <span className="stat-value" style={{ background: 'var(--surface-3)', borderRadius: 4, color: 'transparent' }}>--</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const totalDone  = summary.modules.reduce((s, m) => s + m.done,  0)
  const totalAll   = summary.modules.reduce((s, m) => s + m.total, 0)
  const overallPct = totalAll > 0 ? Math.round((totalDone / totalAll) * 100) : 0

  const statCards = [
    {
      label:  'Lessons Complete',
      value:  String(summary.lessons_complete),
      suffix: `/${summary.lessons_total}`,
      sub:    `${totalAll > 0 ? Math.round((summary.lessons_complete / summary.lessons_total) * 100) : 0}% of curriculum`,
    },
    {
      label:  'Avg Test Grade',
      value:  String(summary.avg_grade),
      suffix: '%',
      sub:    `${summary.tests_taken} test${summary.tests_taken !== 1 ? 's' : ''} taken`,
    },
    {
      label:  'Hours Trained',
      value:  String(summary.hours_trained),
      suffix: 'h',
      sub:    'across all modules',
    },
    {
      label:  'Active Streak',
      value:  String(summary.active_streak_days),
      suffix: 'd',
      sub:    'days in a row',
    },
  ]

  return (
    <div className="progress-page">
      <NavBar />

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

      <div className="progress-content">

        <div className="progress-screen">
          <div className="progress-stats">
            {statCards.map((card, i) => (
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

          <div className="progress-grid">
            <ModuleProgress modules={summary.modules} overallPct={overallPct} />
            <TestResults results={testResults} onViewAll={() => navigate('/student/tests')} onSelect={t => navigate(`/student/tests/${t.testId}/review`)} />
          </div>
        </div>

        <div className="progress-screen progress-screen--activity">
          <ActivityFeed
            items={activity}
            onSelect={item => {
              if (item.type === 'lesson') navigate('/student/lessons')
              else if (item.type === 'test' && item.refId) navigate(`/student/tests/${item.refId}/review`)
            }}
          />
        </div>

      </div>
    </div>
  )
}
