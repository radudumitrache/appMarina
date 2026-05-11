import { useState, useRef, useEffect } from 'react'
import '../../css/student/my-class/Announcements.css'

function formatAnnDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function PinIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="17" x2="12" y2="22"/>
      <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/>
    </svg>
  )
}

function AnnouncementRow({ ann, index, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen)
  const bodyRef = useRef(null)
  const [height, setHeight] = useState(defaultOpen ? 'auto' : '0px')

  useEffect(() => {
    if (!bodyRef.current) return
    if (open) {
      const h = bodyRef.current.scrollHeight
      setHeight(`${h}px`)
      const t = setTimeout(() => setHeight('auto'), 240)
      return () => clearTimeout(t)
    } else {
      setHeight(`${bodyRef.current.scrollHeight}px`)
      requestAnimationFrame(() => requestAnimationFrame(() => setHeight('0px')))
    }
  }, [open])

  return (
    <div
      className={`announcement-row ${ann.pinned ? 'announcement-row--pinned' : ''}`}
      style={{ animationDelay: `${Math.min(index, 6) * 0.04}s` }}
    >
      <button className="announcement-head" onClick={() => setOpen(v => !v)}>
        <div className="announcement-head-left">
          {ann.pinned && (
            <span className="announcement-pin"><PinIcon /> Pinned</span>
          )}
          <span className="announcement-title">{ann.title}</span>
        </div>
        <svg
          className={`announcement-chevron ${open ? 'announcement-chevron--open' : ''}`}
          width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      <div
        ref={bodyRef}
        className="announcement-body-wrap"
        style={{ height, overflow: 'hidden', transition: 'height 220ms ease' }}
      >
        <div className="announcement-body-inner">
          <p className="announcement-body">{ann.body}</p>
          <div className="announcement-footer">
            <span className="announcement-author">{ann.author}</span>
            <span className="announcement-date">{formatAnnDate(ann.date)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Announcements({ items }) {
  return (
    <section className="myclass-section announcements-panel">
      <div className="section-head">
        <span className="section-title">Announcements</span>
        <span className="section-meta">
          <span className="section-meta-num">{items.length}</span> total
        </span>
      </div>
      {items.length === 0 ? (
        <p className="announcements-empty">No announcements yet.</p>
      ) : (
        <div className="announcements-list">
          {items.map((ann, i) => (
            <AnnouncementRow
              key={ann.id}
              ann={ann}
              index={i}
              defaultOpen={ann.pinned || i === 0}
            />
          ))}
        </div>
      )}
    </section>
  )
}
