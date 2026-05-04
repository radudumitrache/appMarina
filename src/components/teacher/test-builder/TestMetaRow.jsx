import '../../css/teacher/test-builder/TestMetaRow.css'

export default function TestMetaRow({ selected, onUpdate }) {
  return (
    <div className="tb-meta-row">
      <div className="tb-meta-field">
        <label className="tb-meta-label">Class</label>
        <input
          className="tb-meta-input"
          value={selected.class}
          onChange={e => onUpdate({ class: e.target.value })}
          placeholder="e.g. MN-2024-A"
        />
      </div>
      <div className="tb-meta-field">
        <label className="tb-meta-label">Time Limit (min)</label>
        <input
          className="tb-meta-input tb-meta-input--mono"
          type="number"
          min="5"
          max="180"
          value={selected.timeLimit}
          onChange={e => onUpdate({ timeLimit: Number(e.target.value) })}
        />
      </div>
      <div className="tb-meta-stat">
        <span className="tb-meta-stat-value">{selected.questions.length}</span>
        <span className="tb-meta-stat-label">questions</span>
      </div>
      <div className="tb-meta-stat">
        <span className="tb-meta-stat-value">{selected.timeLimit}</span>
        <span className="tb-meta-stat-label">minutes</span>
      </div>
    </div>
  )
}
