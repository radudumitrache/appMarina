import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import FeatureCard from './FeatureCard'
import '../css/landing/FeaturesSection.css'

const FEATURES = [
  {
    title: 'Immersive 360 training',
    body:  'One platform. 360° fleet readiness. Empower your teams with immersive, department specific training build to elevate standard operations into exceptional maritime performance',
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
    title: 'Adaptive Learning Paths ',
    body:  "Gaining full control over the learning speed allows crew members to develop a deeper understanding and build far stronger knowledge retention",
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
    title: 'Scenario-Based Evaluation ',
    body:  "From ‘Fill-in-the-Gap’ technical terms to ‘Spot the Asset’ drills, we ensure you aren’t just passing a test - you are learning the vessel.",
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
        <h2 className="section-title">Why Hansa360</h2>
        <p className="section-sub">
          Crew familiarization is often challenging when training begins only
          after boarding the vessel. 
        </p>
      </div>

      <div className="features-grid">
        {FEATURES.map((f, i) => (
          <div
            key={i}
            className="card-outer"
            ref={(el) => {
              animRefs.current[i] = el;
            }}
          >
            <FeatureCard title={f.title} body={f.body} icon={f.icon} />
          </div>
        ))}
      </div>
    </section>
  );
}
