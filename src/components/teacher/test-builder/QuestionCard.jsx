import { Q_TYPES } from '../../../pages/teacher/testBuilderMock'
import '../../css/teacher/test-builder/QuestionCard.css'

export default function QuestionCard({ q, index, onUpdate, onDelete }) {
  return (
    <div className="tb-q-card" style={{ animationDelay: `${Math.min(index, 6) * 0.04}s` }}>
      <div className="tb-q-card-header">
        <span className="tb-q-num">{String(index + 1).padStart(2, '0')}</span>
        <span className="tb-q-type-tag">{Q_TYPES.find(t => t.id === q.type)?.label}</span>
        <button className="tb-q-delete" onClick={onDelete} title="Remove question">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </button>
      </div>

      <textarea
        className="tb-q-text"
        rows={2}
        value={q.text}
        onChange={e => onUpdate({ text: e.target.value })}
        placeholder="Question text…"
      />

      {q.type === 'mcq' && (
        <div className="tb-mcq-options">
          {q.options.map((opt, oi) => (
            <label key={oi} className={`tb-mcq-option ${q.correct === oi ? 'tb-mcq-option--correct' : ''}`}>
              <input
                type="radio"
                name={`q-${q.id}-correct`}
                checked={q.correct === oi}
                onChange={() => onUpdate({ correct: oi })}
              />
              <input
                className="tb-option-input"
                type="text"
                value={opt}
                onChange={e => {
                  const opts = [...q.options]
                  opts[oi] = e.target.value
                  onUpdate({ options: opts })
                }}
                placeholder={`Option ${oi + 1}…`}
              />
            </label>
          ))}
          <span className="tb-mcq-hint">Select the correct answer</span>
        </div>
      )}

      {q.type === 'tf' && (
        <div className="tb-tf-options">
          <label className={`tb-tf-option ${q.correct === true ? 'tb-tf-option--correct' : ''}`}>
            <input type="radio" name={`q-${q.id}-tf`} checked={q.correct === true} onChange={() => onUpdate({ correct: true })} />
            True
          </label>
          <label className={`tb-tf-option ${q.correct === false ? 'tb-tf-option--correct' : ''}`}>
            <input type="radio" name={`q-${q.id}-tf`} checked={q.correct === false} onChange={() => onUpdate({ correct: false })} />
            False
          </label>
        </div>
      )}

      {q.type === 'short' && (
        <div className="tb-short-hint">Students type a free-text response.</div>
      )}
    </div>
  )
}
