import { useState } from 'react'
import '../../css/teacher/support/TicketForm.css'

const CATEGORIES = ['Technical', 'Access', 'Account', 'Hardware', 'Other']

export default function TicketForm({ onSubmit }) {
  const [subject,   setSubject]   = useState('')
  const [category,  setCategory]  = useState('')
  const [body,      setBody]      = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [errors,    setErrors]    = useState({})

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
    onSubmit({ subject: subject.trim(), category, description: body.trim() })
    setSubmitted(true)
    setSubject(''); setCategory(''); setBody('')
  }

  return (
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
  )
}
