import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '../../components/teacher/NavBar'
import '../css/teacher/Support.css'

// ─── Data ─────────────────────────────────────────────────────────────────
const MY_TICKETS = [
  {
    id: 'TK-008',
    subject:  'Student cannot see published course',
    category: 'Platform',
    status:   'open',
    created:  '2026-03-26',
    updated:  '2026-03-28',
    lastReply: 'Support Team',
  },
  {
    id: 'TK-007',
    subject:  'Grade export not generating CSV correctly',
    category: 'Technical',
    status:   'pending',
    created:  '2026-03-20',
    updated:  '2026-03-22',
    lastReply: 'Support Team',
  },
  {
    id: 'TK-006',
    subject:  'VR scenario stuck on loading screen',
    category: 'Hardware',
    status:   'pending',
    created:  '2026-03-14',
    updated:  '2026-03-16',
    lastReply: 'Support Team',
  },
  {
    id: 'TK-005',
    subject:  'Request to add new lesson to content library',
    category: 'Content',
    status:   'resolved',
    created:  '2026-02-28',
    updated:  '2026-03-02',
    lastReply: 'Support Team',
  },
  {
    id: 'TK-004',
    subject:  'Student enrolment limit for class MN-2024-A',
    category: 'Account',
    status:   'resolved',
    created:  '2026-02-10',
    updated:  '2026-02-11',
    lastReply: 'Support Team',
  },
]

const FAQ = [
  {
    id: 1,
    q: 'How do I enrol students into my class?',
    a: 'Navigate to My Classes, open the class detail page, and click "Enrol Student" on the Students tab. You can add students individually by email. Bulk enrolment via CSV upload is available — contact support if you need that template.',
  },
  {
    id: 2,
    q: 'Why is my published course not visible to students?',
    a: 'Ensure the course is assigned to a class and the class status is Active. Published courses are only visible to students enrolled in the assigned class. Check the Course Builder to confirm the class assignment is saved.',
  },
  {
    id: 3,
    q: 'How do I allow a student to retake a test?',
    a: "Open the Test Builder, select the test, and in the student submissions view you can reset a specific student's attempt. This unlocks a fresh attempt for that student only.",
  },
  {
    id: 4,
    q: 'Can I reorder lessons in a course after publishing?',
    a: 'Yes. Open the Course Builder, reorder the lessons using the up/down arrows, then re-publish. Existing student progress is preserved — only the order they see new incomplete lessons is affected.',
  },
  {
    id: 5,
    q: 'How do I export student grades?',
    a: 'On the Student Progress page, use the Export button (top right) to download a CSV of all grades for the selected class and date range. If you encounter issues, submit a Technical ticket.',
  },
  {
    id: 6,
    q: "A student's VR headset cannot connect to my session. What should I check?",
    a: "Ensure both the instructor station and the student's headset are on the same local network segment. Restart the SeaFarer Companion app on both devices. If the issue persists, submit a Hardware ticket with the headset serial number.",
  },
]

const CATEGORIES = ['Technical', 'Platform', 'Content', 'Hardware', 'Account', 'Other']

