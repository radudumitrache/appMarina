import '../../css/student/progress/TestResults.css'

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

export default function TestResults({ results, onViewAll }) {
  return (
    <section className="progress-section">
      <div className="section-head">
        <span className="section-title">Test Results</span>
        <button className="section-link" onClick={onViewAll}>
          View all
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
      </div>

      <div className="test-results-list">
        {results.map((t, i) => (
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
  )
}
