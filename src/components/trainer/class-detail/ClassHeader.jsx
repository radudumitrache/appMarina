import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../css/trainer/class-detail/ClassHeader.css'

const STATUS_LABELS = { active: 'Active', complete: 'Complete', archived: 'Archived' }

function fallbackCopy(text, onDone) {
  const ta = document.createElement('textarea')
  ta.value = text
  ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0'
  document.body.appendChild(ta)
  ta.focus()
  ta.select()
  try { document.execCommand('copy'); onDone() } catch {}
  document.body.removeChild(ta)
}

export default function ClassHeader({ name, code, status, onEdit, onDelete }) {
  const navigate = useNavigate()
  const [copied,   setCopied]   = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const handleCopy = () => {
    const done = () => { setCopied(true); setTimeout(() => setCopied(false), 2000) }

    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        navigator.clipboard.writeText(code).then(done).catch(() => fallbackCopy(code, done))
      } else {
        fallbackCopy(code, done)
      }
    } catch {
      fallbackCopy(code, done)
    }
  }

  return (
    <div className="cd-header-wrapper">
      <div className="cd-header">
        <div className="cd-header-left">
          <div className="cd-breadcrumb">
            <button className="cd-crumb-link" onClick={() => navigate('/trainer/dashboard')}>Dashboard</button>
            <span className="cd-crumb-sep">/</span>
            <button className="cd-crumb-link" onClick={() => navigate('/trainer/departments')}>My Departments</button>
            <span className="cd-crumb-sep">/</span>
          </div>
          <div className="cd-title-row">
            <h1 className="cd-title">{name}</h1>
            <span className={`cd-status-badge cd-status--${status}`}>
              {STATUS_LABELS[status]}
            </span>
          </div>
        </div>
        <div className="cd-header-actions">
          <button className="cd-btn-secondary" onClick={onEdit}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Edit Department
          </button>
          <div className="cd-menu-wrap">
            <button
              className={`cd-btn-icon${menuOpen ? ' cd-btn-icon--active' : ''}`}
              title="More options"
              onClick={() => setMenuOpen(o => !o)}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="5"  r="1"/>
                <circle cx="12" cy="12" r="1"/>
                <circle cx="12" cy="19" r="1"/>
              </svg>
            </button>
            {menuOpen && (
              <>
                <div className="cd-menu-backdrop" onClick={() => setMenuOpen(false)} />
                <div className="cd-menu">
                  <button
                    className="cd-menu-item cd-menu-item--danger"
                    onClick={() => { setMenuOpen(false); onDelete?.() }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                      <path d="M9 6V4h6v2"/>
                    </svg>
                    Delete Department
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="cd-enroll-strip">
        <div className="cd-enroll-strip-left">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
          <span className="cd-enroll-label">Department Code</span>
          <span className="cd-enroll-code">{code}</span>
          <span className="cd-enroll-hint">Share this code with students so they can enroll in this department</span>
        </div>
        <button className="cd-copy-btn" onClick={handleCopy}>
          {copied ? (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
              Copy Code
            </>
          )}
        </button>
      </div>
    </div>
  )
}
