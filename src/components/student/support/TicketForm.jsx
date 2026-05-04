import '../../css/student/support/TicketForm.css'
import { useState } from 'react'

const CATEGORIES = ['Technical', 'Access', 'Account', 'Hardware', 'Other']

export default function TicketForm({ onSubmit }) {
  const [subject,   setSubject]   = useState('')
  const [category,  setCategory]  = useState('')
  const [body,      setBody]      = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [errors,    setErrors]    = useState({})

  function handleSubmit(e) {
    e.preventDefault()
    const errs = {}
    if (!subject.trim()) errs.subject  = 'Subject is required.'
    if (!category)       errs.category = 'Select a category.'
    if (!body.trim())    errs.body     = 'Please describe your issue.'
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    onSubmit({ subject: subject.trim(), category, description: body.trim() })
    setSubmitted(true)
    setSubject(''); setCategory(''); setBody('')
  }

  const clearError = (key) => () => setErrors(v => ({ ...v, [key]: '' }))

  return (
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
              onChange={e => { setSubject(e.target.value); clearError('subject')() }}
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
                  onClick={() => { setCategory(cat); clearError('category')() }}
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
              onChange={e => { setBody(e.target.value); clearError('body')() }}
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
  )
}
