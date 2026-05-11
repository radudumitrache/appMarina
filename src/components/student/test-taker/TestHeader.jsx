import '../../css/student/test-taker/TestHeader.css'

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function TestHeader({ title, timeLeft, submitting, onBack, onSubmit }) {
  const isUrgent = timeLeft <= 60

  return (
    <header className="tt-header">
      <div className="tt-header-left">
        <button className="tt-crumb-btn" onClick={onBack}>Tests</button>
        <span className="tt-crumb-sep">/</span>
        <span className="tt-header-title">{title}</span>
      </div>

      <div className="tt-header-right">
        <span className={`tt-timer${isUrgent ? ' tt-timer--urgent' : ''}`}>
          {formatTime(timeLeft)}
        </span>
        <button className="tt-submit-btn" onClick={onSubmit} disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Test'}
        </button>
      </div>
    </header>
  )
}
