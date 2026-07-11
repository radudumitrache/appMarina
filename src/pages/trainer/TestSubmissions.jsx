import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import NavBar from '../../components/trainer/NavBar'
import { getAllSubmissions } from '../../api/tests'
import '../css/trainer/TestSubmissions.css'

function fmt(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function GradeBadge({ grade }) {
  if (grade == null) return <span className="ts-grade-badge ts-grade--pending">Pending</span>
  const pct = Math.round(grade)
  if (grade >= 70)   return <span className="ts-grade-badge ts-grade--high">{pct}%</span>
  if (grade >= 50)   return <span className="ts-grade-badge ts-grade--mid">{pct}%</span>
  return                    <span className="ts-grade-badge ts-grade--low">{pct}%</span>
}

function groupByCrew(submissions) {
  const map = new Map()
  for (const s of submissions) {
    const key = s.crew_email ?? s.crew_name ?? String(s.id)
    if (!map.has(key)) {
      map.set(key, { name: s.crew_name, email: s.crew_email, submissions: [] })
    }
    map.get(key).submissions.push(s)
  }
  // Sort each student's submissions newest first
  for (const g of map.values()) {
    g.submissions.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at))
  }
  // Sort students alphabetically
  return [...map.values()].sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
}

function CrewGroup({ group, testId, testTitle, index }) {
  const navigate   = useNavigate()
  const [open, setOpen] = useState(false)

  const latest       = group.submissions[0]
  const attemptCount = group.submissions.length
  const pendingInGroup = group.submissions.filter(s => s.grade == null).length
  const initials     = (group.name ?? '?').charAt(0).toUpperCase()

  return (
    <div className={`ts-group${open ? ' ts-group--open' : ''}`} style={{ animationDelay: `${Math.min(index, 6) * 0.04}s` }}>
      <div className="ts-group-header" onClick={() => setOpen(o => !o)}>
        <div className="ts-avatar">{initials}</div>

        <div className="ts-crew-info">
          <span className="ts-crew-name">{group.name}</span>
          <span className="ts-crew-email">{group.email}</span>
        </div>

        <div className="ts-group-meta">
          <span className="ts-attempt-count">
            {attemptCount} attempt{attemptCount !== 1 ? 's' : ''}
            {pendingInGroup > 0 && <span className="ts-pending-dot" title="Has pending submissions" />}
          </span>
          <GradeBadge grade={latest.grade} />
        </div>

        <svg
          className={`ts-group-chevron${open ? ' ts-group-chevron--open' : ''}`}
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>

      {open && (
        <div className="ts-submissions">
          {group.submissions.map((s, i) => (
            <div
              key={s.id}
              className="ts-sub-row"
              onClick={() => navigate(`/trainer/submissions/${s.id}`, {
                state: { backPath: `/trainer/tests/${testId}/submissions`, testTitle },
              })}
            >
              <span className="ts-sub-num ts-muted">#{attemptCount - i}</span>
              <span className="ts-sub-date ts-mono ts-muted">{fmt(s.submitted_at)}</span>
              <GradeBadge grade={s.grade} />
              <svg className="ts-sub-arrow" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function TestSubmissions() {
  const { testId }  = useParams()
  const navigate    = useNavigate()
  const { state }   = useLocation()

  const backPath  = state?.backPath  ?? -1
  const testTitle = state?.testTitle ?? 'Test'

  const [submissions, setSubmissions] = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)

  useEffect(() => {
    getAllSubmissions(testId)
      .then(res => setSubmissions(res.data ?? []))
      .catch(() => setError('Could not load submissions.'))
      .finally(() => setLoading(false))
  }, [testId])

  const groups       = groupByCrew(submissions)
  const crewCount = groups.length
  const pendingCount = submissions.filter(s => s.grade == null).length

  return (
    <div className="ts-page">
      <NavBar />

      <div className="ts-shell">
        <div className="ts-topbar">
          <button className="ts-back" onClick={() => navigate(backPath)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Back
          </button>
        </div>

        <div className="ts-header">
          <h1 className="ts-title">{testTitle}</h1>
          <span className="ts-meta">
            {crewCount} crew member{crewCount !== 1 ? 's' : ''}
            {' · '}
            {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
            {pendingCount > 0 && ` · ${pendingCount} pending review`}
          </span>
        </div>

        {loading ? (
          <div className="ts-loading"><div className="ts-spinner" /></div>
        ) : error ? (
          <p className="ts-error">{error}</p>
        ) : submissions.length === 0 ? (
          <p className="ts-empty">No submissions yet.</p>
        ) : (
          <div className="ts-list">
            {groups.map((group, i) => (
              <CrewGroup
                key={group.email ?? group.name}
                group={group}
                testId={testId}
                testTitle={testTitle}
                index={i}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
