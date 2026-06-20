import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { STATUS_META } from '../../../pages/trainer/testBuilderMock'
import '../../css/trainer/test-builder/TestEditorHeader.css'

export default function TestEditorHeader({ selected, onTitleBlur, onToggleStatus, saving }) {
  const navigate = useNavigate()
  const [localTitle, setLocalTitle] = useState(selected.title)

  useEffect(() => {
    setLocalTitle(selected.title)
  }, [selected.title])

  const meta = STATUS_META[selected.status] ?? STATUS_META.draft

  return (
    <div className="tb-editor-header">
      <div className="tb-editor-header-left">
        <button className="tb-crumb-link" onClick={() => navigate('/trainer/dashboard')}>
          Dashboard /
        </button>
        <input
          className="tb-title-input"
          value={localTitle}
          onChange={e => setLocalTitle(e.target.value)}
          onBlur={() => onTitleBlur(localTitle)}
          onKeyDown={e => e.key === 'Enter' && e.target.blur()}
          placeholder="Test title…"
        />
        {saving && <span className="tb-saving-indicator">Saving…</span>}
      </div>
      <div className="tb-editor-header-right">
        <span className={`tb-status-badge ${meta.cls}`}>
          {meta.label}
        </span>
        <button className="tb-toggle-btn" onClick={onToggleStatus}>
          {selected.status === 'draft' ? 'Publish' : 'Unpublish'}
        </button>
      </div>
    </div>
  )
}
