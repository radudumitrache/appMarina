import '../css/landing/TimelineSection.css'

const PANELS = [
  {
    num: '02',
    title: 'Pre Arrival Safety Training ',
    desc: 'An immersive module that ensures officers and crew are fully briefed on critical emergency procedures within a 360-degree environment, establishing vital safety compliance and situational readiness before they ever join the vessel',
    image: '/shipFromTheFront.png',
    video: '/vid-pre-arrival.mp4',
  },
  {
    num: '03',
    title: 'Bridge Familiarization',
    desc: "An interactive, 360-degree environment of the ship's bridge that allows officers to safely explore the workspace, master the exact placement of navigation consoles, and build spatial confidence before ever stepping on board. ",
    image: '/shipInterior.png',
    video: '/vid-bridge-ops.mp4',
  },
]

export default function TimelineSection() {
  return (
    <section id="timeline">
      {PANELS.map((panel, i) => (
        <div className="tl-panel" key={i}>
          <div className="tl-media">
            <video
              src={panel.video}
              autoPlay
              loop
              muted
              playsInline
              preload="none"
              className="tl-video"
            />
            <img src={panel.image} alt={panel.title} className="tl-image" />
            <div className="tl-overlay" />
          </div>
          <div className="tl-info">
            <span className="tl-info-rule" />
            <h3 className="tl-title">{panel.title}</h3>
            <p className="tl-desc">{panel.desc}</p>
          </div>
        </div>
      ))}
    </section>
  )
}
