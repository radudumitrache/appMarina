import '../../css/shared/media/MediaSidebar.css'

export default function MediaSidebar({ folders, activeId, onSelect, className = '' }) {
  return (
    <aside className={`media-sidebar${className ? ` ${className}` : ''}`}>
      <p className="media-sidebar-heading">Location</p>
      <ul className="media-sidebar-list">
        {folders.map(f => (
          <li key={f.id}>
            <button
              className={`media-sidebar-item ${activeId === f.id ? 'media-sidebar-item--active' : ''}`}
              onClick={() => onSelect(f.id)}
            >
              <span className="media-sidebar-label">{f.label}</span>
              <span className="media-sidebar-meta">
                {f.readOnly && <span className="media-sidebar-ro">read-only</span>}
                <span className="media-sidebar-count">{f.count}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  )
}
