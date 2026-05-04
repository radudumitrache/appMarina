import '../../css/admin/lessons/LessonFormPanel.css'

function XIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}

export default function LessonFormPanel({ mode, form, onChange, onClose, onSave, categories, difficulties, teachers }) {
  return (
    <>
      <div className="panel-backdrop" onClick={onClose} />
      <aside className="lesson-panel">
        <div className="panel-header">
          <h3 className="panel-title">{mode === 'create' ? 'New Lesson' : 'Edit Lesson'}</h3>
          <button className="modal-close" onClick={onClose}><XIcon /></button>
        </div>

        <div className="panel-body">
          <div className="form-row">
            <label className="form-label">Title</label>
            <input
              className="form-input"
              type="text"
              placeholder="e.g. Helm Control Basics"
              value={form.title}
              onChange={e => onChange('title', e.target.value)}
            />
          </div>
          <div className="form-row">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={form.cat}
              onChange={e => onChange('cat', e.target.value)}
            >
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>
          <div className="form-row-2col">
            <div className="form-row">
              <label className="form-label">Duration</label>
              <input
                className="form-input"
                type="text"
                placeholder="e.g. 45 min"
                value={form.duration}
                onChange={e => onChange('duration', e.target.value)}
              />
            </div>
            <div className="form-row">
              <label className="form-label">Difficulty</label>
              <select
                className="form-select"
                value={form.difficulty}
                onChange={e => onChange('difficulty', e.target.value)}
              >
                {difficulties.map(d => (
                  <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <label className="form-label">Author</label>
            <select
              className="form-select"
              value={form.author}
              onChange={e => onChange('author', e.target.value)}
            >
              <option value="">Select a teacher…</option>
              {teachers.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-row">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              placeholder="Brief description of this lesson…"
              rows={3}
              value={form.description}
              onChange={e => onChange('description', e.target.value)}
            />
          </div>
          <div className="form-row-2col">
            <div className="form-row">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={form.status}
                onChange={e => onChange('status', e.target.value)}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div className="form-row">
              <label className="form-label">Visibility</label>
              <select
                className="form-select"
                value={form.visibility}
                onChange={e => onChange('visibility', e.target.value)}
              >
                <option value="class">Class only</option>
                <option value="public">Public</option>
              </select>
            </div>
          </div>
        </div>

        <div className="panel-footer">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={onSave} disabled={!form.title.trim()}>
            {mode === 'create' ? 'Create Lesson' : 'Save Changes'}
          </button>
        </div>
      </aside>
    </>
  )
}
