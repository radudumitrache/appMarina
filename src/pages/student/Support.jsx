import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '../../components/student/NavBar'
import '../css/student/Support.css'

// ── Data ──────────────────────────────────────────────────────────────────────

const MY_TICKETS = [
  {
    id: 'TK-004',
    subject:   'Cannot access Cargo Management lessons',
    category:  'Access',
    status:    'open',
    created:   '2026-03-25',
    updated:   '2026-03-27',
    lastReply: 'Support Team',
    body:      'Lessons 10 and 11 in Cargo Management are locked even though I completed the prerequisites. Please advise.',
  },
  {
    id: 'TK-003',
    subject:   'Test result not showing correct grade',
    category:  'Technical',
    status:    'pending',
    created:   '2026-03-18',
    updated:   '2026-03-20',
    lastReply: 'Support Team',
    body:      'My grade for Load Calculation Quiz shows 61% but I believe my answers were marked incorrectly on questions 4 and 7.',
  },
  {
    id: 'TK-002',
    subject:   'VR headset not connecting',
    category:  'Hardware',
    status:    'resolved',
    created:   '2026-03-05',
    updated:   '2026-03-07',
    lastReply: 'Support Team',
    body:      'Headset was pairing fine after firmware update. Resolved.',
  },
  {
    id: 'TK-001',
    subject:   'Reset progress for Bridge Navigation module',
    category:  'Account',
    status:    'resolved',
    created:   '2026-02-14',
    updated:   '2026-02-15',
    lastReply: 'Support Team',
    body:      'Progress was reset as requested.',
  },
]

const FAQ = [
  {
    id: 1,
    q: 'Why are some lessons locked?',
    a: 'Lessons lock when prerequisite modules are incomplete, or when your instructor has restricted access until a certain date. Check your class assignments for unlock conditions.',
  },
  {
    id: 2,
    q: 'How do I retake a test?',
    a: 'Test retakes must be approved by your instructor. Contact Capt. Rodriguez directly or submit a support ticket with the test name and your reason for requesting a retake.',
  },
  {
    id: 3,
    q: 'My VR headset is not being detected. What should I do?',
    a: 'Ensure the SeaFarer VR app is running on your host machine, the headset firmware is up to date, and both devices are on the same network. Restart the companion app and re-pair if needed.',
  },
  {
    id: 4,
    q: 'How is my overall progress calculated?',
    a: 'Progress is based on lessons marked complete divided by total lessons in the curriculum. Test grades are tracked separately and averaged independently.',
  },
  {
    id: 5,
    q: 'Can I change my class or enrol in multiple classes?',
    a: 'Class enrolment is managed by your institution. Contact your programme coordinator or submit an Account ticket to request a class change.',
  },
]

const CATEGORIES = ['Technical', 'Access', 'Account', 'Hardware', 'Other']

