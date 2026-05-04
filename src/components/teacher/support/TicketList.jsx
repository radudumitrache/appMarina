import { useState } from 'react'
import '../../css/teacher/support/TicketList.css'

const STATUS_META = {
  open:     { label: 'Open',     cls: 'ts-status--open'     },
  pending:  { label: 'Pending',  cls: 'ts-status--pending'  },
  resolved: { label: 'Resolved', cls: 'ts-status--resolved' },
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
  const [ticketFilter, setTicketFilter] = useState('all')
  const [expanded, setExpanded]         = useState(null)

  const filtered    = ticketFilter === 'all' ? tickets : tickets.filter(t => t.status === ticketFilter)
  const activeCount = tickets.filter(t => t.status !== 'resolved').length

  const toggle = (id) => setExpanded(prev => prev === id ? null : id)

  return (
    <section className="ts-section" style={{ animationDelay: '0.06s' }}>
      <div className="ts-section-head">
        <span className="ts-section-title">My Tickets</span>
        {activeCount > 0 && (
          <span className="ts-active-badge">{activeCount} active</span>
        )}
        <div className="ts-filter">
          {FILTERS.map(f => (
            <button
              key={f.id}
              className={`ts-filter-btn ${ticketFilter === f.id ? 'ts-filter-btn--active' : ''}`}
              onClick={() => setTicketFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="ts-empty">No tickets in this category.</p>
      ) : (
        <div className="ts-ticket-list">
          {filtered.map((ticket, i) => {
            const meta   = STATUS_META[ticket.status]
            const isOpen = expanded === ticket.id
            return (
              <div
                key={ticket.id}
                className={`ts-ticket-row ${isOpen ? 'ts-ticket-row--expanded' : ''}`}
                style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
              >
                <button className="ts-ticket-summary" onClick={() => toggle(ticket.id)}>
                  <div className="ts-ticket-top">
                    <span className="ts-ticket-id">{ticket.id}</span>
                    <span className="ts-ticket-subject">{ticket.subject}</span>
                    <span className={`ts-ticket-status ${meta.cls}`}>{meta.label}</span>
                    <svg
                      className={`ts-ticket-chevron ${isOpen ? 'ts-ticket-chevron--open' : ''}`}
                      width="12" height="12" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>
                  <div className="ts-ticket-meta">
                    <span className="ts-ticket-cat">{ticket.category}</span>
                    <span className="ts-ticket-sep">·</span>
                    <span className="ts-ticket-date">Updated {formatDate(ticket.updated)}</span>
                    {ticket.comments?.length > 0 && (
                      <>
                        <span className="ts-ticket-sep">·</span>
                        <span className="ts-ticket-reply">{ticket.comments.length} {ticket.comments.length === 1 ? 'reply' : 'replies'} from Support</span>
                      </>
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="ts-ticket-detail">
                    <div className="ts-ticket-detail-section">
                      <span className="ts-ticket-detail-label">Your message</span>
                      <p className="ts-ticket-detail-body">{ticket.description}</p>
                    </div>

                    {ticket.comments?.length > 0 && (
                      <div className="ts-ticket-detail-section">
                        <span className="ts-ticket-detail-label">Support replies</span>
                        <div className="ts-ticket-comments">
                          {ticket.comments.map(c => (
                            <div key={c.id} className="ts-ticket-comment">
                              <div className="ts-ticket-comment-header">
                                <span className="ts-ticket-comment-author">{c.author_name}</span>
                                <span className="ts-ticket-comment-date">{formatDateTime(c.created_at)}</span>
                              </div>
                              <p className="ts-ticket-comment-body">{c.body}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(!ticket.comments || ticket.comments.length === 0) && (
                      <p className="ts-ticket-no-replies">No replies yet. We'll respond within 1–2 business days.</p>
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
