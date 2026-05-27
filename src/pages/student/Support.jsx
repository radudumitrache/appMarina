import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '../../components/student/NavBar'
import TicketForm from '../../components/student/support/TicketForm'
import TicketList from '../../components/student/support/TicketList'
import FaqAccordion from '../../components/student/support/FaqAccordion'
import ContactInfo from '../../components/student/support/ContactInfo'
import { getTickets, createTicket } from '../../api/support'
import '../css/student/Support.css'

const FAQ = [
  { id: 1, q: 'Why are some lessons locked?', a: 'Lessons lock when prerequisite modules are incomplete, or when your instructor has restricted access until a certain date. Check your class assignments for unlock conditions.' },
  { id: 2, q: 'How do I retake a test?', a: 'Test retakes must be approved by your instructor. Contact Capt. Rodriguez directly or submit a support ticket with the test name and your reason for requesting a retake.' },
  { id: 3, q: 'My VR headset is not being detected. What should I do?', a: 'Ensure the SeaFarer VR app is running on your host machine, the headset firmware is up to date, and both devices are on the same network. Restart the companion app and re-pair if needed.' },
  { id: 4, q: 'How is my overall progress calculated?', a: 'Progress is based on lessons marked complete divided by total lessons in the curriculum. Test grades are tracked separately and averaged independently.' },
  { id: 5, q: 'Can I change my department or enrol in multiple departments?', a: 'Department enrolment is managed by your institution. Contact your programme coordinator or submit an Account ticket to request a department change.' },
]

function mapTicket(t) {
  return {
    id:          t.ticket_id,
    numericId:   t.id,
    subject:     t.subject,
    description: t.description,
    category:    t.tag ?? '',
    status:      t.status,
    created:     t.created_at,
    updated:     t.updated_at,
    comments:    t.comments ?? [],
  }
}

export default function Support() {
  const navigate = useNavigate()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTickets()
      .then(res => setTickets((res.data ?? []).map(mapTicket)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async ({ subject, category, description }) => {
    try {
      const res = await createTicket({ subject, description, tag: category })
      setTickets(prev => [mapTicket(res.data), ...prev])
    } catch {
      // TicketForm already shows success — silently swallow; ticket won't appear in list
    }
  }

  return (
    <div className="support-page">
      <NavBar />

      <header className="support-header">
        <div className="support-breadcrumb">
          <button className="breadcrumb-link" onClick={() => navigate('/student/dashboard')}>
            Dashboard
          </button>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
          <span className="breadcrumb-current">Support</span>
        </div>
        <h1 className="support-page-title">Support</h1>
      </header>

      <div className="support-content">
        <div className="support-grid">
          <div className="support-left-col">
            <TicketForm onSubmit={handleSubmit} />
            <TicketList tickets={tickets} loading={loading} />
          </div>
          <div className="support-right-col">
            <FaqAccordion items={FAQ} />
            <ContactInfo />
          </div>
        </div>
      </div>
    </div>
  )
}
