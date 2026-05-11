import { useState } from 'react'
import { createAnnouncement, updateAnnouncement, deleteAnnouncement } from '../../../api/classes'
import '../../css/teacher/class-detail/AnnouncementsTab.css'

function PinIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="17" x2="12" y2="22"/>
      <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17z"/>
    </svg>
  )
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function AnnouncementsTab({ classId, announcements, onAdd, onUpdate, onRemove }) {
  const [composing,  setComposing]  = useState(false)
  const [title,      setTitle]      = useState('')
  const [body,       setBody]       = useState('')
  const [pinned,     setPinned]     = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError,  setFormError]  = useState(null)

  const [editId,     setEditId]     = useState(null)
  const [editTitle,  setEditTitle]  = useState('')
  const [editBody,   setEditBody]   = useState('')
  const [editPinned, setEditPinned] = useState(false)
  const [saving,     setSaving]     = useState(false)
  const [editError,  setEditError]  = useState(null)

  const [confirmId,  setConfirmId]  = useState(null)
  const [deleting,   setDeleting]   = useState(false)

  function openCompose() {
    setTitle(''); setBody(''); setPinned(false); setFormError(null)
    setEditId(null)
    setComposing(true)
  }

  function cancelCompose() { setComposing(false) }

  function openEdit(a) {
    setEditId(a.id)
    setEditTitle(a.title)
    setEditBody(a.body)
    setEditPinned(!!a.pinned)
    setEditError(null)
    setConfirmId(null)
  }

  function cancelEdit() { setEditId(null) }

  async function handlePost(e) {
    e.preventDefault()
    if (!title.trim()) { setFormError('Title is required.'); return }
    if (!body.trim())  { setFormError('Body is required.'); return }
    setSubmitting(true); setFormError(null)
    try {
      const { data } = await createAnnouncement(classId, { title: title.trim(), body: body.trim(), pinned })
      onAdd(data)
      setComposing(false)
    } catch {
      setFormError('Could not post announcement. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSaveEdit(e) {
    e.preventDefault()
    if (!editTitle.trim()) { setEditError('Title is required.'); return }
    if (!editBody.trim())  { setEditError('Body is required.'); return }
    setSaving(true); setEditError(null)
    try {
      const { data } = await updateAnnouncement(classId, editId, {
        title: editTitle.trim(), body: editBody.trim(), pinned: editPinned,
      })
      onUpdate(data)
      setEditId(null)
    } catch {
      setEditError('Could not save changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirmId) return
    setDeleting(true)
    try {
      await deleteAnnouncement(classId, confirmId)
      onRemove(confirmId)
      setConfirmId(null)
    } catch {
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="ann-tab">

      {/* ── Compose form ───────────────────────────────────────────── */}
      {composing ? (
        <form className="ann-compose" onSubmit={handlePost}>
          <div className="ann-compose-header">
            <span className="ann-compose-title">New Announcement</span>
            <button type="button" className="ann-compose-cancel-x" onClick={cancelCompose}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <input
            className={`ann-compose-input${formError && !title.trim() ? ' ann-compose-input--err' : ''}`}
            type="text" placeholder="Title" value={title}
            onChange={e => setTitle(e.target.value)} autoFocus maxLength={200}
          />
          <textarea
            className={`ann-compose-body${formError && !body.trim() ? ' ann-compose-body--err' : ''}`}
            placeholder="Write your announcement…" value={body}
            onChange={e => setBody(e.target.value)} rows={4}
          />
          <div className="ann-compose-footer">
            <label className="ann-pinned-toggle">
              <input type="checkbox" checked={pinned} onChange={e => setPinned(e.target.checked)} />
              <PinIcon /> Pin to top
            </label>
            {formError && <span className="ann-compose-err">{formError}</span>}
            <div className="ann-compose-actions">
              <button type="button" className="ann-btn-ghost" onClick={cancelCompose}>Cancel</button>
              <button type="submit" className="ann-btn-post" disabled={submitting}>
                {submitting ? 'Posting…' : 'Post'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="ann-toolbar">
          <button className="ann-new-btn" onClick={openCompose}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Announcement
          </button>
          <span className="ann-count">
            {announcements.length} announcement{announcements.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* ── List ───────────────────────────────────────────────────── */}
      {announcements.length === 0 && !composing ? (
        <div className="ann-empty">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span>No announcements yet</span>
        </div>
      ) : (
        <div className="ann-list">
          {announcements.map((a, i) => (
            <div
              key={a.id}
              className={`ann-card${a.pinned ? ' ann-card--pinned' : ''}${editId === a.id ? ' ann-card--editing' : ''}`}
              style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
            >
              {editId === a.id ? (
                /* ── Inline edit form ──────────────────────────────── */
                <form className="ann-edit-form" onSubmit={handleSaveEdit}>
                  <input
                    className={`ann-compose-input${editError && !editTitle.trim() ? ' ann-compose-input--err' : ''}`}
                    type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)}
                    autoFocus maxLength={200}
                  />
                  <textarea
                    className={`ann-compose-body${editError && !editBody.trim() ? ' ann-compose-body--err' : ''}`}
                    value={editBody} onChange={e => setEditBody(e.target.value)} rows={3}
                  />
                  <div className="ann-compose-footer">
                    <label className="ann-pinned-toggle">
                      <input type="checkbox" checked={editPinned} onChange={e => setEditPinned(e.target.checked)} />
                      <PinIcon /> Pin to top
                    </label>
                    {editError && <span className="ann-compose-err">{editError}</span>}
                    <div className="ann-compose-actions">
                      <button type="button" className="ann-btn-ghost" onClick={cancelEdit}>Cancel</button>
                      <button type="submit" className="ann-btn-post" disabled={saving}>
                        {saving ? 'Saving…' : 'Save'}
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                /* ── Card view ─────────────────────────────────────── */
                <>
                  <div className="ann-card-body">
                    <div className="ann-card-top">
                      {a.pinned && (
                        <span className="ann-pin-badge"><PinIcon /> Pinned</span>
                      )}
                      <span className="ann-card-title">{a.title}</span>
                    </div>
                    <p className="ann-card-text">{a.body}</p>
                    <div className="ann-card-footer">
                      <span className="ann-card-author">{a.author_name}</span>
                      <span className="ann-card-dot">·</span>
                      <span className="ann-card-date">{fmtDate(a.created_at)}</span>
                    </div>
                  </div>

                  <div className="ann-card-actions">
                    {confirmId === a.id ? (
                      <div className="ann-confirm">
                        <span className="ann-confirm-label">Delete?</span>
                        <button className="ann-confirm-yes" onClick={handleDelete} disabled={deleting}>
                          {deleting ? '…' : 'Yes'}
                        </button>
                        <button className="ann-confirm-no" onClick={() => setConfirmId(null)}>No</button>
                      </div>
                    ) : (
                      <div className="ann-card-btns">
                        <button className="ann-edit-btn" onClick={() => openEdit(a)} title="Edit">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button className="ann-delete-btn" onClick={() => setConfirmId(a.id)} title="Delete">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                            <path d="M10 11v6"/><path d="M14 11v6"/>
                            <path d="M9 6V4h6v2"/>
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
