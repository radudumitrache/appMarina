import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import '../css/landing/TimelineSection.css'

import seaToFrontVid from '../../../new videos/shipInTheSeaToshipFromTheFront.mp4'
import frontToIntVid from '../../../new videos/shipFromTheFrontToshipInterior.mp4'
import seaToPortVid  from '../../../new videos/shipInTheSeaToshipInThePort.mp4'

import seaImg      from '../../../new videos/shipInTheSea.png'
import frontImg    from '../../../new videos/shipFromTheFront.png'
import interiorImg from '../../../new videos/shipInterior.png'
import portImg     from '../../../new videos/shipInThePort.png'
import vrImg       from '../../../new videos/vrHeadset.png'

const PANELS = [
  { num: '01', title: 'Open Ocean Navigation', desc: 'Master celestial and electronic navigation across open sea conditions, including ECDIS, chart work, and meteorology.',         image: seaImg,      video: null },
  { num: '02', title: 'Vessel Identification',  desc: 'Close-quarters recognition of vessel types, running lights, day shapes, and sound signals under the COLREGs.',              image: frontImg,    video: seaToFrontVid },
  { num: '03', title: 'Bridge Operations',      desc: 'Full bridge resource management — radar, ECDIS, VDR, and AIS systems operated under realistic traffic scenarios.',          image: interiorImg, video: frontToIntVid },
  { num: '04', title: 'Port Maneuvering',       desc: 'Controlled berthing, cargo handling, port communication protocols, and emergency mooring procedures.',                      image: portImg,     video: seaToPortVid },
  { num: '05', title: 'VR Certification',       desc: 'Standardised assessments recognised by maritime authorities worldwide — from cadet to officer qualification.',              image: vrImg,       video: null },
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
