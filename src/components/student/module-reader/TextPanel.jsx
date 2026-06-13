import '../../css/student/module-reader/TextPanel.css'

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
        <div
          className="lr-text-body lr-prose"
          dangerouslySetInnerHTML={{ __html: panel.text_content?.body ?? '' }}
        />
        {panel.documents?.length > 0 && (
          <div className="lr-panel-docs">
            <div className="lr-panel-docs-label">Attachments</div>
            <ul className="lr-panel-docs-list">
              {panel.documents.map(doc => (
                <li key={doc.id} className="lr-panel-doc-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="lr-panel-doc-icon">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                  <span className="lr-panel-doc-name">{doc.name}</span>
                  {doc.size_bytes ? (
                    <span className="lr-panel-doc-size">
                      {doc.size_bytes < 1024 * 1024
                        ? `${(doc.size_bytes / 1024).toFixed(1)} KB`
                        : `${(doc.size_bytes / (1024 * 1024)).toFixed(1)} MB`}
                    </span>
                  ) : null}
                  <div className="lr-panel-doc-actions">
                    {doc.mime_type === 'application/pdf' ? (
                      <a href={doc.download_url} target="_blank" rel="noreferrer" className="lr-panel-doc-btn">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                          <polyline points="15 3 21 3 21 9"/>
                          <line x1="10" y1="14" x2="21" y2="3"/>
                        </svg>
                        Open
                      </a>
                    ) : (
                      <a href={doc.download_url} download={doc.name} className="lr-panel-doc-btn lr-panel-doc-btn--download">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="7 10 12 15 17 10"/>
                          <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        Download
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  )
}
