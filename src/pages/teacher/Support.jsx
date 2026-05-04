import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar         from '../../components/teacher/NavBar'
import TicketForm     from '../../components/teacher/support/TicketForm'
import TicketList     from '../../components/teacher/support/TicketList'
import SupportFAQ     from '../../components/teacher/support/SupportFAQ'
import SupportContact from '../../components/teacher/support/SupportContact'
import { getTickets, createTicket } from '../../api/support'
import '../css/teacher/Support.css'

function normalizeTicket(t) {
  return {
    id:          t.ticket_id,
    _id:         t.id,
    subject:     t.subject,
    category:    t.tag,
    status:      t.status,
    created:     t.created_at?.slice(0, 10) ?? '',
    updated:     t.updated_at?.slice(0, 10) ?? '',
    description: t.description,
    comments:    t.comments ?? [],
  }
}

export default function Support() {
  const navigate = useNavigate()

  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const fetchTickets = useCallback(async () => {
    try {
      setError(null)
      const { data } = await getTickets()
      setTickets((data.results ?? data).map(normalizeTicket))
    } catch {
      setError('Could not load tickets. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchTickets() }, [fetchTickets])

  const handleSubmit = async ({ subject, category, description }) => {
    const { data } = await createTicket({ subject, description, tag: category })
    setTickets(prev => [normalizeTicket(data), ...prev])
  }

  return (
    <div className="ts-page">
      <NavBar />

      <header className="ts-header">
        <div className="ts-breadcrumb">
          <button className="ts-crumb-link" onClick={() => navigate('/teacher/dashboard')}>
            Dashboard
          </button>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
          <span className="ts-crumb-current">Support</span>
        </div>
        <h1 className="ts-title">Support</h1>
      </header>

      <div className="ts-content">
        <div className="ts-grid">
          <div className="ts-col">
            <TicketForm onSubmit={handleSubmit} />
            {loading ? (
              <section className="ts-section">
                <p className="ts-loading">Loading tickets…</p>
              </section>
            ) : error ? (
              <section className="ts-section">
                <p className="ts-fetch-error">{error}</p>
                <button className="ts-retry-btn" onClick={fetchTickets}>Retry</button>
              </section>
            ) : (
              <TicketList tickets={tickets} />
            )}
          </div>
          <div className="ts-col">
            <SupportFAQ />
            <SupportContact />
          </div>
        </div>
      </div>
    </div>
  )
}
