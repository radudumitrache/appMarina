import '../../css/crew/module-reader/VRPanel.css'
import VRViewer from '../../shared/VRViewer'
import RichContent from '../../shared/RichContent'
import { resolveSceneUrl } from '../../shared/VRSceneRenderer'

function AnchorPopup({ anchor, onClose }) {
  if (!anchor) return null
  const body = anchor.description ?? anchor.content ?? ''
  const docs = anchor.documents ?? []
  return (
    <aside className="lr-anchor-popup">
      <div className="lr-anchor-header">
        <h3 className="lr-anchor-title">{anchor.title}</h3>
        <button className="lr-anchor-close" onClick={onClose} aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div className="lr-anchor-divider" />
      <RichContent className="lr-anchor-body lr-prose" html={body} />
      {docs.length > 0 && (
        <div className="lr-anchor-docs">
          <div className="lr-anchor-docs-label">Attachments</div>
          <ul className="lr-anchor-docs-list">
            {docs.map(doc => (
              <li key={doc.id} className="lr-anchor-doc-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="lr-anchor-doc-icon">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                <span className="lr-anchor-doc-name" title={doc.name}>{doc.name}</span>
                <div className="lr-anchor-doc-actions">
                  {doc.mime_type === 'application/pdf' ? (
                    <a href={doc.download_url} target="_blank" rel="noreferrer" className="lr-anchor-doc-btn" title="Open in new tab">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15 3 21 3 21 9"/>
                        <line x1="10" y1="14" x2="21" y2="3"/>
                      </svg>
                    </a>
                  ) : (
                    <a href={doc.download_url} download={doc.name} className="lr-anchor-doc-btn" title="Download">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  )
}

function PanelDocuments({ documents }) {
  if (!documents?.length) return null
  return (
    <div className="lr-vr-panel-docs">
      <div className="lr-vr-panel-docs-label">Panel Documents</div>
      <ul className="lr-vr-panel-docs-list">
        {documents.map(doc => (
          <li key={doc.id} className="lr-vr-panel-doc-item">
            <span className="lr-vr-panel-doc-name" title={doc.name}>{doc.name}</span>
            <div className="lr-vr-panel-doc-actions">
              {doc.mime_type === 'application/pdf' ? (
                <a href={doc.download_url} target="_blank" rel="noreferrer" className="lr-vr-panel-doc-btn" title="Open">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/>
                    <line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                </a>
              ) : (
                <a href={doc.download_url} download={doc.name} className="lr-vr-panel-doc-btn" title="Download">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function VRPanel({ activeTour, hotspots, polygonAnchors, panel, panels, panelIdx, onPanelChange, anchor, onAnchorClose, visitedAnchors = 0, totalAnchors = 0, initialLon = 0, initialLat = 0 }) {
  return (
    <div className="lr-vr-wrap">
      <div className="lr-vr-scene">
        <VRViewer src={resolveSceneUrl(activeTour?.scene_url)} hotspots={hotspots} polygonAnchors={polygonAnchors} initialLon={initialLon} initialLat={initialLat} />

        <div className="lr-vr-label">
          <span className="lr-vr-tag">360°</span>
          {panel.title}
        </div>

        {totalAnchors > 0 && (
          <div className="lr-anchor-counter">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            {visitedAnchors} / {totalAnchors} explored
          </div>
        )}

        {!anchor && (
          <div className="lr-vr-hint">Drag to look around · Scroll to zoom</div>
        )}

        <PanelDocuments documents={panel.documents} />

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

      <AnchorPopup anchor={anchor} onClose={onAnchorClose} />
    </div>
  )
}
