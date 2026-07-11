import { useState } from 'react'
import Video360Viewer from '../../shared/Video360Viewer'
import '../../../components/css/crew/module-reader/Video360Panel.css'

export default function Video360Panel({ panel, panels, panelIdx, onPanelChange }) {
  const [viewerOpen, setViewerOpen] = useState(false)
  const videoUrl = panel.video_360?.media_file_url ?? null

  const kindLabel = p => {
    if (p.type === 'vr_tour')   return '360°'
    if (p.type === 'video_360') return 'VID'
    return 'TXT'
  }

  return (
    <div className="v360p-page">
      {/* Left sidebar: panel list */}
      <aside className="v360p-sidebar">
        <ul className="v360p-panel-list">
          {panels.map((p, i) => (
            <li key={p.id}>
              <button
                className={`v360p-panel-btn${i === panelIdx ? ' v360p-panel-btn--active' : ''}`}
                onClick={() => onPanelChange(i)}
              >
                <span className="v360p-panel-kind">{kindLabel(p)}</span>
                <span className="v360p-panel-name">{p.title}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Main: 360 video icon card */}
      <main className="v360p-main">
        <button
          className="v360p-card"
          onClick={() => videoUrl && setViewerOpen(true)}
          disabled={!videoUrl}
          title={videoUrl ? 'Open 360° Video' : 'No video attached'}
        >
          <div className="v360p-icon-wrap">
            <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M2 12h20"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            <div className="v360p-play-ring">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
            </div>
          </div>
          <h2 className="v360p-title">{panel.title}</h2>
          <p className="v360p-hint">
            {videoUrl ? 'Click to open 360° viewer' : 'No video attached to this panel'}
          </p>
        </button>
      </main>

      {viewerOpen && (
        <Video360Viewer
          src={videoUrl}
          onClose={() => setViewerOpen(false)}
        />
      )}
    </div>
  )
}