const STATUS_META = {
  open:     { label: 'Open',     cls: 'status--open'     },
  pending:  { label: 'Pending',  cls: 'status--pending'  },
  resolved: { label: 'Resolved', cls: 'status--resolved' },
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Support() {
  const navigate = useNavigate()

  // New ticket form
  const [subject,  setSubject]  = useState('')
  const [category, setCategory] = useState('')
  const [body,     setBody]     = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState({})

  // FAQ accordion
  const [openFaq, setOpenFaq] = useState(null)

  // Ticket filter
  const [ticketFilter, setTicketFilter] = useState('all')

  function validate() {
    const e = {}
    if (!subject.trim())  e.subject  = 'Subject is required.'
    if (!category)        e.category = 'Select a category.'
    if (!body.trim())     e.body     = 'Please describe your issue.'
    return e
  }

  function handleSubmit(e) {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) { setErrors(e2); return }
    setErrors({})
    setSubmitted(true)
    setSubject(''); setCategory(''); setBody('')
  }

  const filteredTickets =
    ticketFilter === 'all'
      ? MY_TICKETS
      : MY_TICKETS.filter(t => t.status === ticketFilter)

  const openCount     = MY_TICKETS.filter(t => t.status === 'open').length
  const pendingCount  = MY_TICKETS.filter(t => t.status === 'pending').length

  return (
    <div className="support-page">
      <NavBar />

      {/* Header */}
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

      {/* Content */}
      <div className="support-content">

        <div className="support-grid">

          {/* LEFT: New ticket + My tickets */}
          <div className="support-left-col">

            {/* New ticket form */}
            <section className="support-section">
              <div className="section-head">
                <span className="section-title">Submit a Ticket</span>
              </div>

              {submitted ? (
                <div className="ticket-success">
                  <div className="ticket-success-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <div className="ticket-success-body">
                    <span className="ticket-success-title">Ticket submitted</span>
                    <span className="ticket-success-sub">We'll respond within 1–2 business days. Check My Tickets for updates.</span>
                  </div>
                  <button className="ticket-success-reset" onClick={() => setSubmitted(false)}>
                    New ticket
                  </button>
                </div>
              ) : (
                <form className="ticket-form" onSubmit={handleSubmit} noValidate>

                  <div className={`form-field ${errors.subject ? 'form-field--error' : ''}`}>
                    <label className="form-label">Subject</label>
                    <input
                      className="form-input"
                      type="text"
                      placeholder="Briefly describe your issue"
                      value={subject}
                      onChange={e => { setSubject(e.target.value); setErrors(v => ({ ...v, subject: '' })) }}
                    />
                    {errors.subject && <span className="form-error">{errors.subject}</span>}
                  </div>

                  <div className={`form-field ${errors.category ? 'form-field--error' : ''}`}>
                    <label className="form-label">Category</label>
                    <div className="category-grid">
                      {CATEGORIES.map(cat => (
                        <button
                          key={cat}
                          type="button"
                          className={`category-chip ${category === cat ? 'category-chip--active' : ''}`}
                          onClick={() => { setCategory(cat); setErrors(v => ({ ...v, category: '' })) }}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                    {errors.category && <span className="form-error">{errors.category}</span>}
                  </div>

                  <div className={`form-field ${errors.body ? 'form-field--error' : ''}`}>
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-textarea"
                      placeholder="Describe your issue in detail. Include any error messages or steps to reproduce."
                      rows={5}
                      value={body}
                      onChange={e => { setBody(e.target.value); setErrors(v => ({ ...v, body: '' })) }}
                    />
                    {errors.body && <span className="form-error">{errors.body}</span>}
                  </div>

                  <button type="submit" className="submit-btn">
                    Submit Ticket
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"/>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                  </button>

                </form>
              )}
            </section>

            {/* My tickets */}
            <section className="support-section">
              <div className="section-head">
                <span className="section-title">My Tickets</span>
                {(openCount > 0 || pendingCount > 0) && (
                  <span className="tickets-alert">
                    {openCount + pendingCount} active
                  </span>
                )}
                <div className="ticket-filter">
                  {[
                    { id: 'all',      label: 'All'      },
                    { id: 'open',     label: 'Open'     },
                    { id: 'pending',  label: 'Pending'  },
                    { id: 'resolved', label: 'Resolved' },
                  ].map(f => (
                    <button
                      key={f.id}
                      className={`ticket-filter-btn ${ticketFilter === f.id ? 'ticket-filter-btn--active' : ''}`}
                      onClick={() => setTicketFilter(f.id)}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {filteredTickets.length === 0 ? (
                <p className="support-empty">No tickets in this category.</p>
              ) : (
                <div className="tickets-list">
                  {filteredTickets.map((ticket, i) => {
                    const meta = STATUS_META[ticket.status]
                    return (
                      <div
                        key={ticket.id}
                        className="ticket-row"
                        style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
                      >
                        <div className="ticket-row-top">
                          <span className="ticket-id">{ticket.id}</span>
                          <span className="ticket-subject">{ticket.subject}</span>
                          <span className={`ticket-status ${meta.cls}`}>{meta.label}</span>
                        </div>
                        <div className="ticket-row-meta">
                          <span className="ticket-cat">{ticket.category}</span>
                          <span className="ticket-sep">·</span>
                          <span className="ticket-date">Updated {formatDate(ticket.updated)}</span>
                          <span className="ticket-sep">·</span>
                          <span className="ticket-reply">Last reply: {ticket.lastReply}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

          </div>

          {/* RIGHT: FAQ + Contact */}
          <div className="support-right-col">

            {/* FAQ */}
            <section className="support-section">
              <div className="section-head">
                <span className="section-title">FAQ</span>
              </div>
              <div className="faq-list">
                {FAQ.map((item, i) => (
                  <div
                    key={item.id}
                    className={`faq-item ${openFaq === item.id ? 'faq-item--open' : ''}`}
                    style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
                  >
                    <button
                      className="faq-q"
                      onClick={() => setOpenFaq(openFaq === item.id ? null : item.id)}
                      aria-expanded={openFaq === item.id}
                    >
                      <span>{item.q}</span>
                      <svg
                        className="faq-chevron"
                        width="14" height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </button>
                    {openFaq === item.id && (
                      <p className="faq-a">{item.a}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Contact */}
            <section className="support-section support-section--contact">
              <div className="section-head">
                <span className="section-title">Contact</span>
              </div>
              <div className="contact-list">
                <div className="contact-row">
                  <div className="contact-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </div>
                  <div className="contact-body">
                    <span className="contact-label">Email</span>
                    <span className="contact-value">support@seafarer.academy</span>
                  </div>
                </div>
                <div className="contact-row">
                  <div className="contact-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </div>
                  <div className="contact-body">
                    <span className="contact-label">Response time</span>
                    <span className="contact-value">1–2 business days</span>
                  </div>
                </div>
                <div className="contact-row">
                  <div className="contact-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.58 1.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 15z"/>
                    </svg>
                  </div>
                  <div className="contact-body">
                    <span className="contact-label">Phone</span>
                    <span className="contact-value">+1 (800) 732-2933</span>
                  </div>
                </div>
                <div className="contact-row">
                  <div className="contact-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                  </div>
                  <div className="contact-body">
                    <span className="contact-label">Live chat</span>
                    <span className="contact-value">Weekdays 09:00 – 17:00 UTC</span>
                  </div>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}
