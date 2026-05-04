import '../../css/student/lesson-reader/VRPanel.css'
import VRViewer from '../../shared/VRViewer'

function AnchorPopup({ anchor, onClose }) {
  if (!anchor) return null
  const body = anchor.description ?? anchor.content ?? ''
  return (
    <aside className="lr-anchor-popup">
      <button className="lr-anchor-close" onClick={onClose} aria-label="Close">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      <h3 className="lr-anchor-title">{anchor.title}</h3>
      <div className="lr-anchor-divider" />
      <div className="lr-anchor-body" dangerouslySetInnerHTML={{ __html: body }} />
    </aside>
  )
}

export default function VRPanel({ activeTour, hotspots, polygonAnchors, panel, panels, panelIdx, onPanelChange, anchor, onAnchorClose }) {
  return (
    <div className="lr-vr-wrap">
      <VRViewer src={activeTour?.scene_url} hotspots={hotspots} polygonAnchors={polygonAnchors} />

      <div className="lr-vr-label">
        <span className="lr-vr-tag">360°</span>
        {panel.title}
      </div>

      {!anchor && (
        <div className="lr-vr-hint">Drag to look around · Scroll to zoom</div>
      )}

      <AnchorPopup anchor={anchor} onClose={onAnchorClose} />

      <div className="lr-vr-strip">
        {panels.map((p, i) => (
          <button
            key={p.id}
            className={`lr-strip-btn ${i === panelIdx ? 'lr-strip-btn--active' : ''}`}
            onClick={() => onPanelChange(i)}
          >
            <span className="lr-strip-type">{p.type === 'vr_tour' ? '360°' : 'TXT'}</span>
            <span className="lr-strip-name">{p.title}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
