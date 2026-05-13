import { useEffect, useState } from 'react'
import { usePageTransition } from '../../context/TransitionContext'
import '../css/landing/LandingNav.css'

const preloadLogin = () => import('../../pages/Login')

export default function LandingNav() {
  const { transitionTo } = usePageTransition()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`landing-nav${scrolled ? ' scrolled' : ''}`}>
      <span className="landing-wordmark">HANSA360</span>
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
