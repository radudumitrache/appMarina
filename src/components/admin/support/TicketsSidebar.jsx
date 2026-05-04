import '../../css/admin/support/TicketsSidebar.css'

const FILTERS = [
  { id: 'all',      label: 'All Tickets' },
  { id: 'open',     label: 'Open'        },
  { id: 'pending',  label: 'Pending'     },
  { id: 'resolved', label: 'Resolved'    },
]

export default function TicketsSidebar({ statusFilter, onFilter, counts }) {
  return (
    <aside className="as-sidebar">
      <div className="as-sidebar-head">
        <span className="as-sidebar-label">Filter</span>
      </div>
      <nav className="as-sidebar-nav">
        {FILTERS.map(f => (
          <button
            key={f.id}
            className={`as-sidebar-btn ${statusFilter === f.id ? 'as-sidebar-btn--active' : ''}`}
            onClick={() => onFilter(f.id)}
          >
            <span className="as-sidebar-btn-label">{f.label}</span>
            <span className="as-sidebar-btn-count">{counts[f.id]}</span>
          </button>
        ))}
      </nav>
    </aside>
  )
}
