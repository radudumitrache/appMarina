import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import '../css/landing/WhyVRSection.css'

const BENEFITS = [
  {
    title: 'Zero Risk',
    desc: 'Train through emergencies, collisions, and extreme weather — with no crew, no vessel, and no consequence.',
  },
  {
    title: 'Infinite Repetition',
    desc: 'Every cadet repeats a maneuver until it is perfect. No fuel cost, no vessel scheduling, no waiting.',
  },
  {
    title: 'Real-Time Insight',
    desc: 'Instructors see every decision the moment it happens. Gap analysis replaces post-hoc debriefs.',
  },
  {
    title: 'Deploy Anywhere',
    desc: 'A headset and an internet connection. No vessel, no port, no travel budget required.',
  },
]

export default function WhyVRSection() {
  const sectionRef = useRef(null)
  const leftRef    = useRef(null)
  const rightRefs  = useRef([])

  useLayoutEffect(() => {
    const benefits = rightRefs.current.filter(Boolean)
    const ctx = gsap.context(() => {
      gsap.set(leftRef.current, { opacity: 0, x: -24 })
      gsap.set(benefits, { opacity: 0, y: 20 })

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 75%',
        once: true,
        onEnter: () => {
          gsap.to(leftRef.current, {
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: 'power3.out',
          })
          gsap.to(benefits, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: 'power3.out',
            stagger: 0.12,
            delay: 0.15,
          })
        },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section className="whyvr-section" id="why-vr" ref={sectionRef}>
      <div className="whyvr-inner">
        <div className="whyvr-left" ref={leftRef}>
          <span className="section-tag">THE ADVANTAGE</span>
          <h2 className="whyvr-statement">
            Traditional maritime training is expensive, logistically complex, and impossible to repeat safely.
          </h2>
          <p className="whyvr-sub">
            SeaFarer removes every constraint. Train cadets through any scenario, any weather condition, any emergency — with zero risk to vessel or crew.
          </p>
        </div>

        <div className="whyvr-right">
          {BENEFITS.map((b, i) => (
            <div
              key={i}
              className="whyvr-benefit"
              ref={el => { rightRefs.current[i] = el }}
            >
              <div className="benefit-bar" aria-hidden="true" />
              <div className="benefit-content">
                <h3 className="benefit-title">{b.title}</h3>
                <p className="benefit-desc">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
