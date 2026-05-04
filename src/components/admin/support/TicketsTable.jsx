import { STATUS_META } from '../../../pages/admin/supportMock'
import '../../css/admin/support/TicketsTable.css'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const ROLE_LABEL = { student: 'Student', teacher: 'Teacher' }

export default function TicketsTable({ tickets, selectedId, onSelect }) {
  if (tickets.length === 0) {
    return (
      <div className="as-table-wrap">
        <p className="as-table-empty">No tickets match this filter.</p>
      </div>
    )
  }

  return (
    <div className="as-table-wrap">
      <table className="as-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Subject</th>
            <th>From</th>
            <th>Tag</th>
            <th>Status</th>
            <th>Updated</th>
            <th>Replies</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket, i) => {
            const meta = STATUS_META[ticket.status]
            return (
              <tr
                key={ticket.id}
                className={`as-row ${selectedId === ticket.id ? 'as-row--selected' : ''}`}
                style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
                onClick={() => onSelect(ticket)}
              >
                <td>
                  <span className="as-ticket-id">{ticket.ticket_id}</span>
                </td>
                <td>
                  <span className="as-ticket-subject">{ticket.subject}</span>
                </td>
                <td>
                  <div className="as-author">
                    <span className="as-author-name">{ticket.author_name}</span>
                    <span className="as-author-role">{ROLE_LABEL[ticket.author_role]}</span>
                  </div>
                </td>
                <td>
                  <span className="as-tag">{ticket.tag}</span>
                </td>
                <td>
                  <span className={`as-status ${meta.cls}`}>{meta.label}</span>
                </td>
                <td>
                  <span className="as-date">{formatDate(ticket.updated_at)}</span>
                </td>
                <td>
                  <span className="as-reply-count">
                    {ticket.comments.length}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
