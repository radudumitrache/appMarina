import { resolveQuestion, cardClass } from './helpers'
import { AnswerBody } from './AnswerRenderers'

function ToggleBtn({ isCorrect, onClick, saving }) {
  if (isCorrect === true) return (
    <button className="so-toggle so-toggle--correct" onClick={onClick} disabled={saving}>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      Correct
    </button>
  )
  if (isCorrect === false) return (
    <button className="so-toggle so-toggle--wrong" onClick={onClick} disabled={saving}>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
      Incorrect
    </button>
  )
  return (
    <button className="so-toggle so-toggle--pending" onClick={onClick} disabled={saving}>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      Pending
    </button>
  )
}

export default function QuestionCard({ item, onToggle, saving, delay }) {
  const resolved   = resolveQuestion(item)
  const unanswered = item.answer === null
  const answerId   = item.answer?.id
  const { isCorrect, typeLabel, text, title } = resolved

  const handleToggle = () => {
    if (!answerId) return
    onToggle(answerId, isCorrect !== true)
  }

  return (
    <div className={cardClass(isCorrect, unanswered)} style={{ animationDelay: `${delay}s` }}>
      <div className="so-card-body">
        <div className="so-card-top">
          <span className="so-type-badge">{typeLabel}</span>
          {title && <span className="so-anchor-title">{title}</span>}
        </div>

        {text && (
          <div className="so-q-text" dangerouslySetInnerHTML={{ __html: text }} />
        )}

        <AnswerBody resolved={resolved} unanswered={unanswered} />
      </div>

      <div className="so-controls">
        {!unanswered ? (
          <>
            <ToggleBtn isCorrect={isCorrect} onClick={handleToggle} saving={saving} />
            <span className="so-toggle-hint">click to toggle</span>
          </>
        ) : (
          <span className="so-toggle-hint" style={{ color: 'var(--error)', opacity: 0.55 }}>no answer</span>
        )}
      </div>
    </div>
  )
}
