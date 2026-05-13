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
        <p className="section-sub">
          Contact us to schedule a demo or request institutional access for your maritime academy.
        </p>

        {sent ? (
          <div className="contact-success">
            <svg className="contact-success-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <path d="m9 11 3 3L22 4"/>
            </svg>
            <p className="contact-success-title">Message Sent</p>
            <p className="contact-success-sub">We'll be in touch within 1–2 business days.</p>
          </div>
        ) : (
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-field">
                <label className="form-label">Institution</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Maritime Academy of Indonesia"
                  autoComplete="organization"
                  value={inst}
                  onChange={e => setInst(e.target.value)}
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
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="form-field">
              <label className="form-label">Message</label>
              <textarea
                className="form-textarea"
                placeholder="Tell us about your training requirements, fleet size, and cadet intake..."
                rows={4}
                value={msg}
                onChange={e => setMsg(e.target.value)}
              />
            </div>
            <button type="submit" className="form-submit">
              Send Message
            </button>
          </form>
        )}
      </div>

      <footer className="landing-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <span className="footer-wordmark">HANSA360</span>
            <p className="footer-tagline">Maritime VR Training Platform</p>
            <p className="footer-desc">
              Immersive bridge simulations built to IMO standards — for the next generation of seafarers.
            </p>
          </div>

          <div className="footer-links-group">
            <span className="footer-group-label">Platform</span>
            <nav className="footer-links">
              <a href="#features">Capabilities</a>
              <a href="#how-it-works">How It Works</a>
              <a href="#why-vr">Why VR</a>
              <a href="#timeline">The Journey</a>
            </nav>
          </div>

          <div className="footer-links-group">
            <span className="footer-group-label">Company</span>
            <nav className="footer-links">
              <a href="#contact">Contact</a>
              <a href="#contact">Request a Demo</a>
              <a href="#contact">Partner Academies</a>
            </nav>
          </div>

          <div className="footer-links-group">
            <span className="footer-group-label">Compliance</span>
            <nav className="footer-links">
              <a href="#features">IMO Standards</a>
              <a href="#features">STCW Framework</a>
              <a href="#features">Certification</a>
            </nav>
          </div>
        </div>

        <div className="footer-bottom">
          <span className="footer-copy">
            © {new Date().getFullYear()} GXC Maritime. All rights reserved.
          </span>
          <div className="footer-legal">
            <a href="#contact">Privacy Policy</a>
            <span className="footer-dot" />
            <a href="#contact">Terms of Service</a>
          </div>
        </div>
      </footer>
    </section>
  )
}
