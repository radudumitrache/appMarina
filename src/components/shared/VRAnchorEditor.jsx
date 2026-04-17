/**
 * VRAnchorEditor — slide-in panel for creating and editing VR hotspot anchors.
 *
 * Props:
 *   anchor          {object}   The anchor being edited (or a template for new).
 *   isNew           {boolean}  true → creating; false → editing existing.
 *   onSave          {Function} Called with the updated anchor object.
 *   onDelete        {Function} Called with anchor.id when deleting.
 *   onCancel        {Function} Called when the user dismisses without saving.
 *   availableImages {Array}    [{ label, src }] list for image-type anchors.
 *
 * Glass is permitted: this panel floats over the VR photographic background.
 */
import { useState, useEffect } from 'react'
import '../../components/css/shared/VRAnchorEditor.css'

/* ── Icons ─────────────────────────────────────────────────────────────── */
function IconX() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}
function IconCheck() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}
function IconTrash() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
    </svg>
  )
}

/* ── Field helpers ──────────────────────────────────────────────────────── */
function Field({ label, children }) {
  return (
    <div className="vr-ae-field">
      <label className="vr-ae-label">{label}</label>
      {children}
    </div>
  )
}

/* ── Main component ─────────────────────────────────────────────────────── */
export default function VRAnchorEditor({ anchor, isNew, onSave, onDelete, onCancel, availableImages = [] }) {
  const [form, setForm] = useState(() => anchor || {})

  // Reset form whenever a different anchor is opened
  useEffect(() => { setForm(anchor || {}) }, [anchor])

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  const handleSave = () => {
    // Strip runtime-derived fields before persisting to state
    const { render, onClick, className, ...clean } = form
    onSave(clean)
  }

  const handleDelete = () => {
    if (window.confirm(`Delete anchor "${form.label}"?`)) {
      onDelete(form.id)
    }
  }

  return (
    <aside className="vr-ae">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="vr-ae-header">
        <div className="vr-ae-header-kicker">
          <span className="vr-ae-header-dot" />
          <span className="vr-ae-header-label">{isNew ? 'New Anchor' : 'Edit Anchor'}</span>
        </div>
        <button className="vr-ae-close" onClick={onCancel} aria-label="Cancel">
          <IconX />
        </button>
      </div>

      {/* ── Type tabs (not shown for polygon — geometry is fixed) ──── */}
      {form.type !== 'polygon' && (
        <Field label="Type">
          <div className="vr-ae-type-tabs">
            {['waypoint', 'image', 'info'].map(t => (
              <button
                key={t}
                className={`vr-ae-type-tab ${form.type === t ? 'vr-ae-type-tab--active' : ''}`}
                onClick={() => set('type', t)}
              >
                {t === 'waypoint' ? '⬤ Waypoint' : t === 'image' ? '⬜ Image' : 'ℹ Info'}
              </button>
            ))}
          </div>
        </Field>
      )}

      {form.type === 'polygon' && (
        <div className="vr-ae-polygon-badge">
          <span className="vr-ae-polygon-icon">⬡</span>
          <span>Polygon Area · {(form.points || []).length} points</span>
        </div>
      )}

      {/* ── Common fields ──────────────────────────────────────────── */}
      <Field label="Label">
        <input
          className="vr-ae-input"
          value={form.label || ''}
          onChange={e => set('label', e.target.value)}
          placeholder="Anchor label…"
        />
      </Field>

      {/* Lon/Lat only relevant for point anchors */}
      {form.type !== 'polygon' && (
        <div className="vr-ae-row">
          <Field label="Lon">
            <input
              className="vr-ae-input vr-ae-input--mono"
              type="number"
              value={form.lon ?? ''}
              onChange={e => set('lon', Number(e.target.value))}
            />
          </Field>
          <Field label="Lat">
            <input
              className="vr-ae-input vr-ae-input--mono"
              type="number"
              value={form.lat ?? ''}
              onChange={e => set('lat', Number(e.target.value))}
            />
          </Field>
        </div>
      )}

      {/* ── Polygon-specific ───────────────────────────────────────── */}
      {form.type === 'polygon' && (
        <Field label="Description">
          <textarea
            className="vr-ae-textarea"
            rows={3}
            value={form.description || ''}
            onChange={e => set('description', e.target.value)}
            placeholder="Describe this area…"
          />
        </Field>
      )}

      {/* ── Waypoint-specific ──────────────────────────────────────── */}
      {form.type === 'waypoint' && (
        <>
          <Field label="Description">
            <textarea
              className="vr-ae-textarea"
              rows={3}
              value={form.description || ''}
              onChange={e => set('description', e.target.value)}
              placeholder="Describe this waypoint…"
            />
          </Field>
          <div className="vr-ae-row">
            <Field label="Category">
              <input
                className="vr-ae-input"
                value={form.category || ''}
                onChange={e => set('category', e.target.value)}
                placeholder="e.g. Navigation"
              />
            </Field>
            <Field label="Bearing °">
              <input
                className="vr-ae-input vr-ae-input--mono"
                type="number"
                min={0} max={359}
                value={form.bearing ?? ''}
                onChange={e => set('bearing', e.target.value === '' ? undefined : Number(e.target.value))}
              />
            </Field>
          </div>
          <Field label="Status">
            <select
              className="vr-ae-select"
              value={form.status || 'active'}
              onChange={e => set('status', e.target.value)}
            >
              <option value="active">Active</option>
              <option value="locked">Locked</option>
            </select>
          </Field>
        </>
      )}

      {/* ── Image-specific ─────────────────────────────────────────── */}
      {form.type === 'image' && (
        <>
          <Field label="Image">
            <select
              className="vr-ae-select"
              value={form.image || ''}
              onChange={e => set('image', e.target.value)}
            >
              <option value="">— select scene —</option>
              {availableImages.map(img => (
                <option key={img.label} value={img.src}>{img.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Description">
            <textarea
              className="vr-ae-textarea"
              rows={3}
              value={form.description || ''}
              onChange={e => set('description', e.target.value)}
              placeholder="Describe this image pin…"
            />
          </Field>
          <Field label="Reference">
            <input
              className="vr-ae-input"
              value={form.ref || ''}
              onChange={e => set('ref', e.target.value)}
              placeholder="e.g. SOLAS III/11"
            />
          </Field>
        </>
      )}

      {/* ── Info-specific ──────────────────────────────────────────── */}
      {form.type === 'info' && (
        <>
          <Field label="Icon (emoji)">
            <input
              className="vr-ae-input"
              value={form.icon || ''}
              onChange={e => set('icon', e.target.value)}
              placeholder="🔭"
              maxLength={2}
            />
          </Field>
          <Field label="Summary">
            <textarea
              className="vr-ae-textarea"
              rows={2}
              value={form.body || ''}
              onChange={e => set('body', e.target.value)}
              placeholder="Short summary shown in-scene…"
            />
          </Field>
          <Field label="Detail">
            <textarea
              className="vr-ae-textarea"
              rows={3}
              value={form.detail || ''}
              onChange={e => set('detail', e.target.value)}
              placeholder="Expanded detail shown in the panel…"
            />
          </Field>
          <Field label="Regulation reference">
            <input
              className="vr-ae-input"
              value={form.ref || ''}
              onChange={e => set('ref', e.target.value)}
              placeholder="e.g. SOLAS II-2/10"
            />
          </Field>
        </>
      )}

      {/* ── Actions ────────────────────────────────────────────────── */}
      <div className="vr-ae-actions">
        <button className="vr-ae-btn vr-ae-btn--save" onClick={handleSave}>
          <IconCheck />
          {isNew ? 'Add Anchor' : 'Save Changes'}
        </button>
        {!isNew && (
          <button className="vr-ae-btn vr-ae-btn--delete" onClick={handleDelete}>
            <IconTrash />
            Delete
          </button>
        )}
      </div>

    </aside>
  )
}
