import { PANEL_TYPES } from '../../../pages/trainer/testBuilderMock'

export default function AddPanelForm({
  addingPanel,
  newPanelType,
  newPanelTitle,
  saving,
  onStart,
  onCancel,
  onTypeChange,
  onTitleChange,
  onSubmit,
}) {
  if (!addingPanel) {
    return (
      <button className="tb-add-q-trigger" onClick={onStart}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Add Panel
      </button>
    )
  }

  return (
    <div className="tb-add-q-panel">
      <span className="tb-add-q-label">Panel type</span>
      <div className="tb-q-type-picker">
        {PANEL_TYPES.map(t => (
          <button
            key={t.id}
            className={`tb-q-type-btn ${newPanelType === t.id ? 'tb-q-type-btn--active' : ''}`}
            onClick={() => onTypeChange(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <input
        className="tb-meta-input"
        value={newPanelTitle}
        onChange={e => onTitleChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onSubmit()}
        placeholder="Panel title…"
        autoFocus
        style={{ marginTop: 8 }}
      />
      <div className="tb-add-q-actions">
        <button className="tb-add-q-cancel" onClick={onCancel}>
          Cancel
        </button>
        <button
          className="tb-add-q-confirm"
          onClick={onSubmit}
          disabled={!newPanelTitle.trim() || saving}
        >
          Add Panel
        </button>
      </div>
    </div>
  )
}
