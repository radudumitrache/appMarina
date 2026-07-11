import '../../css/crew/my-class/JoinClassCard.css'

export default function JoinClassCard({ joinCode, onChange, joining, joinError, onSubmit, codeRef }) {
  return (
    <div className="myclass-join-wrap">
      <div className="myclass-join-card">
        <div className="myclass-join-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <line x1="19" y1="8" x2="19" y2="14"/>
            <line x1="22" y1="11" x2="16" y2="11"/>
          </svg>
        </div>
        <h2 className="myclass-join-title">Join a Department</h2>
        <p className="myclass-join-sub">Enter the department code your trainer gave you.</p>
        <form className="myclass-join-form" onSubmit={onSubmit}>
          <input
            ref={codeRef}
            className={`myclass-join-input${joinError ? ' myclass-join-input--error' : ''}`}
            type="text"
            placeholder="e.g. MN-2026-A"
            value={joinCode}
            onChange={onChange}
            autoFocus
            autoComplete="off"
            spellCheck={false}
          />
          {joinError && <p className="myclass-join-error">{joinError}</p>}
          <button className="myclass-join-btn" type="submit" disabled={joining || !joinCode.trim()}>
            {joining ? 'Joining…' : 'Join Department'}
          </button>
        </form>
      </div>
    </div>
  )
}
