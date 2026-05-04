import { useNavigate } from 'react-router-dom'
import { STATUS_META } from '../../../pages/teacher/testBuilderMock'
import '../../css/teacher/test-builder/TestEditorHeader.css'

export default function TestEditorHeader({ selected, onTitleChange, onToggleStatus }) {
  const navigate = useNavigate()

  return (
    <div className="tb-editor-header">
      <div className="tb-editor-header-left">
        <button className="tb-crumb-link" onClick={() => navigate('/teacher/dashboard')}>
          Dashboard /
        </button>
        <input
          className="tb-title-input"
          value={selected.title}
          onChange={e => onTitleChange(e.target.value)}
          placeholder="Test title…"
        />
      </div>
      <div className="tb-editor-header-right">
        <span className={`tb-status-badge ${STATUS_META[selected.status].cls}`}>
          {STATUS_META[selected.status].label}
        </span>
        <button className="tb-toggle-btn" onClick={onToggleStatus}>
          {selected.status === 'draft' ? 'Publish' : 'Unpublish'}
        </button>
      </div>
    </div>
  )
}
