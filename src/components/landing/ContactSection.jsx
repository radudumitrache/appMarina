import '../css/landing/ContactSection.css'

export default function ContactSection() {
  return (
    <section className="contact-section" id="contact">
      <div className="contact-inner">
        <span className="section-tag">GET IN TOUCH</span>
        <h2 className="section-title">Ready to train your crew?</h2>
        <p className="section-sub">
          Contact us to schedule a demo or request institutional access for your maritime academy.
        </p>

        <form className="contact-form" onSubmit={e => e.preventDefault()}>
          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Institution</label>
              <input
                type="text"
                className="form-input"
                placeholder="Maritime Academy of Indonesia"
                autoComplete="organization"
              />
            </div>
            <div className="form-field">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="training@academy.edu"
                autoComplete="email"
              />
            </div>
          </div>
          <div className="form-field">
            <label className="form-label">Message</label>
            <textarea
              className="form-textarea"
              placeholder="Tell us about your training requirements, fleet size, and cadet intake..."
              rows={4}
            />
          </div>
          <button type="submit" className="form-submit">
            Send Message
          </button>
        </form>
      </div>

      <footer className="landing-footer">
        <span className="footer-wordmark">SEAFARER</span>
        <span className="footer-copy">
          © {new Date().getFullYear()} GXC Maritime. All rights reserved.
        </span>
      </footer>
    </section>
  )
}
