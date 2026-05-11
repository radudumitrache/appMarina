import { gradeColor, gradeLabel, fmt } from './helpers'

export default function TestResultsSection({ results, onSelect }) {
  return (
    <div className="sp-section">
      <div className="sp-section-head">
        <span className="sp-section-title">Test Results</span>
        <span className="sp-section-count">{results.length}</span>
      </div>

      {results.length === 0 ? (
        <p className="sp-empty">No tests taken yet.</p>
      ) : (
        <div className="sp-list">
          {results.map((t, i) => (
            <button
              key={t.id}
              className="sp-row sp-row--clickable"
              style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
              onClick={() => onSelect(t)}
            >
              <div className={`sp-grade-block ${t.grade != null ? gradeColor(t.grade) : 'sp-grade--none'}`}>
                <span className="sp-grade-num">{t.grade != null ? Math.round(t.grade) : '—'}</span>
                {t.grade != null && <span className="sp-grade-pct">%</span>}
              </div>

              <div className="sp-row-body">
                <span className="sp-row-title">{t.test_title}</span>
                <span className="sp-row-meta">By {t.test_author_name} · {fmt(t.submitted_at)}</span>
              </div>

              {t.grade != null && (
                <span className={`sp-badge ${gradeColor(t.grade)}`}>{gradeLabel(t.grade)}</span>
              )}

              <svg className="sp-chevron" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
