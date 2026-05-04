import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '../../components/student/NavBar'
import TicketForm from '../../components/student/support/TicketForm'
import TicketList from '../../components/student/support/TicketList'
import FaqAccordion from '../../components/student/support/FaqAccordion'
import ContactInfo from '../../components/student/support/ContactInfo'
import '../css/student/Support.css'

let _nextId = 5

const INITIAL_TICKETS = [
  {
    id: 'TK-004', subject: 'Cannot access Cargo Management lessons', category: 'Access',
    status: 'open', created: '2026-03-25', updated: '2026-03-27',
    description: 'Lessons 10 and 11 in Cargo Management are locked even though I completed the prerequisites. Please advise.',
    comments: [
      { id: 1, author_name: 'Support Admin', body: 'We are checking the access control settings for your class. Could you confirm your class code?', created_at: '2026-03-27T14:30:00Z' },
    ],
  },
  {
    id: 'TK-003', subject: 'Test result not showing correct grade', category: 'Technical',
    status: 'pending', created: '2026-03-18', updated: '2026-03-20',
    description: 'My grade for Load Calculation Quiz shows 61% but I believe my answers were marked incorrectly on questions 4 and 7.',
    comments: [
      { id: 2, author_name: 'Support Admin', body: 'We are reviewing the quiz answer key. Could you confirm which browser you used when submitting?', created_at: '2026-03-20T09:15:00Z' },
    ],
  },
  {
    id: 'TK-002', subject: 'VR headset not connecting', category: 'Hardware',
    status: 'resolved', created: '2026-03-05', updated: '2026-03-07',
    description: 'The VR headset was not pairing with the companion app after the last firmware update.',
    comments: [
      { id: 3, author_name: 'Support Admin', body: 'Headset pairing correctly after firmware update. Marking as resolved.', created_at: '2026-03-07T10:00:00Z' },
    ],
  },
  {
    id: 'TK-001', subject: 'Reset progress for Bridge Navigation module', category: 'Account',
    status: 'resolved', created: '2026-02-14', updated: '2026-02-15',
    description: 'I would like to reset my progress for the Bridge Navigation module to retake it from scratch.',
    comments: [
      { id: 4, author_name: 'Support Admin', body: 'Progress has been reset as requested. You can retake the module from the beginning.', created_at: '2026-02-15T11:00:00Z' },
    ],
  },
]

const FAQ = [
  { id: 1, q: 'Why are some lessons locked?', a: 'Lessons lock when prerequisite modules are incomplete, or when your instructor has restricted access until a certain date. Check your class assignments for unlock conditions.' },
  { id: 2, q: 'How do I retake a test?', a: 'Test retakes must be approved by your instructor. Contact Capt. Rodriguez directly or submit a support ticket with the test name and your reason for requesting a retake.' },
  { id: 3, q: 'My VR headset is not being detected. What should I do?', a: 'Ensure the SeaFarer VR app is running on your host machine, the headset firmware is up to date, and both devices are on the same network. Restart the companion app and re-pair if needed.' },
  { id: 4, q: 'How is my overall progress calculated?', a: 'Progress is based on lessons marked complete divided by total lessons in the curriculum. Test grades are tracked separately and averaged independently.' },
  { id: 5, q: 'Can I change my class or enrol in multiple classes?', a: 'Class enrolment is managed by your institution. Contact your programme coordinator or submit an Account ticket to request a class change.' },
]

export default function Support() {
  const navigate = useNavigate()
  const [tickets, setTickets] = useState(INITIAL_TICKETS)

  const handleSubmit = ({ subject, category, description }) => {
    const today = new Date().toISOString().slice(0, 10)
    const id = `TK-${String(_nextId++).padStart(3, '0')}`
    setTickets(prev => [
      { id, subject, category, status: 'open', created: today, updated: today, description, comments: [] },
      ...prev,
    ])
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
            <TicketList tickets={tickets} />
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
