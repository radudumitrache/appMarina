import { useState } from 'react'
import '../css/landing/ContactSection.css'

export default function ContactSection() {
  const [sent, setSent]   = useState(false)
  const [inst, setInst]   = useState('')
  const [email, setEmail] = useState('')
  const [msg, setMsg]     = useState('')

  const handleSubmit = e => {
    e.preventDefault()
    if (!inst.trim() || !email.trim()) return
    setSent(true)
  }

  return (
    <section className="contact-section" id="contact">
      <div className="contact-inner">
        <span className="section-tag">GET IN TOUCH</span>
        <h2 className="section-title">Ready to train your crew?</h2>
        <p className="section-sub">Contact us to schedule a demo</p>

        {sent ? (
          <div className="contact-success">
            <svg
              className="contact-success-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <path d="m9 11 3 3L22 4" />
            </svg>
            <p className="contact-success-title">Message Sent</p>
            <p className="contact-success-sub">
              We'll be in touch within 1–2 business days.
            </p>
          </div>
        ) : (
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-field">
                <label className="form-label">Organization</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Company name"
                  autoComplete="organization"
                  value={inst}
                  onChange={(e) => setInst(e.target.value)}
                  required
                />
              </div>
              <div className="form-field">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="training@academy.edu"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="form-field">
              <label className="form-label">Message</label>
              <textarea
                className="form-textarea"
                placeholder="Tell us about your training requirements and fleet size"
                rows={4}
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
              />
            </div>
            <button type="submit" className="form-submit">
              Send Message
            </button>
          </form>
        )}
      </div>

    </section>
  );
}
