import { useState } from 'react'
import { STATUS_META } from '../../../pages/admin/supportMock'
import '../../css/admin/support/TicketModal.css'

const STATUS_TRANSITIONS = {
  open:     ['pending', 'resolved'],
  pending:  ['open', 'resolved'],
  resolved: ['open', 'pending'],
}

const STATUS_LABELS = { open: 'Open', pending: 'Pending', resolved: 'Resolved' }

function formatDate(iso) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatDateShort(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function TicketModal({ ticket, onClose, onStatusChange, onAddComment }) {
  const [commentBody, setCommentBody] = useState('')
  const [commentError, setCommentError] = useState('')

  const meta = STATUS_META[ticket.status]

  const handleSubmitComment = (e) => {
    e.preventDefault()
    if (!commentBody.trim()) { setCommentError('Comment cannot be empty.'); return }
    onAddComment(ticket.id, commentBody.trim())
    setCommentBody('')
    setCommentError('')
  }

  return (
    <div className="tm-backdrop" onClick={onClose}>
      <div className="tm-modal" onClick={e => e.stopPropagation()}>

        <div className="tm-header">
          <div className="tm-header-left">
            <span className="tm-ticket-id">{ticket.ticket_id}</span>
            <h3 className="tm-title">{ticket.subject}</h3>
          </div>
          <div className="tm-header-right">
            <span className={`tm-status ${meta.cls}`}>{meta.label}</span>
            <button className="tm-close" onClick={onClose} aria-label="Close">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="tm-body">

          <div className="tm-meta-row">
            <span className="tm-meta-item">
              <span className="tm-meta-label">From</span>
              <span className="tm-meta-value">{ticket.author_name}</span>
              <span className="tm-meta-role">{ticket.author_role}</span>
            </span>
            <span className="tm-meta-item">
              <span className="tm-meta-label">Tag</span>
              <span className="tm-meta-value">{ticket.tag}</span>
            </span>
            <span className="tm-meta-item">
              <span className="tm-meta-label">Submitted</span>
              <span className="tm-meta-value">{formatDateShort(ticket.created_at)}</span>
            </span>
            <span className="tm-meta-item">
              <span className="tm-meta-label">Updated</span>
              <span className="tm-meta-value">{formatDateShort(ticket.updated_at)}</span>
            </span>
          </div>

          <div className="tm-section">
            <span className="tm-section-label">Description</span>
            <p className="tm-description">{ticket.description}</p>
          </div>

          <div className="tm-section">
            <span className="tm-section-label">
              Comments
              {ticket.comments.length > 0 && (
                <span className="tm-comment-count">{ticket.comments.length}</span>
              )}
            </span>

            {ticket.comments.length === 0 ? (
              <p className="tm-no-comments">No comments yet.</p>
            ) : (
              <div className="tm-comments-list">
                {ticket.comments.map(c => (
                  <div key={c.id} className="tm-comment">
                    <div className="tm-comment-header">
                      <span className="tm-comment-author">{c.author_name}</span>
                      <span className="tm-comment-date">{formatDate(c.created_at)}</span>
                    </div>
                    <p className="tm-comment-body">{c.body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="tm-section">
            <span className="tm-section-label">Reply</span>
            <form className="tm-reply-form" onSubmit={handleSubmitComment} noValidate>
              <textarea
                className={`tm-reply-textarea ${commentError ? 'tm-reply-textarea--error' : ''}`}
                rows={3}
                placeholder="Write a reply to the user…"
                value={commentBody}
                onChange={e => { setCommentBody(e.target.value); setCommentError('') }}
              />
              {commentError && <span className="tm-reply-error">{commentError}</span>}
              <div className="tm-reply-actions">
                <div className="tm-status-actions">
                  <span className="tm-status-label">Move to:</span>
                  {STATUS_TRANSITIONS[ticket.status].map(s => (
                    <button
                      key={s}
                      type="button"
                      className={`tm-status-btn tm-status-btn--${s}`}
                      onClick={() => onStatusChange(ticket.id, s)}
                    >
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
                <button type="submit" className="tm-reply-btn">
                  Post Reply
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  )
}
