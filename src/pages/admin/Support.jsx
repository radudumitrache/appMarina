import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '../../components/admin/NavBar'
import TicketsSidebar from '../../components/admin/support/TicketsSidebar'
import TicketsTable from '../../components/admin/support/TicketsTable'
import TicketModal from '../../components/admin/support/TicketModal'
import { INITIAL_TICKETS, nextCommentId } from './supportMock'
import '../css/admin/Support.css'

export default function Support() {
  const navigate = useNavigate()
  const [tickets, setTickets]         = useState(INITIAL_TICKETS)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch]           = useState('')
  const [selected, setSelected]       = useState(null)

  const counts = {
    all:      tickets.length,
    open:     tickets.filter(t => t.status === 'open').length,
    pending:  tickets.filter(t => t.status === 'pending').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
  }

  const filtered = tickets
    .filter(t => statusFilter === 'all' || t.status === statusFilter)
    .filter(t =>
      t.ticket_id.toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.author_name.toLowerCase().includes(search.toLowerCase())
    )

  const openCount = counts.open + counts.pending

  const handleStatusChange = (ticketId, newStatus) => {
    const now = new Date().toISOString()
    setTickets(prev => prev.map(t =>
      t.id === ticketId ? { ...t, status: newStatus, updated_at: now } : t
    ))
    setSelected(prev => prev?.id === ticketId ? { ...prev, status: newStatus, updated_at: now } : prev)
  }

  const handleAddComment = (ticketId, body) => {
    const now = new Date().toISOString()
    const comment = { id: nextCommentId(), author_name: 'Support Admin', body, created_at: now }
    setTickets(prev => prev.map(t =>
      t.id === ticketId
        ? { ...t, comments: [...t.comments, comment], updated_at: now }
        : t
    ))
    setSelected(prev =>
      prev?.id === ticketId
        ? { ...prev, comments: [...prev.comments, comment], updated_at: now }
        : prev
    )
  }

  return (
    <div className="as-page">
      <div className="as-layout">
        <NavBar />
        <div className="as-body">
          <TicketsSidebar
            statusFilter={statusFilter}
            onFilter={setStatusFilter}
            counts={counts}
          />

          <main className="as-main">
            <div className="as-toolbar">
              <div className="as-toolbar-left">
                <h2 className="as-toolbar-title">
                  {statusFilter === 'all' ? 'All Tickets' :
                   statusFilter === 'open' ? 'Open Tickets' :
                   statusFilter === 'pending' ? 'Pending Tickets' : 'Resolved Tickets'}
                </h2>
                <span className="as-toolbar-count">{filtered.length}</span>
                {openCount > 0 && statusFilter === 'all' && (
                  <span className="as-toolbar-alert">{openCount} need attention</span>
                )}
              </div>
              <div className="as-toolbar-right">
                <div className="as-search-wrap">
                  <svg className="as-search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input
                    className="as-search"
                    type="text"
                    placeholder="Search tickets, users…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <TicketsTable
              tickets={filtered}
              selectedId={selected?.id}
              onSelect={setSelected}
            />
          </main>
        </div>
      </div>

      {selected && (
        <TicketModal
          ticket={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
          onAddComment={handleAddComment}
        />
      )}
    </div>
  )
}
