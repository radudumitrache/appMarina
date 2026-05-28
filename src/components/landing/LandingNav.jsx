import { useEffect, useRef, useState } from 'react'
import { usePageTransition } from '../../context/TransitionContext'
import '../css/landing/LandingNav.css'

const preloadLogin = () => import('../../pages/Login')

export default function LandingNav() {
  const { transitionTo } = usePageTransition()
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  function closeAndGo(hash) {
    setMenuOpen(false)
    document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header className={`landing-nav${scrolled ? ' scrolled' : ''}`}>
      <span className="landing-wordmark">HANSA360</span>

      <nav ref={menuRef} className={`landing-nav-links${menuOpen ? ' landing-nav-links--open' : ''}`}>
        <a href="#features" onClick={() => closeAndGo('#features')}>Platform</a>
        <a href="#timeline" onClick={() => closeAndGo('#timeline')}>Journey</a>
        <a href="#contact"  onClick={() => closeAndGo('#contact')}>Contact</a>
        <button
          className="landing-nav-cta landing-nav-cta--mobile"
          onClick={() => { setMenuOpen(false); transitionTo('/login') }}
          onMouseEnter={preloadLogin}
        >
          Sign In
        </button>
      </nav>

      <button
        className="landing-nav-cta"
        onClick={() => transitionTo('/login')}
        onMouseEnter={preloadLogin}
      >
        Sign In
      </button>

      <button
        className="landing-hamburger"
        aria-label="Toggle menu"
        onClick={() => setMenuOpen(m => !m)}
      >
        {menuOpen ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        )}
      </button>
    </header>
  )
}
