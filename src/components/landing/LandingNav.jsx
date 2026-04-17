import { usePageTransition } from '../../context/TransitionContext'
import '../css/landing/LandingNav.css'

const preloadLogin = () => import('../../pages/Login')

export default function LandingNav() {
  const { transitionTo } = usePageTransition()

  return (
    <header className="landing-nav">
      <span className="landing-wordmark">SEAFARER</span>
      <nav className="landing-nav-links">
        <a href="#features">Platform</a>
        <a href="#timeline">Journey</a>
        <a href="#contact">Contact</a>
      </nav>
      <button
        className="landing-nav-cta"
        onClick={() => transitionTo('/login')}
        onMouseEnter={preloadLogin}
      >
        Sign In
      </button>
    </header>
  )
}
