import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import '../css/landing/HowItWorksSection.css'

const STEPS = [
  {
    num: '01',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    title: 'Onboard',
    desc: 'Your institution is set up in minutes. Cadets enroll, and the syllabus maps automatically to STCW competency frameworks.',
  },
  {
    num: '02',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/>
        <path d="M8 21h8M12 17v4"/>
        <path d="m9 9 2 2 4-4"/>
      </svg>
    ),
    title: 'Train',
    desc: 'Cadets progress through immersive VR modules at their own pace. Instructors monitor every decision in real time through the platform dashboard.',
  },
  {
    num: '03',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <path d="m9 12 2 2 4-4"/>
      </svg>
    ),
    title: 'Certify',
    desc: 'Every simulation maps to IMO standards. Issue verifiable credentials recognised by maritime authorities worldwide — from cadet to officer.',
  },
]

export default function HowItWorksSection() {
  const sectionRef = useRef(null)
  const cardRefs   = useRef([])

  useLayoutEffect(() => {
    const cards = cardRefs.current.filter(Boolean)
    const ctx = gsap.context(() => {
      gsap.set(cards, { opacity: 0, y: 32 })
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          gsap.to(cards, {
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
    <section className="how-section" id="how-it-works" ref={sectionRef}>
      <div className="how-inner">
        <div className="section-header">
          <span className="section-tag">THE PROCESS</span>
          <h2 className="section-title">From Enrollment to Certification</h2>
          <p className="section-sub">
            A structured journey designed for maritime academies and their cadets — every step mapped to international standards.
          </p>
        </div>

        <div className="how-steps">
          <div className="how-connector" aria-hidden="true" />

          {STEPS.map((step, i) => (
            <div
              key={i}
              className="how-card"
              ref={el => { cardRefs.current[i] = el }}
            >
              <span className="how-num">{step.num}</span>
              <div className="how-icon">{step.icon}</div>
              <h3 className="how-title">{step.title}</h3>
              <p className="how-desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
