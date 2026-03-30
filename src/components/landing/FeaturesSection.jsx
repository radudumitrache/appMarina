import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import FeatureCard from './FeatureCard'
import '../css/landing/FeaturesSection.css'

const FEATURES = [
  {
    title: 'Immersive VR Simulations',
    body:  'Step onto the bridge of a real cargo vessel. Navigate maritime scenarios in photorealistic environments built to IMO standards, with full physics and weather.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="10" rx="2"/>
        <circle cx="8.5" cy="12" r="2"/>
        <circle cx="15.5" cy="12" r="2"/>
        <path d="M2 13l-1.5 3 3.5.5M22 13l1.5 3-3.5.5"/>
      </svg>
    ),
  },
  {
    title: 'Adaptive Learning Paths',
    body:  "AI-driven curriculum that adjusts in real time to each cadet's performance — identifying gaps before they become incidents at sea.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C9.5 2 7 4 7 7c0 2 1 3.5 2.5 4.5S12 13 12 15"/>
        <path d="M12 2c2.5 0 5 2 5 5 0 2-1 3.5-2.5 4.5S12 13 12 15"/>
        <path d="M12 15v7"/>
        <path d="M8 19h8"/>
        <circle cx="12" cy="8" r="1"/>
      </svg>
    ),
  },
  {
    title: 'Certified Assessment',
    body:  'Every simulation maps directly to STCW competency frameworks. Instructors get real-time analytics; cadets receive verifiable credentials.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <path d="m9 12 2 2 4-4"/>
      </svg>
    ),
  },
]

export default function FeaturesSection() {
  const sectionRef = useRef(null)
  const animRefs   = useRef([])

  useLayoutEffect(() => {
    const outers = animRefs.current.filter(Boolean)
    const ctx = gsap.context(() => {
      gsap.set(outers, { opacity: 0, y: 40 })

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          gsap.to(outers, {
            opacity: 1,
            y: 0,
            duration: 0.75,
            ease: 'power3.out',
            stagger: 0.15,
          })
        },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section className="features-section" id="features" ref={sectionRef}>
      <div className="section-header">
        <span className="section-tag">CAPABILITIES</span>
        <h2 className="section-title">Why SeaFarer</h2>
        <p className="section-sub">
          A full-stack training platform — from open-sea navigation to port operations —
          delivered through photorealistic VR.
        </p>
      </div>

      <div className="features-grid">
        {FEATURES.map((f, i) => (
          <div
            key={i}
            className="card-outer"
            ref={el => { animRefs.current[i] = el }}
          >
            <FeatureCard title={f.title} body={f.body} icon={f.icon} />
          </div>
        ))}
      </div>
    </section>
  )
}
