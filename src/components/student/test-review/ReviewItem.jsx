import { resolveItem, statusClass, statusLabel } from './reviewHelpers'

export default function ReviewItem({ item, index }) {
  const info = resolveItem(item)

  return (
    <div className={`tr-item ${statusClass(info.isCorrect)}`}>
      <div className="tr-item-top">
        <div className="tr-item-left">
          <span className="tr-item-num">{index + 1}</span>
          <span className="tr-item-type">{info.typeLabel}</span>
        </div>
        <span className={`tr-status-badge ${statusClass(info.isCorrect)}`}>
          {info.isCorrect === true && (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          )}
          {info.isCorrect === false && (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          )}
          {statusLabel(info.isCorrect)}
        </span>
      </div>

      {info.title && <p className="tr-item-subtitle">{info.title}</p>}

      <div
        className="tr-item-text"
        dangerouslySetInnerHTML={{ __html: info.text }}
      />

      {info.options ? (
        <OptionsList
          options={info.options}
          studentOptId={info.studentOptId}
          correctOptId={info.correctOptId}
          isCorrect={info.isCorrect}
        />
      ) : (
        <div className="tr-answers">
          <div className="tr-answer-row">
            <span className="tr-answer-label">Your answer</span>
            <span className={`tr-answer-value${info.isCorrect === false ? ' tr-answer-value--wrong' : ''}`}>
              {info.studentAnswer}
            </span>
          </div>
          {info.correctAnswer !== null && (
            <div className="tr-answer-row">
              <span className="tr-answer-label">Correct answer</span>
              <span className="tr-answer-value tr-answer-value--correct">{info.correctAnswer}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function OptionsList({ options, studentOptId, correctOptId, isCorrect }) {
  return (
    <div className="tr-options">
      {options.map(opt => {
        const isStudent    = opt.id === studentOptId
        const isCorrectOpt = opt.id === correctOptId

        let cls = 'tr-option'
        if (isStudent && isCorrect === true)                      cls += ' tr-option--correct'
        if (isStudent && isCorrect === false)                     cls += ' tr-option--wrong'
        if (!isStudent && isCorrectOpt && isCorrect === false)    cls += ' tr-option--correct-hint'

        return (
          <div key={opt.id} className={cls}>
            <span className="tr-option-marker" />
            <span className="tr-option-text">{opt.text}</span>
            {isStudent && (
              <span className="tr-option-tag">
                {isCorrect === true ? 'Your answer ✓' : 'Your answer'}
              </span>
            )}
            {!isStudent && isCorrectOpt && isCorrect === false && (
              <span className="tr-option-tag tr-option-tag--correct">Correct</span>
            )}
          </div>
        )
      })}
    </div>
  )
}
