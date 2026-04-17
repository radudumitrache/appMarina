import { CAT_LABELS, CAT_COLORS, formatDuration } from './courseBuilderUtils'

export default function LessonBank({
  bankOpen,
  setBankOpen,
  lessonBankCount,
  bankFiltered,
  bankSearch,
  setBankSearch,
  selectedLessons,
  saving,
  onAdd,
}) {
  return (
    <div className="cb-bank-section">
      <button
        className={`cb-bank-toggle ${bankOpen ? 'cb-bank-toggle--open' : ''}`}
        onClick={() => setBankOpen(v => !v)}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </svg>
        Lesson Bank
        <span className="cb-bank-count">{lessonBankCount}</span>
        <svg className="cb-bank-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {bankOpen && (
        <div className="cb-bank-panel">
          <div className="cb-bank-search-wrap">
            <svg className="cb-bank-search-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className="cb-bank-search"
              type="text"
              placeholder="Filter lessons…"
              value={bankSearch}
              onChange={e => setBankSearch(e.target.value)}
            />
          </div>
          <div className="cb-bank-list">
            {bankFiltered.map((lesson, i) => {
              const added = selectedLessons?.some(l => l.id === lesson.id) ?? false
              return (
                <div
                  key={lesson.id}
                  className={`cb-bank-row ${added ? 'cb-bank-row--added' : ''}`}
                  style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
                >
                  <div className="cb-bank-row-body">
                    <span className="cb-bank-title">{lesson.title}</span>
                    <div className="cb-bank-meta">
                      <span className={`cb-cat-tag ${CAT_COLORS[lesson.category] || ''}`}>
                        {CAT_LABELS[lesson.category] ?? lesson.category}
                      </span>
                      <span className="cb-bank-dur">{formatDuration(lesson.duration_minutes)}</span>
                    </div>
                  </div>
                  <button
                    className={`cb-bank-add-btn ${added ? 'cb-bank-add-btn--added' : ''}`}
                    onClick={() => !added && !saving && onAdd(lesson.id)}
                    disabled={added || saving}
                  >
                    {added ? (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        Added
                      </>
                    ) : (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        Add
                      </>
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
