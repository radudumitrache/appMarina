import '../css/landing/Footer.css'

export default function Footer() {
  return (
    <footer className="landing-footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <span className="footer-wordmark">HANSA360</span>
            <p className="footer-tagline">Maritime 360 Training Platform</p>
            <p className="footer-desc">
              Advanced 360° training environments engineered to prepare the next
              generation of seafarers
            </p>
          </div>

          <div className="footer-links-group">
            <span className="footer-group-label">Platform</span>
            <nav className="footer-links">
              <a href="#features">Capabilities</a>
              <a href="#how-it-works">How It Works</a>
              <a href="#why-vr">Why 360</a>
              <a href="#timeline">The Journey</a>
            </nav>
          </div>

          <div className="footer-links-group">
            <span className="footer-group-label">Company</span>
            <nav className="footer-links">
              <a href="#contact">Contact</a>
              <a href="#contact">Request a Demo</a>
              <a href="#stats">Trusted Companies</a>
            </nav>
          </div>

          <div className="footer-links-group">
            <span className="footer-group-label">Compliance</span>
            <nav className="footer-links">
              <a href="#features">Training</a>
              <a href="#features">Learning</a>
              <a href="#features">Evaluation</a>
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
      </div>
    </footer>
  );
}
