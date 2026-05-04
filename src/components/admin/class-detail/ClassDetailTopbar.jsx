import '../../css/admin/class-detail/ClassDetailTopbar.css'

function ChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  )
}

export default function ClassDetailTopbar({ status, onBack, onToggleArchive, onEdit }) {
  return (
    <div className="cd-topbar">
      <button className="cd-back-btn" onClick={onBack}>
        <ChevronLeft />
        Classes
      </button>
      <div className="cd-topbar-right">
        <button
          className={`cd-archive-btn ${status === 'archived' ? 'cd-archive-btn--restore' : ''}`}
          onClick={onToggleArchive}
        >
          {status === 'active' ? 'Archive' : 'Restore'}
        </button>
        <button className="btn-primary-sm" onClick={onEdit}>Edit Details</button>
      </div>
    </div>
  )
}
