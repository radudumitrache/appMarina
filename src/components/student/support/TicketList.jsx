import '../../css/student/support/TicketList.css'
import { useState } from 'react'

const STATUS_META = {
  open:     { label: 'Open',     cls: 'status--open'     },
  pending:  { label: 'Pending',  cls: 'status--pending'  },
  resolved: { label: 'Resolved', cls: 'status--resolved' },
}

const FILTERS = [
  { id: 'all',      label: 'All'      },
  { id: 'open',     label: 'Open'     },
  { id: 'pending',  label: 'Pending'  },
  { id: 'resolved', label: 'Resolved' },
]

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatDateTime(iso) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function TicketList({ tickets }) {
  const [filter, setFilter]     = useState('all')
  const [expanded, setExpanded] = useState(null)

  const filtered    = filter === 'all' ? tickets : tickets.filter(t => t.status === filter)
  const activeCount = tickets.filter(t => t.status === 'open' || t.status === 'pending').length

  const toggle = (id) => setExpanded(prev => prev === id ? null : id)

  return (
    <section className="support-section">
      <div className="section-head">
        <span className="section-title">My Tickets</span>
        {activeCount > 0 && (
          <span className="tickets-alert">{activeCount} active</span>
        )}
        <div className="ticket-filter">
          {FILTERS.map(f => (
            <button
              key={f.id}
              className={`ticket-filter-btn ${filter === f.id ? 'ticket-filter-btn--active' : ''}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="support-empty">No tickets in this category.</p>
      ) : (
        <div className="tickets-list">
          {filtered.map((ticket, i) => {
            const meta   = STATUS_META[ticket.status]
            const isOpen = expanded === ticket.id
            return (
              <div
                key={ticket.id}
                className={`ticket-row ${isOpen ? 'ticket-row--expanded' : ''}`}
                style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
              >
                <button className="ticket-row-summary" onClick={() => toggle(ticket.id)}>
                  <div className="ticket-row-top">
                    <span className="ticket-id">{ticket.id}</span>
                    <span className="ticket-subject">{ticket.subject}</span>
                    <span className={`ticket-status ${meta.cls}`}>{meta.label}</span>
                    <svg
                      className={`ticket-chevron ${isOpen ? 'ticket-chevron--open' : ''}`}
                      width="12" height="12" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>
                  <div className="ticket-row-meta">
                    <span className="ticket-cat">{ticket.category}</span>
                    <span className="ticket-sep">·</span>
                    <span className="ticket-date">Updated {formatDate(ticket.updated)}</span>
                    {ticket.comments?.length > 0 && (
                      <>
                        <span className="ticket-sep">·</span>
                        <span className="ticket-reply">{ticket.comments.length} {ticket.comments.length === 1 ? 'reply' : 'replies'} from Support</span>
                      </>
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="ticket-detail">
                    <div className="ticket-detail-section">
                      <span className="ticket-detail-label">Your message</span>
                      <p className="ticket-detail-body">{ticket.description}</p>
                    </div>

                    {ticket.comments?.length > 0 && (
                      <div className="ticket-detail-section">
                        <span className="ticket-detail-label">Support replies</span>
                        <div className="ticket-comments">
                          {ticket.comments.map(c => (
                            <div key={c.id} className="ticket-comment">
                              <div className="ticket-comment-header">
                                <span className="ticket-comment-author">{c.author_name}</span>
                                <span className="ticket-comment-date">{formatDateTime(c.created_at)}</span>
                              </div>
                              <p className="ticket-comment-body">{c.body}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(!ticket.comments || ticket.comments.length === 0) && (
                      <p className="ticket-no-replies">No replies yet. We'll respond within 1–2 business days.</p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
