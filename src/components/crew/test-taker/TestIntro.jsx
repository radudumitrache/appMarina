import '../../css/crew/test-taker/TestIntro.css'

function formatDate(dateStr) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function TestIntro({ test, panels, onStart, onBack }) {
  const exercisePanelCount = panels.filter(p => p.type === 'exercise').length

  const attemptsUsed    = test.attempts_used ?? 0
  const attemptsAllowed = test.number_of_attempts_allowed ?? null
  const attemptNumber   = attemptsUsed + 1
  const attemptsChip    = attemptsAllowed === null
    ? `Attempt ${attemptNumber}`
    : `Attempt ${attemptNumber} of ${attemptsAllowed}`

  return (
    <div className="tt-intro">
      <div className="tt-intro-card">
        <h1 className="tt-intro-title">{test.title}</h1>
        <p className="tt-intro-author">By {test.author_name}</p>
        <div className="tt-intro-divider" />

        <div className="tt-intro-stats">
          <span className="tt-intro-stat">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10"/>
              <path d="M3.51 15a9 9 0 1 0 .49-3.51"/>
            </svg>
            {attemptsChip}
          </span>
          <span className="tt-intro-stat">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            {test.time_limit_minutes} min
          </span>

          <span className="tt-intro-stat">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
            </svg>
            {panels.length} panel{panels.length !== 1 ? 's' : ''}
          </span>

          {exercisePanelCount > 0 && (
            <span className="tt-intro-stat">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
              </svg>
              {exercisePanelCount} exercise panel{exercisePanelCount !== 1 ? 's' : ''}
            </span>
          )}

          {test.due_date && (
            <span className="tt-intro-stat">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Due {formatDate(test.due_date)}
            </span>
          )}
        </div>

        <div className="tt-intro-actions">
          <button className="tt-start-btn" onClick={onStart}>Start Test</button>
          <button className="tt-back-btn" onClick={onBack}>Back to Courses</button>
        </div>
      </div>
    </div>
  )
}
