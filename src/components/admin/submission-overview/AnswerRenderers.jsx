import VRLocalizationReview from './VRLocalizationReview'

export function CheckIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

export function XIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}

function MCQOptions({ options, studentOptIds, correctOptIds }) {
  return (
    <div className="so-options">
      {options.map(opt => {
        const isStudent = (studentOptIds ?? []).includes(opt.id)
        const isCorrect = (correctOptIds ?? []).includes(opt.id)
        const cls = [
          'so-option',
          isStudent && isCorrect  ? 'so-option--hit'   : '',
          isStudent && !isCorrect ? 'so-option--miss'  : '',
          !isStudent && isCorrect ? 'so-option--answer' : '',
        ].filter(Boolean).join(' ')
        return (
          <div key={opt.id} className={cls}>
            <span className="so-option-icon">
              {isStudent && isCorrect  && <CheckIcon />}
              {isStudent && !isCorrect && <XIcon />}
              {!isStudent && isCorrect && <CheckIcon />}
            </span>
            <span className="so-option-text">{opt.text}</span>
            {isStudent && <span className="so-option-tag so-option-tag--student">Student</span>}
            {isCorrect && <span className="so-option-tag so-option-tag--correct">Correct</span>}
          </div>
        )
      })}
    </div>
  )
}

function TFOptions({ studentTf, correctTf }) {
  return (
    <div className="so-options">
      {[true, false].map(val => {
        const isStudent = studentTf === val
        const isCorrect = correctTf === val
        const cls = [
          'so-option',
          isStudent && isCorrect  ? 'so-option--hit'   : '',
          isStudent && !isCorrect ? 'so-option--miss'  : '',
          !isStudent && isCorrect ? 'so-option--answer' : '',
        ].filter(Boolean).join(' ')
        return (
          <div key={String(val)} className={cls}>
            <span className="so-option-icon">
              {isStudent && isCorrect  && <CheckIcon />}
              {isStudent && !isCorrect && <XIcon />}
              {!isStudent && isCorrect && <CheckIcon />}
            </span>
            <span className="so-option-text">{val ? 'True' : 'False'}</span>
            {isStudent && <span className="so-option-tag so-option-tag--student">Student</span>}
            {isCorrect && <span className="so-option-tag so-option-tag--correct">Correct</span>}
          </div>
        )
      })}
    </div>
  )
}

function ArrangeAnswer({ correctItems, studentItems }) {
  if (correctItems.length === 0) return null
  return (
    <div className="so-arrange">
      <div className="so-arrange-col">
        <span className="so-arrange-col-label">Correct order</span>
        {correctItems.map((item, i) => (
          <div key={item.id} className="so-arrange-item so-arrange-item--correct">
            <span className="so-arrange-num">{i + 1}</span>
            <span className="so-arrange-text">{item.text}</span>
          </div>
        ))}
      </div>
      {studentItems.length > 0 && (
        <div className="so-arrange-col">
          <span className="so-arrange-col-label">Student's order</span>
          {studentItems.map((item, i) => {
            const ok = correctItems[i]?.id === item.id
            return (
              <div key={item.id} className={`so-arrange-item ${ok ? 'so-arrange-item--ok' : 'so-arrange-item--wrong'}`}>
                <span className="so-arrange-num">{i + 1}</span>
                <span className="so-arrange-text">{item.text}</span>
                <span className="so-arrange-icon">{ok ? <CheckIcon /> : <XIcon />}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function TextAnswer({ text, placeholder = 'No answer provided' }) {
  return (
    <div className="so-text-answer">
      {text
        ? <span className="so-text-answer-value">{text}</span>
        : <em className="so-text-answer-empty">{placeholder}</em>
      }
    </div>
  )
}

function WordAnswer({ studentText, correctWord }) {
  return (
    <div className="so-word-answer">
      <div className="so-word-row">
        <span className="so-word-label">Student wrote</span>
        <span className="so-word-value so-word-value--student">
          {studentText || <em style={{ color: 'var(--text-3)' }}>—</em>}
        </span>
      </div>
      <div className="so-word-row">
        <span className="so-word-label">Correct word</span>
        <span className="so-word-value so-word-value--correct">{correctWord}</span>
      </div>
    </div>
  )
}

export function AnswerBody({ resolved, unanswered }) {
  const { type } = resolved

  // Always show the VR viewer for localization — unanswered just means no marker was placed,
  // which the viewer already communicates via its legend.
  if (type === 'localization') return (
    <VRLocalizationReview
      sceneUrl={resolved.sceneUrl}
      studentPosStr={resolved.studentPosStr}
      polygonPoints={resolved.polygonPoints}
      anchorPos={resolved.anchorPos}
    />
  )

  if (unanswered) {
    return (
      <div className="so-unanswered">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        Not answered — counted as incorrect
      </div>
    )
  }

  if (type === 'mcq')    return <MCQOptions options={resolved.options} studentOptIds={resolved.studentOptIds} correctOptIds={resolved.correctOptIds} />
  if (type === 'tf')     return <TFOptions studentTf={resolved.studentTf} correctTf={resolved.correctTf} />
  if (type === 'arrange') return <ArrangeAnswer correctItems={resolved.correctItems} studentItems={resolved.studentItems} />
  if (type === 'word' || type === 'gap_fill')
    return <WordAnswer studentText={resolved.studentText} correctWord={resolved.correctWord} />
  return <TextAnswer text={resolved.studentText} />
}
