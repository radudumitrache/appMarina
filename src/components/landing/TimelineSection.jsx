import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import '../css/landing/TimelineSection.css'

const PANELS = [
  { num: '01', title: 'Open Ocean Navigation', desc: 'Master celestial and electronic navigation across open sea conditions, including ECDIS, chart work, and meteorology.',         image: '/shipInTheSea.png',      video: '/vid-open-ocean.mp4' },
  { num: '02', title: 'Vessel Identification',  desc: 'Close-quarters recognition of vessel types, running lights, day shapes, and sound signals under the COLREGs.',              image: '/shipFromTheFront.png',    video: '/vid-vessel-id.mp4' },
  { num: '03', title: 'Bridge Operations',      desc: 'Full bridge resource management — radar, ECDIS, VDR, and AIS systems operated under realistic traffic scenarios.',          image: '/shipInterior.png', video: '/vid-bridge-ops.mp4' },
  { num: '04', title: 'Port Maneuvering',       desc: 'Controlled berthing, cargo handling, port communication protocols, and emergency mooring procedures.',                      image: '/shipInThePort.png',     video: '/shipInTheSeaToshipInThePort.mp4' },
  { num: '05', title: 'VR Certification',       desc: 'Standardised assessments recognised by maritime authorities worldwide — from cadet to officer qualification.',              image: '/vrHeadset.png',       video: '/vid-vr-cert.mp4' },
]

export default function TimelineSection() {
  const wrapperRef = useRef(null)
  const trackRef   = useRef(null)

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current
    const track   = trackRef.current
    if (!wrapper || !track) return

    const id = setTimeout(() => {
      const scrollDist = track.scrollWidth - window.innerWidth

      const ctx = gsap.context(() => {
        gsap.to(track, {
          x: -scrollDist,
          ease: 'none',
          scrollTrigger: {
            trigger: wrapper,
            pin: true,
            scrub: 1.2,
            start: 'top top',
            end: () => `+=${scrollDist}`,
            invalidateOnRefresh: true,
          },
        })
      }, wrapper)

      wrapper._gsapCtx = ctx
    }, 100)

    return () => {
      clearTimeout(id)
      wrapper._gsapCtx?.revert()
    }
  }, [])

  return (
    <section className="timeline-outer" id="timeline" ref={wrapperRef}>
      <div className="timeline-track" ref={trackRef}>
        {PANELS.map((panel, i) => (
          <div className="timeline-panel" key={i}>
            <div className="panel-media">
              {panel.video && (
                <video
                  src={panel.video}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="none"
                  className="panel-video"
                />
              )}
              <img src={panel.image} alt={panel.title} className="panel-image" />
              <div className="panel-media-overlay" />
            </div>

            <div className="panel-info">
              <span className="panel-num">{panel.num}</span>
              <h3 className="panel-title">{panel.title}</h3>
              <p className="panel-desc">{panel.desc}</p>
            </div>

            {i === 0 && (
              <div className="drag-hint">
                <span className="drag-hint-arrow">→</span>
                <span className="drag-hint-text">DRAG TO EXPLORE</span>
              </div>
            )}

            <div className="panel-progress">
              {PANELS.map((_, j) => (
                <span key={j} className={`dot${j === i ? ' dot--active' : ''}`} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
