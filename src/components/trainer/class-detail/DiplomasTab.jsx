import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import {
  createDiploma, updateDiploma, deleteDiploma, awardDiploma, revokeDiploma,
  createCourseDiploma, updateCourseDiploma, deleteCourseDiploma, awardCourseDiploma, revokeCourseDiploma,
} from '../../../api/departments'
import '../../css/trainer/class-detail/DiplomasTab.css'

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function initials(name) {
  return (name || '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

// ── Diploma form modal ────────────────────────────────────────────────────────

function DiplomaFormModal({ courseId, classId, diploma, courses, onSave, onClose }) {
  const editing = !!diploma
  const [title,        setTitle]        = useState(diploma?.title       ?? '')
  const [description,  setDescription]  = useState(diploma?.description ?? '')
  const [selectedCourse, setSelectedCourse] = useState(diploma?.course ?? courseId ?? '')
  const [saving,       setSaving]       = useState(false)
  const [error,        setError]        = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) { setError('Title is required.'); return }
    setSaving(true); setError(null)
    try {
      const payload = { title: title.trim(), description: description.trim() }
      const activeCourseId = selectedCourse || courseId
      let data
      if (activeCourseId) {
        ;({ data } = editing
          ? await updateCourseDiploma(activeCourseId, diploma.id, payload)
          : await createCourseDiploma(activeCourseId, payload))
      } else {
        ;({ data } = editing
          ? await updateDiploma(classId, diploma.id, payload)
          : await createDiploma(classId, payload))
      }
      onSave(data)
      onClose()
    } catch {
      setError('Could not save diploma. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return createPortal(
    <div className="dip-cert-overlay" onMouseDown={e => { if (e.target === e.currentTarget && !saving) onClose() }}>
      <div className="dip-cert-wrap">

        {/* close button outside the certificate */}
        <button className="dip-cert-dismiss" onClick={onClose} disabled={saving} aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <form className="dip-cert" onSubmit={handleSubmit} noValidate>

          {/* corner ornaments */}
          <span className="dip-cert-corner dip-cert-corner--tl" aria-hidden="true"/>
          <span className="dip-cert-corner dip-cert-corner--tr" aria-hidden="true"/>
          <span className="dip-cert-corner dip-cert-corner--bl" aria-hidden="true"/>
          <span className="dip-cert-corner dip-cert-corner--br" aria-hidden="true"/>

          {/* logo */}
          <div className="dip-cert-logo">HANSA360</div>
          <div className="dip-cert-logo-sub">Maritime Training Platform</div>

          {/* top rule */}
          <div className="dip-cert-rule" aria-hidden="true">
            <span className="dip-cert-rule-line"/><span className="dip-cert-rule-diamond"/><span className="dip-cert-rule-line"/>
          </div>

          {/* anchor ornament */}
          <svg className="dip-cert-anchor" viewBox="0 0 64 64" fill="none" aria-hidden="true">
            <circle cx="32" cy="14" r="6" stroke="currentColor" strokeWidth="2"/>
            <line x1="32" y1="20" x2="32" y2="52" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <line x1="16" y1="36" x2="48" y2="36" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M16 36 Q10 44 16 50 Q22 56 32 52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
            <path d="M48 36 Q54 44 48 50 Q42 56 32 52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
            <line x1="20" y1="36" x2="16" y2="30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="44" y1="36" x2="48" y2="30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>

          {/* course selector — only shown when courses list is provided */}
          {courses && courses.length > 0 && (
            <div className="dip-cert-course-row">
              <label className="dip-cert-course-label">Course</label>
              <select
                className="dip-cert-course-select"
                value={selectedCourse}
                onChange={e => setSelectedCourse(Number(e.target.value))}
                disabled={saving}
              >
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
          )}

          {/* title field */}
          <input
            className={`dip-cert-title-input${error && !title.trim() ? ' dip-cert-title-input--err' : ''}`}
            type="text"
            value={title}
            onChange={e => { setTitle(e.target.value); if (error) setError(null) }}
            placeholder="e.g. Certificate of Completion"
            maxLength={300}
            autoFocus
          />

          {/* bottom rule */}
          <div className="dip-cert-rule" aria-hidden="true">
            <span className="dip-cert-rule-line"/><span className="dip-cert-rule-diamond"/><span className="dip-cert-rule-line"/>
          </div>

          <p className="dip-cert-intro">
            Hereby this diploma is awarded to
          </p>
          <div className="dip-cert-recipient-placeholder">
            <span className="dip-cert-recipient-name">Crew Member Name</span>
          </div>

          <textarea
            className="dip-cert-desc-input"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="in recognition of… (describe what this diploma recognises)"
            rows={3}
          />

          {error && <p className="dip-cert-error">{error}</p>}

          <div className="dip-cert-actions">
            <button type="button" className="dip-btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="dip-btn-primary" disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Create Diploma'}
            </button>
          </div>

        </form>
      </div>
    </div>,
    document.body
  )
}

// ── Award modal ───────────────────────────────────────────────────────────────

function AwardModal({ courseId, classId, diploma, crew, completedCrew MemberIds, onUpdate, onClose }) {
  const awardedIds = new Set(diploma.recipients.map(r => r.id))
  const [pending, setPending] = useState(false)
  const [error,   setError]   = useState(null)
  const [search,  setSearch]  = useState('')

  const q        = search.trim().toLowerCase()
  const filtered = q
    ? crew.filter(s => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q))
    : crew

  const awarded   = filtered.filter(s =>  awardedIds.has(s.id))
  const remaining = filtered.filter(s => !awardedIds.has(s.id))

  // crew who finished the course but haven't been awarded yet
  const eligibleForBulk = crew.filter(
    s => completedCrew MemberIds?.has(s.id) && !awardedIds.has(s.id)
  )

  async function toggle(crew) {
    setPending(true); setError(null)
    try {
      let updated
      if (awardedIds.has(crew.id)) {
        if (courseId) {
          await revokeCourseDiploma(courseId, diploma.id, crew.id)
        } else {
          await revokeDiploma(classId, diploma.id, crew.id)
        }
        updated = { ...diploma, recipients: diploma.recipients.filter(r => r.id !== crew.id) }
        updated = { ...updated, recipient_count: updated.recipients.length }
      } else {
        const { data } = courseId
          ? await awardCourseDiploma(courseId, diploma.id, { user_ids: [crew.id] })
          : await awardDiploma(classId, diploma.id, { crew_ids: [crew.id] })
        updated = data
      }
      onUpdate(updated)
    } catch {
      setError('Could not update. Please try again.')
    } finally {
      setPending(false)
    }
  }

  async function awardAllFinished() {
    if (!eligibleForBulk.length) return
    setPending(true); setError(null)
    try {
      const ids = eligibleForBulk.map(s => s.id)
      const { data } = courseId
        ? await awardCourseDiploma(courseId, diploma.id, { user_ids: ids })
        : await awardDiploma(classId, diploma.id, { crew_ids: ids })
      onUpdate(data)
    } catch {
      setError('Could not award all. Please try again.')
    } finally {
      setPending(false)
    }
  }

  return createPortal(
    <div className="dip-modal-overlay" onMouseDown={e => { if (e.target === e.currentTarget && !pending) onClose() }}>
      <div className="dip-modal dip-modal--award">
        <div className="dip-modal-header">
          <div className="dip-modal-header-left">
            <span className="dip-modal-title">Award Diploma</span>
            <span className="dip-award-diploma-name">{diploma.title}</span>
          </div>
          <button className="dip-modal-close" onClick={onClose} disabled={pending}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Toolbar: search + bulk action */}
        <div className="dip-award-toolbar">
          <div className="dip-award-search-wrap">
            <svg className="dip-award-search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className="dip-award-search"
              placeholder="Search crew…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {completedCrew MemberIds && eligibleForBulk.length > 0 && (
            <button
              className="dip-award-all-btn"
              onClick={awardAllFinished}
              disabled={pending}
              title={`Award ${eligibleForBulk.length} crew${eligibleForBulk.length !== 1 ? 's' : ''} who completed the course`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Award finished ({eligibleForBulk.length})
            </button>
          )}
        </div>

        {error && <p className="dip-form-error" style={{ padding: '0 16px' }}>{error}</p>}

        <div className="dip-award-body">
          {crew.length === 0 ? (
            <p className="dip-award-empty">No enrolled crew in this department.</p>
          ) : filtered.length === 0 ? (
            <p className="dip-award-empty">No crew match your search.</p>
          ) : (
            <>
              {awarded.length > 0 && (
                <div className="dip-award-section">
                  <span className="dip-award-section-label">Awarded ({awarded.length})</span>
                  {awarded.map(s => (
                    <div key={s.id} className="dip-award-row dip-award-row--awarded">
                      <div className="dip-award-avatar">{initials(s.name)}</div>
                      <div className="dip-award-info">
                        <span className="dip-award-name">{s.name}</span>
                        <span className="dip-award-email">{s.email}</span>
                      </div>
                      <button
                        className="dip-revoke-btn"
                        onClick={() => toggle(s)}
                        disabled={pending}
                        title="Revoke diploma"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                        Revoke
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {remaining.length > 0 && (
                <div className="dip-award-section">
                  <span className="dip-award-section-label">Not awarded ({remaining.length})</span>
                  {remaining.map(s => (
                    <div key={s.id} className="dip-award-row">
                      <div className="dip-award-avatar dip-award-avatar--inactive">{initials(s.name)}</div>
                      <div className="dip-award-info">
                        <span className="dip-award-name">{s.name}</span>
                        {completedCrew MemberIds?.has(s.id) && (
                          <span className="dip-award-finished-badge">Course complete</span>
                        )}
                        <span className="dip-award-email">{s.email}</span>
                      </div>
                      <button
                        className="dip-award-btn"
                        onClick={() => toggle(s)}
                        disabled={pending}
                      >
                        Award
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

// ── Main tab ──────────────────────────────────────────────────────────────────

export default function DiplomasTab({ courseId, classId, diplomas, crew, courses, completedCrew MemberIds, composing, onComposeDone, onCreated, onUpdated, onRemoved }) {
  const navigate = useNavigate()
  const [editTarget,          setEditTarget]          = useState(null)
  const [awardTarget,         setAwardTarget]         = useState(null)
  const [confirmId,           setConfirmId]           = useState(null)
  const [deleting,            setDeleting]            = useState(false)
  const [recipientDropdownId, setRecipientDropdownId] = useState(null)

  async function handleDelete() {
    if (!confirmId) return
    setDeleting(true)
    try {
      if (courseId) {
        await deleteCourseDiploma(courseId, confirmId)
      } else {
        await deleteDiploma(classId, confirmId)
      }
      onRemoved(confirmId)
      setConfirmId(null)
    } catch {
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="dip-tab">
      {diplomas.length === 0 ? (
        <div className="dip-empty">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="6"/>
            <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
          </svg>
          <span>No diplomas yet — create one to award crew.</span>
        </div>
      ) : (
        <div className="dip-list">
          {diplomas.map((d, i) => (
            <div
              key={d.id}
              className="dip-card"
              style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
            >
              {/* ── Top row: info + actions ── */}
              <div className="dip-card-main">
                <div className="dip-card-body">
                  <div className="dip-card-top">
                    <span className="dip-card-title">{d.title}</span>
                    {d.description && (
                      <p className="dip-card-desc">{d.description}</p>
                    )}
                  </div>

                  <div className="dip-card-recipients">
                    {d.recipient_count === 0 ? (
                      <span className="dip-no-recipients">No recipients yet</span>
                    ) : (
                      <button
                        className={`dip-recipient-chips dip-recipient-chips--btn${recipientDropdownId === d.id ? ' dip-recipient-chips--open' : ''}`}
                        onClick={() => setRecipientDropdownId(recipientDropdownId === d.id ? null : d.id)}
                      >
                        {d.recipients.slice(0, 5).map(r => (
                          <div key={r.id} className="dip-recipient-chip">{initials(r.name)}</div>
                        ))}
                        {d.recipient_count > 5 && (
                          <div className="dip-recipient-chip dip-recipient-chip--overflow">+{d.recipient_count - 5}</div>
                        )}
                        <span className="dip-recipient-count">
                          {d.recipient_count} recipient{d.recipient_count !== 1 ? 's' : ''}
                        </span>
                        <svg className="dip-recipient-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="6 9 12 15 18 9"/>
                        </svg>
                      </button>
                    )}
                  </div>

                  <span className="dip-card-date">{fmtDate(d.created_at)}</span>
                </div>

                <div className="dip-card-actions">
                {confirmId === d.id ? (
                  <div className="dip-confirm">
                    <span className="dip-confirm-label">Delete?</span>
                    <button className="dip-confirm-yes" onClick={handleDelete} disabled={deleting}>
                      {deleting ? '…' : 'Yes'}
                    </button>
                    <button className="dip-confirm-no" onClick={() => setConfirmId(null)}>No</button>
                  </div>
                ) : (
                  <div className="dip-card-btns">
                    <button className="dip-award-trigger" onClick={() => setAwardTarget(d)}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="8" r="6"/>
                        <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
                      </svg>
                      Award
                    </button>
                    <button className="dip-edit-btn" onClick={() => setEditTarget(d)} title="Edit">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button className="dip-delete-btn" onClick={() => setConfirmId(d.id)} title="Delete">
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
              </div>{/* end dip-card-main */}

              {/* ── Collapsible recipients panel ── */}
              {recipientDropdownId === d.id && d.recipients.length > 0 && (
                <div className="dip-recipients-panel">
                  <div className="dip-recipients-panel-head">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="8" r="6"/>
                      <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
                    </svg>
                    <span>Recipients</span>
                    <span className="dip-recipients-panel-count">{d.recipient_count}</span>
                  </div>
                  {d.recipients.map(r => (
                    <button
                      key={r.id}
                      className="dip-recipients-panel-row"
                      onClick={() => navigate(`/trainer/crew/${r.id}/progress`)}
                    >
                      <div className="dip-recipient-chip dip-recipient-chip--sm">{initials(r.name)}</div>
                      <div className="dip-recipients-panel-info">
                        <span className="dip-recipients-panel-name">{r.name}</span>
                        <span className="dip-recipients-panel-email">{r.email}</span>
                      </div>
                      <span className="dip-recipients-panel-link">View progress</span>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"/>
                        <polyline points="12 5 19 12 12 19"/>
                      </svg>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {composing && (
        <DiplomaFormModal
          courseId={courseId}
          classId={classId}
          diploma={null}
          courses={courses}
          onSave={onCreated}
          onClose={onComposeDone}
        />
      )}

      {editTarget && (
        <DiplomaFormModal
          courseId={courseId}
          classId={classId}
          diploma={editTarget}
          courses={courses}
          onSave={updated => { onUpdated(updated); setEditTarget(null) }}
          onClose={() => setEditTarget(null)}
        />
      )}

      {awardTarget && (
        <AwardModal
          courseId={courseId}
          classId={classId}
          diploma={awardTarget}
          crew={crew}
          completedCrew MemberIds={completedCrew MemberIds}
          onUpdate={updated => {
            onUpdated(updated)
            setAwardTarget(updated)
          }}
          onClose={() => setAwardTarget(null)}
        />
      )}
    </div>
  )
}
