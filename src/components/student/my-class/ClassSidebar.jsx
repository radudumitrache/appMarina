import { useState, useRef } from 'react'
import '../../css/student/my-class/ClassSidebar.css'

export default function ClassSidebar({ classes, selectedId, onSelect, onJoin, className = '' }) {
  const [open,      setOpen]      = useState(false)
  const [joinCode,  setJoinCode]  = useState('')
  const [joining,   setJoining]   = useState(false)
  const [joinError, setJoinError] = useState(null)
  const inputRef = useRef(null)

  function handleOpen() {
    setOpen(true)
    setJoinCode('')
    setJoinError(null)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  function handleCancel() {
    setOpen(false)
    setJoinCode('')
    setJoinError(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!joinCode.trim()) return
    setJoining(true)
    setJoinError(null)
    try {
      await onJoin(joinCode.trim())
      setOpen(false)
      setJoinCode('')
    } catch (err) {
      setJoinError(err.response?.data?.detail ?? 'Invalid code. Try again.')
      inputRef.current?.focus()
    } finally {
      setJoining(false)
    }
  }

  return (
    <aside className={`cls-sidebar${className ? ` ${className}` : ''}`}>
      <div className="cls-sidebar-head">
        <span className="cls-sidebar-label">My Departments</span>
        <span className="cls-sidebar-count">{classes.length}</span>
      </div>

      <nav className="cls-sidebar-nav">
        {classes.map(cls => (
          <button
            key={cls.id}
            className={`cls-item${cls.id === selectedId ? ' cls-item--active' : ''}`}
            onClick={() => onSelect(cls.id)}
          >
            <span className="cls-item-name">{cls.name}</span>
            <span className="cls-item-meta">
              <span className="cls-item-trainer">{cls.trainer_name}</span>
              <span className="cls-item-code">{cls.code}</span>
            </span>
          </button>
        ))}
      </nav>

      <div className="cls-sidebar-footer">
        {open ? (
          <form className="cls-join-form" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              className={`cls-join-input${joinError ? ' cls-join-input--error' : ''}`}
              type="text"
              placeholder="Department code"
              value={joinCode}
              onChange={e => { setJoinCode(e.target.value.toUpperCase()); setJoinError(null) }}
              autoComplete="off"
              spellCheck={false}
            />
            {joinError && <p className="cls-join-error">{joinError}</p>}
            <div className="cls-join-actions">
              <button className="cls-join-submit" type="submit" disabled={joining || !joinCode.trim()}>
                {joining ? 'Joining…' : 'Join'}
              </button>
              <button className="cls-join-cancel" type="button" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button className="cls-join-trigger" onClick={handleOpen}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5"  y1="12" x2="19" y2="12"/>
            </svg>
            Join another department
          </button>
        )}
      </div>
    </aside>
  )
}
