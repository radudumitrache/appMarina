import { useState, useEffect } from 'react'
import NavBar from '../../components/admin/NavBar'
import TicketsSidebar from '../../components/admin/support/TicketsSidebar'
import TicketsTable from '../../components/admin/support/TicketsTable'
import TicketModal from '../../components/admin/support/TicketModal'
import { getTickets, updateTicket, addComment } from '../../api/support'
import Sk from '../../components/shared/Skeleton'
import '../css/admin/Support.css'

export default function Support() {
  const [tickets, setTickets]           = useState([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch]             = useState('')
  const [selected, setSelected]         = useState(null)
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    getTickets()
      .then(({ data }) => setTickets(data))
      .finally(() => setLoading(false))
  }, [])

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

  const handleStatusChange = async (ticketId, newStatus) => {
    const { data } = await updateTicket(ticketId, { status: newStatus })
    setTickets(prev => prev.map(t => t.id === ticketId ? data : t))
    setSelected(prev => prev?.id === ticketId ? data : prev)
  }

  const handleAddComment = async (ticketId, body) => {
    const { data: comment } = await addComment(ticketId, { body })
    setTickets(prev => prev.map(t =>
      t.id === ticketId ? { ...t, comments: [...t.comments, comment] } : t
    ))
    setSelected(prev =>
      prev?.id === ticketId ? { ...prev, comments: [...prev.comments, comment] } : prev
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
                  {statusFilter === 'all'      ? 'All Tickets'      :
                   statusFilter === 'open'     ? 'Open Tickets'     :
                   statusFilter === 'pending'  ? 'Pending Tickets'  : 'Resolved Tickets'}
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

            {loading
              ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '4px 0' }}>
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', opacity: 1 - i * 0.1 }}>
                      <Sk w={72}  h={13} r={4} style={{ flexShrink: 0 }} />
                      <Sk w={`${30 + (i % 4) * 8}%`} h={13} />
                      <Sk w={70}  h={20} r={4} style={{ flexShrink: 0 }} />
                      <Sk w={60}  h={13} r={4} style={{ flexShrink: 0, marginLeft: 'auto' }} />
                      <Sk w={80}  h={13} style={{ flexShrink: 0 }} />
                    </div>
                  ))}
                </div>
              )
              : <TicketsTable
                  tickets={filtered}
                  selectedId={selected?.id}
                  onSelect={setSelected}
                />
            }
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
