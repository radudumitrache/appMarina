import '../../css/student/lesson-reader/TextPanel.css'

export default function TextPanel({ panel, panels, panelIdx, onPanelChange }) {
  return (
    <div className="lr-text-layout">
      <aside className="lr-text-sidebar">
        <div className="lr-sidebar-label">Panels</div>
        <nav className="lr-sidebar-nav">
          {panels.map((p, i) => (
            <button
              key={p.id}
              className={`lr-sidebar-btn ${i === panelIdx ? 'lr-sidebar-btn--active' : ''}`}
              onClick={() => onPanelChange(i)}
            >
              <span className="lr-sidebar-num">{String(i + 1).padStart(2, '0')}</span>
              <div className="lr-sidebar-meta">
                <span className="lr-sidebar-name">{p.title}</span>
                <span className="lr-sidebar-kind">
                  {p.type === 'vr_tour' ? '360° Tour' : 'Text'}
                </span>
              </div>
            </button>
          ))}
        </nav>
      </aside>

      <main className="lr-text-main">
        <h1 className="lr-text-heading">{panel.title}</h1>
        <div className="lr-text-body">
          {panel.text_content?.body ?? ''}
        </div>
      </main>
    </div>
  )
}