const STATUS_META = {
  open:     { label: 'Open',     cls: 'ts-status--open'     },
  pending:  { label: 'Pending',  cls: 'ts-status--pending'  },
  resolved: { label: 'Resolved', cls: 'ts-status--resolved' },
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ─── Component ────────────────────────────────────────────────────────────
export default function Support() {
  const navigate = useNavigate()

  const [subject,   setSubject]   = useState('')
  const [category,  setCategory]  = useState('')
  const [body,      setBody]      = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [errors,    setErrors]    = useState({})

  const [openFaq,      setOpenFaq]      = useState(null)
  const [ticketFilter, setTicketFilter] = useState('all')

  function validate() {
    const e = {}
    if (!subject.trim()) e.subject  = 'Subject is required.'
    if (!category)       e.category = 'Select a category.'
    if (!body.trim())    e.body     = 'Please describe your issue.'
    return e
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setSubmitted(true)
    setSubject(''); setCategory(''); setBody('')
  }

  const filtered =
    ticketFilter === 'all'
      ? MY_TICKETS
      : MY_TICKETS.filter(t => t.status === ticketFilter)

  const activeCount = MY_TICKETS.filter(t => t.status !== 'resolved').length

  return (
    <div className="ts-page">
      <NavBar />

      {/* ─── Header ─────────────────────────────────────────────────────── */}
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

      {/* ─── Content ────────────────────────────────────────────────────── */}
      <div className="ts-content">
        <div className="ts-grid">

          {/* LEFT: new ticket + my tickets */}
          <div className="ts-col">

            {/* Submit ticket */}
            <section className="ts-section" style={{ animationDelay: '0s' }}>
              <div className="ts-section-head">
                <span className="ts-section-title">Submit a Ticket</span>
              </div>

              {submitted ? (
                <div className="ts-success">
                  <div className="ts-success-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <div className="ts-success-body">
                    <span className="ts-success-title">Ticket submitted</span>
                    <span className="ts-success-sub">We'll respond within 1-2 business days.</span>
                  </div>
                  <button className="ts-success-reset" onClick={() => setSubmitted(false)}>
                    New ticket
                  </button>
                </div>
              ) : (
                <form className="ts-form" onSubmit={handleSubmit} noValidate>

                  <div className={`ts-field ${errors.subject ? 'ts-field--error' : ''}`}>
                    <label className="ts-label">Subject</label>
                    <input
                      className="ts-input"
                      type="text"
                      placeholder="Briefly describe your issue"
                      value={subject}
                      onChange={e => { setSubject(e.target.value); setErrors(v => ({ ...v, subject: '' })) }}
                    />
                    {errors.subject && <span className="ts-error">{errors.subject}</span>}
                  </div>

                  <div className={`ts-field ${errors.category ? 'ts-field--error' : ''}`}>
                    <label className="ts-label">Category</label>
                    <div className="ts-cat-grid">
                      {CATEGORIES.map(cat => (
                        <button
                          key={cat}
                          type="button"
                          className={`ts-cat-chip ${category === cat ? 'ts-cat-chip--active' : ''}`}
                          onClick={() => { setCategory(cat); setErrors(v => ({ ...v, category: '' })) }}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                    {errors.category && <span className="ts-error">{errors.category}</span>}
                  </div>

                  <div className={`ts-field ${errors.body ? 'ts-field--error' : ''}`}>
                    <label className="ts-label">Description</label>
                    <textarea
                      className="ts-textarea"
                      rows={5}
                      placeholder="Describe your issue in detail. Include any error messages, affected student IDs, or steps to reproduce."
                      value={body}
                      onChange={e => { setBody(e.target.value); setErrors(v => ({ ...v, body: '' })) }}
                    />
                    {errors.body && <span className="ts-error">{errors.body}</span>}
                  </div>

                  <button type="submit" className="ts-submit-btn">
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
            <section className="ts-section" style={{ animationDelay: '0.06s' }}>
              <div className="ts-section-head">
                <span className="ts-section-title">My Tickets</span>
                {activeCount > 0 && (
                  <span className="ts-active-badge">{activeCount} active</span>
                )}
                <div className="ts-filter">
                  {[
                    { id: 'all',      label: 'All'      },
                    { id: 'open',     label: 'Open'     },
                    { id: 'pending',  label: 'Pending'  },
                    { id: 'resolved', label: 'Resolved' },
                  ].map(f => (
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
                    const meta = STATUS_META[ticket.status]
                    return (
                      <div
                        key={ticket.id}
                        className="ts-ticket-row"
                        style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
                      >
                        <div className="ts-ticket-top">
                          <span className="ts-ticket-id">{ticket.id}</span>
                          <span className="ts-ticket-subject">{ticket.subject}</span>
                          <span className={`ts-ticket-status ${meta.cls}`}>{meta.label}</span>
                        </div>
                        <div className="ts-ticket-meta">
                          <span className="ts-ticket-cat">{ticket.category}</span>
                          <span className="ts-ticket-sep">·</span>
                          <span className="ts-ticket-date">Updated {formatDate(ticket.updated)}</span>
                          <span className="ts-ticket-sep">·</span>
                          <span className="ts-ticket-reply">Last reply: {ticket.lastReply}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

          </div>

          {/* RIGHT: FAQ + contact */}
          <div className="ts-col">

            {/* FAQ */}
            <section className="ts-section" style={{ animationDelay: '0.03s' }}>
              <div className="ts-section-head">
                <span className="ts-section-title">FAQ</span>
              </div>
              <div className="ts-faq-list">
                {FAQ.map((item, i) => (
                  <div
                    key={item.id}
                    className={`ts-faq-item ${openFaq === item.id ? 'ts-faq-item--open' : ''}`}
                    style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
                  >
                    <button
                      className="ts-faq-q"
                      onClick={() => setOpenFaq(openFaq === item.id ? null : item.id)}
                    >
                      <span>{item.q}</span>
                      <svg
                        className="ts-faq-chevron"
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
                      <p className="ts-faq-a">{item.a}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Contact */}
            <section className="ts-section" style={{ animationDelay: '0.09s' }}>
              <div className="ts-section-head">
                <span className="ts-section-title">Contact</span>
              </div>
              <div className="ts-contact-list">
                {[
                  {
                    icon: (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                    ),
                    label: 'Instructor support',
                    value: 'instructors@seafarer.academy',
                  },
                  {
                    icon: (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                    ),
                    label: 'Response time',
                    value: '1-2 business days',
                  },
                  {
                    icon: (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.58 1.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 15z"/>
                      </svg>
                    ),
                    label: 'Instructor hotline',
                    value: '+1 (800) 732-2940',
                  },
                  {
                    icon: (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                    ),
                    label: 'Live chat',
                    value: 'Weekdays 08:00 - 18:00 UTC',
                  },
                ].map((item, i) => (
                  <div key={i} className="ts-contact-row">
                    <div className="ts-contact-icon">{item.icon}</div>
                    <div className="ts-contact-body">
                      <span className="ts-contact-label">{item.label}</span>
                      <span className="ts-contact-value">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}
