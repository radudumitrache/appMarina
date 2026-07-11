import '../../css/crew/my-class/JoinClassInline.css'

export default function JoinClassInline({ joinCode, onChange, joining, joinError, onSubmit, onCancel, codeRef }) {
  return (
    <div className="myclass-join-inline">
      <span className="myclass-join-inline-label">Join another department</span>
      <form className="myclass-join-inline-form" onSubmit={onSubmit}>
        <input
          ref={codeRef}
          className={`myclass-join-input myclass-join-input--inline${joinError ? ' myclass-join-input--error' : ''}`}
          type="text"
          placeholder="Department code — e.g. MN-2026-A"
          value={joinCode}
          onChange={onChange}
          autoFocus
          autoComplete="off"
          spellCheck={false}
        />
        {joinError && <p className="myclass-join-error">{joinError}</p>}
        <div className="myclass-join-inline-actions">
          <button className="myclass-join-btn myclass-join-btn--sm" type="submit" disabled={joining || !joinCode.trim()}>
            {joining ? 'Joining…' : 'Join'}
          </button>
          <button className="myclass-join-cancel" type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
