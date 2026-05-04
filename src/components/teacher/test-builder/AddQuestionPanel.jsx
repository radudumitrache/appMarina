import { useState } from 'react'
import { Q_TYPES } from '../../../pages/teacher/testBuilderMock'
import '../../css/teacher/test-builder/AddQuestionPanel.css'

export default function AddQuestionPanel({ onAdd }) {
  const [addingQ,  setAddingQ]  = useState(false)
  const [newQType, setNewQType] = useState('mcq')

  return addingQ ? (
    <div className="tb-add-q-panel">
      <span className="tb-add-q-label">Question type</span>
      <div className="tb-q-type-picker">
        {Q_TYPES.map(t => (
          <button
            key={t.id}
            className={`tb-q-type-btn ${newQType === t.id ? 'tb-q-type-btn--active' : ''}`}
            onClick={() => setNewQType(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="tb-add-q-actions">
        <button className="tb-add-q-cancel" onClick={() => setAddingQ(false)}>Cancel</button>
        <button className="tb-add-q-confirm" onClick={() => { onAdd(newQType); setAddingQ(false) }}>Add Question</button>
      </div>
    </div>
  ) : (
    <button className="tb-add-q-trigger" onClick={() => setAddingQ(true)}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
      Add Question
    </button>
  )
}
