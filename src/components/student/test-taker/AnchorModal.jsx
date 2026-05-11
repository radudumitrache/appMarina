import '../../css/student/test-taker/AnchorModal.css'

export default function AnchorModal({ anchor, value, onChange, onClose }) {
  if (!anchor) return null

  return (
    <div className="anchor-overlay" onPointerDown={onClose}>
      <div className="anchor-modal" onPointerDown={e => e.stopPropagation()}>
        <button className="anchor-modal__close" onClick={onClose} aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {anchor.title && (
          <p className="anchor-modal__label">{anchor.title}</p>
        )}

        {anchor.text && (
          <div className="anchor-modal__text" dangerouslySetInnerHTML={{ __html: anchor.text }} />
        )}

        <div className="anchor-modal__input">
          <AnchorInput anchor={anchor} value={value} onChange={onChange} />
        </div>
      </div>
    </div>
  )
}

function AnchorInput({ anchor, value, onChange }) {
  if (anchor._type === 'mcq') {
    return (
      <div className="tt-mcq-options">
        {(anchor.options ?? []).map(opt => (
          <button
            key={opt.id}
            className={`tt-mcq-option${value === opt.id ? ' tt-mcq-option--selected' : ''}`}
            onClick={() => onChange(opt.id)}
          >
            <span className="tt-mcq-marker" />
            {opt.text}
          </button>
        ))}
      </div>
    )
  }

  if (anchor._type === 'tf') {
    return (
      <div className="tt-tf-options">
        <button
          className={`tt-tf-btn${value === true  ? ' tt-tf-btn--selected' : ''}`}
          onClick={() => onChange(true)}
        >True</button>
        <button
          className={`tt-tf-btn${value === false ? ' tt-tf-btn--selected' : ''}`}
          onClick={() => onChange(false)}
        >False</button>
      </div>
    )
  }

  if (anchor._type === 'short') {
    return (
      <textarea
        className="tt-short-input"
        placeholder="Write your answer here..."
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        autoFocus
      />
    )
  }

  if (anchor._type === 'word') {
    return (
      <input
        className="tt-word-input"
        style={{ maxWidth: '100%' }}
        placeholder="Fill in the blank…"
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        autoFocus
      />
    )
  }

  return null
}
