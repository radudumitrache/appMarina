import '../../css/teacher/course-builder/EditorHeader.css'

export default function EditorHeader({
  selected,
  onTitleChange,
  onDescChange,
  onToggleStatus,
  onNavigateDashboard,
}) {
  return (
    <div className="cb-editor-header">
      <div className="cb-editor-header-left">
        <button className="cb-crumb-link" onClick={onNavigateDashboard}>
          Dashboard /
        </button>
        <input
          className="cb-title-input"
          value={selected.title}
          onChange={e => onTitleChange(selected.id, e.target.value)}
          placeholder="Course title…"
        />
        <input
          className="cb-desc-input"
          value={selected.description ?? ''}
          onChange={e => onDescChange(selected.id, e.target.value)}
          placeholder="Short description…"
        />
      </div>
      <div className="cb-editor-header-right">
        <span className={`cb-status-badge ${selected.status === 'published' ? 'cb-status--published' : 'cb-status--draft'}`}>
          {selected.status === 'published' ? 'Published' : 'Draft'}
        </span>
        <button className="cb-toggle-btn" onClick={() => onToggleStatus(selected.id)}>
          {selected.status === 'draft' ? 'Publish' : 'Unpublish'}
        </button>
      </div>
    </div>
  )
}
