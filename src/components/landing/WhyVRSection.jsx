import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import '../css/landing/WhyVRSection.css'

const BENEFITS = [
  {
    title: "1. Spatial Familiarity ",
    desc: "This spatial immersion allows officers and crew to memorize the exact layouts of specific spaces before they ever physically board the ship. ",
  },
  {
    title: "2. Contextual Memory ",
    desc: "Because the human brain is wired to remember where things happen better than what text it reads, learners anchor information to visual landmarks. ",
  },
  {
    title: "3. Interactive Control",
    desc: "The shift from a passive spectator viewing a 360° image to an active participant who must make choices, find hidden details, and trigger consequences.",
  },
  {
    title: "4. Lower Cognitive Load ",
    desc: "Because the digital environment matches real world scale, depth, and perspective, the brain processes the information naturally and effortlessly",
  },
];

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
            Zero travel. Zero risk. Total compliance.
          </h2>
          <p className="whyvr-sub">
            Certify your crew to your precise company standards using immersive
            360 training that deploys in minutes.
          </p>
        </div>

        <div className="whyvr-right">
          {BENEFITS.map((b, i) => (
            <div
              key={i}
              className="whyvr-benefit"
              ref={(el) => {
                rightRefs.current[i] = el;
              }}
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
  );
}
