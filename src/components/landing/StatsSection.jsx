import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import '../css/landing/StatsSection.css'

const STATS = [
  { value: '100+', label: 'Crew Trained' },
  { value: '1',     label: 'trusted company' },
  { value: '3',      label: 'Training Modules' },
  { value: '100%',   label: 'Compliant' },
]

export default function StatsSection() {
  const sectionRef = useRef(null)
  const itemRefs   = useRef([])

  useLayoutEffect(() => {
    const items = itemRefs.current.filter(Boolean)
    const ctx = gsap.context(() => {
      gsap.set(items, { opacity: 0, y: 20 })
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(items, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: 'power3.out',
            stagger: 0.1,
          })
        },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section className="stats-section" id="stats" ref={sectionRef}>
      <div className="stats-grid">
        {STATS.map((s, i) => (
          <div
            key={i}
            className="stat-item"
            ref={el => { itemRefs.current[i] = el }}
          >
            <span className="stat-value">{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
