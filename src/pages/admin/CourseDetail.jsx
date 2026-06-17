import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useParams, useNavigate } from 'react-router-dom'
import NavBar from '../../components/admin/NavBar'
import { getCourse, getCourses, getModules, createModule, addCourseModule, removeCourseModule, reorderCourseModule, updateCourse } from '../../api/modules'
import { getTests, createTest } from '../../api/tests'
import ModuleFormPanel from '../../components/admin/modules/ModuleFormPanel'
import TestFormPanel from '../../components/admin/tests/TestFormPanel'
import {
  getCourseDiplomas, createCourseDiploma, updateCourseDiploma,
  deleteCourseDiploma, awardCourseDiploma, revokeCourseDiploma,
  getClassStudents,
} from '../../api/departments'
import { getUsers } from '../../api/admin'
import '../css/admin/CourseDetail.css'

// ── Helpers ──────────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  return (
    <span className={`crd-status-badge crd-status-badge--${status}`}>{status}</span>
  )
}

// ── Diploma Form Modal ────────────────────────────────────────────────────────

function DiplomaFormModal({ mode, form, errors, courses, saving, onChange, onClose, onSave }) {
  return createPortal(
    <div className="crd-cert-overlay" onMouseDown={e => { if (e.target === e.currentTarget && !saving) onClose() }}>
      <div className="crd-cert-wrap">

        <button className="crd-cert-dismiss" onClick={onClose} disabled={saving} aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <div className="crd-cert">
          <span className="crd-cert-corner crd-cert-corner--tl" aria-hidden="true"/>
          <span className="crd-cert-corner crd-cert-corner--tr" aria-hidden="true"/>
          <span className="crd-cert-corner crd-cert-corner--bl" aria-hidden="true"/>
          <span className="crd-cert-corner crd-cert-corner--br" aria-hidden="true"/>

          <div className="crd-cert-logo">HANSA360</div>
          <div className="crd-cert-logo-sub">Maritime Training Platform</div>

          <div className="crd-cert-rule" aria-hidden="true">
            <span className="crd-cert-rule-line"/><span className="crd-cert-rule-diamond"/><span className="crd-cert-rule-line"/>
          </div>

          <svg className="crd-cert-anchor" viewBox="0 0 64 64" fill="none" aria-hidden="true">
            <circle cx="32" cy="14" r="6" stroke="currentColor" strokeWidth="2"/>
            <line x1="32" y1="20" x2="32" y2="52" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <line x1="16" y1="36" x2="48" y2="36" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M16 36 Q10 44 16 50 Q22 56 32 52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
            <path d="M48 36 Q54 44 48 50 Q42 56 32 52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
            <line x1="20" y1="36" x2="16" y2="30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="44" y1="36" x2="48" y2="30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>

          {courses.length > 0 && (
            <div className="crd-cert-course-row">
              <label className="crd-cert-course-label">Course</label>
              <select
                className="crd-cert-course-select"
                value={form.courseId}
                onChange={e => onChange('courseId', Number(e.target.value))}
                disabled={saving}
              >
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
          )}

          <input
            className={`crd-cert-title-input${errors.title ? ' crd-cert-title-input--err' : ''}`}
            type="text"
            value={form.title}
            onChange={e => onChange('title', e.target.value)}
            placeholder="e.g. Certificate of Completion"
            maxLength={300}
            disabled={saving}
            autoFocus
          />
          {errors.title && <p className="crd-cert-error">{errors.title}</p>}

          <div className="crd-cert-rule" aria-hidden="true">
            <span className="crd-cert-rule-line"/><span className="crd-cert-rule-diamond"/><span className="crd-cert-rule-line"/>
          </div>

          <p className="crd-cert-intro">Hereby this diploma is awarded to</p>
          <div className="crd-cert-recipient-placeholder">
            <span className="crd-cert-recipient-name">Student Name</span>
          </div>

          <textarea
            className="crd-cert-desc-input"
            value={form.description}
            onChange={e => onChange('description', e.target.value)}
            placeholder="in recognition of… (describe what this diploma recognises)"
            rows={3}
            disabled={saving}
          />

          {errors.non_field_errors && <p className="crd-cert-error">{errors.non_field_errors}</p>}

          <div className="crd-cert-actions">
            <button className="crd-cert-btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
            <button className="crd-cert-btn-primary" onClick={onSave} disabled={saving}>
              {saving ? 'Saving…' : mode === 'create' ? 'Create Diploma' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

// ── Award Diploma Modal ───────────────────────────────────────────────────────

function AwardDiplomaModal({ diploma, students, onClose, onAward }) {
  const [selected, setSelected] = useState(
    new Set(diploma.recipients.map(r => r.id))
  )
  const [search, setSearch] = useState('')

  const toggle = id => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const filtered = students.filter(s => {
    const q = search.toLowerCase()
    return s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
  })

  return (
    <div className="crd-modal-backdrop" onClick={onClose}>
      <div className="crd-modal-card crd-modal-card--lg" onClick={e => e.stopPropagation()}>
        <div className="crd-modal-header">
          <span className="crd-modal-title">Award – {diploma.title}</span>
          <button className="crd-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="crd-modal-body">
          <p className="crd-award-hint">Select students to award this diploma. Deselecting revokes it.</p>
          <div className="crd-form-group">
            <input
              className="crd-form-input"
              placeholder="Search students…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {filtered.length === 0 ? (
            <p className="crd-award-empty">No students found.</p>
          ) : (
            <div className="crd-student-list">
              {filtered.map(s => (
                <label key={s.id} className="crd-student-row">
                  <input
                    type="checkbox"
                    checked={selected.has(s.id)}
                    onChange={() => toggle(s.id)}
                    className="crd-student-check"
                  />
                  <span className="crd-student-name">{s.name}</span>
                  <span className="crd-student-email">{s.email}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        <div className="crd-modal-footer">
          <span className="crd-award-count">{selected.size} selected</span>
          <button className="crd-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="crd-btn-primary" onClick={() => onAward(diploma, selected, diploma.recipients)}>
            Save Awards
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Diploma Card ──────────────────────────────────────────────────────────────

function DiplomaCard({ diploma, onEdit, onDelete, onAward }) {
  return (
    <div className="crd-diploma-card">
      <div className="crd-diploma-top">
        <div className="crd-diploma-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="6"/>
            <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
          </svg>
        </div>
        <div className="crd-diploma-info">
          <h4 className="crd-diploma-title">{diploma.title}</h4>
          {diploma.description && (
            <p className="crd-diploma-desc">{diploma.description}</p>
          )}
        </div>
      </div>

      <div className="crd-diploma-recipients">
        <span className="crd-diploma-recipient-count">
          {diploma.recipient_count} recipient{diploma.recipient_count !== 1 ? 's' : ''}
        </span>
        {diploma.recipients.slice(0, 4).map(r => (
          <span key={r.id} className="crd-recipient-chip">{r.name}</span>
        ))}
        {diploma.recipients.length > 4 && (
          <span className="crd-recipient-chip crd-recipient-chip--more">
            +{diploma.recipients.length - 4} more
          </span>
        )}
      </div>

      <div className="crd-diploma-actions">
        <button className="crd-diploma-btn crd-diploma-btn--award" onClick={() => onAward(diploma)}>
          Award
        </button>
        <button className="crd-diploma-btn" onClick={() => onEdit(diploma)}>Edit</button>
        <button className="crd-diploma-btn crd-diploma-btn--danger" onClick={() => onDelete(diploma)}>Delete</button>
      </div>
    </div>
  )
}

// ── Course Item Row (lesson or test) ─────────────────────────────────────────

function CourseItemRow({ entry, index, dragOverIndex, onRemove, onNavigate, onDragStart, onDragOver, onDrop, onDragEnd }) {
  const isTarget = dragOverIndex === index
  const isTest = !!entry.test
  const title = isTest
    ? (entry.test_detail?.title ?? `Test #${entry.test}`)
    : (entry.module_detail?.title ?? `Module #${entry.module}`)

  return (
    <div
      className={`crd-module-row${isTarget ? ' crd-module-row--drag-over' : ''}`}
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={e => { e.preventDefault(); onDragOver(index) }}
      onDrop={e => { e.preventDefault(); onDrop(index) }}
      onDragEnd={onDragEnd}
    >
      <span className="crd-drag-handle" title="Drag to reorder">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="8" y1="6" x2="16" y2="6"/>
          <line x1="8" y1="12" x2="16" y2="12"/>
          <line x1="8" y1="18" x2="16" y2="18"/>
        </svg>
      </span>
      <span className="crd-module-order">{entry.order}</span>
      {isTest && <span className="crd-module-badge crd-module-badge--test">Test</span>}
      <span className="crd-module-title">{title}</span>
      <button className="crd-module-goto" onClick={() => onNavigate(entry)} title={isTest ? 'Go to test' : 'Go to module'}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
          <polyline points="15 3 21 3 21 9"/>
          <line x1="10" y1="14" x2="21" y2="3"/>
        </svg>
        {isTest ? 'Go to test' : 'Go to module'}
      </button>
      <button className="crd-module-remove" onClick={() => onRemove(entry)}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function CourseDetail() {
  const { id }   = useParams()
  const navigate = useNavigate()

  const [course, setCourse]         = useState(null)
  const [diplomas, setDiplomas]     = useState([])
  const [students, setStudents]     = useState([])
  const [allModules, setAllModules] = useState([])
  const [allTests, setAllTests]     = useState([])
  const [allCourses, setAllCourses] = useState([])
  const [loading, setLoading]       = useState(true)

  const [diplomaModal, setDiplomaModal]   = useState(null)
  const [awardModal, setAwardModal]       = useState(null)
  const [deleteTarget, setDeleteTarget]   = useState(null)
  const [diplomaForm, setDiplomaForm]     = useState({ title: '', description: '', courseId: Number(id) })
  const [diplomaErrors, setDiplomaErrors] = useState({})
  const [diplomaSaving, setDiplomaSaving] = useState(false)

  const [addMode, setAddMode]         = useState('lesson') // 'lesson' | 'test'
  const [moduleSearch, setModuleSearch] = useState('')
  const [moduleFocus, setModuleFocus]   = useState(false)
  const [testSearch, setTestSearch]     = useState('')
  const [testFocus, setTestFocus]       = useState(false)
  const [dragIdx,     setDragIdx]       = useState(null)
  const [dragOverIdx, setDragOverIdx]   = useState(null)

  const EMPTY_MODULE_FORM = { title: '', description: '', duration_minutes: 30, difficulty: 'beginner', visibility: 'public' }
  const EMPTY_TEST_FORM   = { title: '', time_limit_minutes: 30, department_ids: [] }
  const [modulePanel, setModulePanel]   = useState(false)
  const [moduleForm,  setModuleForm]    = useState(EMPTY_MODULE_FORM)
  const [testPanel,   setTestPanel]     = useState(false)
  const [testForm,    setTestForm]      = useState(EMPTY_TEST_FORM)

  useEffect(() => {
    getCourses().then(r => setAllCourses(r.data.map(c => ({ id: c.id, title: c.title })))).catch(() => {})
  }, [])

  useEffect(() => {
    Promise.all([getCourse(id), getCourseDiplomas(id), getModules(), getTests()])
      .then(([cRes, dRes, lRes, tRes]) => {
        const courseData = cRes.data
        setCourse(courseData)
        setDiplomas(dRes.data)
        setAllModules(lRes.data)
        setAllTests(tRes.data)

        const departmentId = courseData.department_id
        if (departmentId) {
          return getClassStudents(departmentId).then(sRes => {
            setStudents(sRes.data.map(e => ({
              id: e.student,
              name: e.student_name,
              email: e.student_email,
            })))
          })
        } else {
          return getUsers({ 'userprofile__role': 'student' }).then(sRes => {
            setStudents(sRes.data.map(u => ({
              id: u.id,
              name: `${u.first_name} ${u.last_name}`.trim() || u.username,
              email: u.email,
            })))
          })
        }
      })
      .finally(() => setLoading(false))
  }, [id])

  // ── Course status toggle ───────────────────────────────────────────────────

  const togglePublish = async () => {
    if (!course) return
    const newStatus = course.status === 'published' ? 'draft' : 'published'
    try {
      const { data } = await updateCourse(id, { status: newStatus })
      setCourse(data)
    } catch {}
  }

  // ── Create & auto-add module ───────────────────────────────────────────────

  const handleCreateModule = async () => {
    try {
      const { data: mod } = await createModule(moduleForm)
      setAllModules(prev => [mod, ...prev])
      const { data: entry } = await addCourseModule(id, { module: mod.id })
      setCourse(prev => ({ ...prev, modules: [...(prev.modules ?? []), entry] }))
      setModulePanel(false)
      setModuleForm(EMPTY_MODULE_FORM)
    } catch {}
  }

  const handleCreateTest = async () => {
    try {
      const payload = { title: testForm.title, time_limit_minutes: testForm.time_limit_minutes }
      if (testForm.department_ids?.length) payload.department_ids = testForm.department_ids
      const { data: test } = await createTest(payload)
      setAllTests(prev => [test, ...prev])
      const { data: entry } = await addCourseModule(id, { test: test.id })
      setCourse(prev => ({ ...prev, modules: [...(prev.modules ?? []), entry] }))
      setTestPanel(false)
      setTestForm(EMPTY_TEST_FORM)
    } catch {}
  }

  // ── Diploma CRUD ───────────────────────────────────────────────────────────

  const openCreateDiploma = () => {
    setDiplomaForm({ title: '', description: '', courseId: Number(id) })
    setDiplomaErrors({})
    setDiplomaModal('create')
  }
  const openEditDiploma = d => {
    setDiplomaForm({ title: d.title, description: d.description || '', courseId: d.course ?? Number(id) })
    setDiplomaErrors({})
    setDiplomaModal(d)
  }

  const handleDiplomaFormChange = (field, value) => {
    setDiplomaForm(f => ({ ...f, [field]: value }))
    setDiplomaErrors(e => { const n = { ...e }; delete n[field]; return n })
  }

  const handleDiplomaSave = async () => {
    const errs = {}
    if (!diplomaForm.title.trim()) errs.title = 'Title is required.'
    if (Object.keys(errs).length) { setDiplomaErrors(errs); return }
    setDiplomaErrors({})
    setDiplomaSaving(true)
    const targetCourseId = diplomaForm.courseId || Number(id)
    const payload = { title: diplomaForm.title.trim(), description: diplomaForm.description.trim() }
    try {
      if (diplomaModal === 'create') {
        const { data } = await createCourseDiploma(targetCourseId, payload)
        if (targetCourseId === Number(id)) setDiplomas(prev => [data, ...prev])
      } else {
        const { data } = await updateCourseDiploma(targetCourseId, diplomaModal.id, payload)
        if (targetCourseId === Number(id)) {
          setDiplomas(prev => prev.map(d => d.id === diplomaModal.id ? data : d))
        } else {
          setDiplomas(prev => prev.filter(d => d.id !== diplomaModal.id))
        }
      }
      setDiplomaModal(null)
    } catch (err) {
      const data = err?.response?.data
      if (data && typeof data === 'object') {
        setDiplomaErrors(Object.fromEntries(
          Object.entries(data).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])
        ))
      } else {
        setDiplomaErrors({ non_field_errors: 'Something went wrong.' })
      }
    } finally {
      setDiplomaSaving(false)
    }
  }

  const handleDiplomaDelete = async () => {
    try {
      await deleteCourseDiploma(id, deleteTarget.id)
      setDiplomas(prev => prev.filter(d => d.id !== deleteTarget.id))
    } catch {}
    setDeleteTarget(null)
  }

  // ── Award / Revoke ─────────────────────────────────────────────────────────

  const handleAward = async (diploma, selectedSet, previousRecipients) => {
    const prevIds = new Set(previousRecipients.map(r => r.id))
    const toAdd    = [...selectedSet].filter(uid => !prevIds.has(uid))
    const toRevoke = [...prevIds].filter(uid => !selectedSet.has(uid))

    try {
      let updated = diploma
      if (toAdd.length) {
        const { data } = await awardCourseDiploma(id, diploma.id, { user_ids: toAdd })
        updated = data
      }
      for (const uid of toRevoke) {
        const { data } = await revokeCourseDiploma(id, diploma.id, uid)
        updated = data
      }
      setDiplomas(prev => prev.map(d => d.id === diploma.id ? updated : d))
    } catch {}
    setAwardModal(null)
  }

  // ── Add Lesson / Test ──────────────────────────────────────────────────────

  const addedModuleIds = course?.modules?.filter(cl => cl.module).map(cl => cl.module) ?? []
  const addedTestIds   = course?.modules?.filter(cl => cl.test).map(cl => cl.test) ?? []

  const qLesson = moduleSearch.trim().toLowerCase()
  const availableModules = allModules.filter(l => !addedModuleIds.includes(l.id))
  const filteredModules  = qLesson
    ? availableModules.filter(l => (l.title || '').toLowerCase().includes(qLesson))
    : availableModules

  const qTest = testSearch.trim().toLowerCase()
  const availableTests = allTests.filter(t => !addedTestIds.includes(t.id))
  const filteredTests  = qTest
    ? availableTests.filter(t => (t.title || '').toLowerCase().includes(qTest))
    : availableTests

  const handleAddModule = async mod => {
    try {
      const { data } = await addCourseModule(id, { module: mod.id })
      setCourse(prev => ({ ...prev, modules: [...(prev.modules ?? []), data] }))
    } catch {}
    setModuleSearch('')
    setModuleFocus(false)
  }

  const handleAddTest = async test => {
    try {
      const { data } = await addCourseModule(id, { test: test.id })
      setCourse(prev => ({ ...prev, modules: [...(prev.modules ?? []), data] }))
    } catch {}
    setTestSearch('')
    setTestFocus(false)
  }

  const handleRemoveModule = async entry => {
    try {
      await removeCourseModule(id, entry.id)
      setCourse(prev => ({
        ...prev,
        modules: (prev.modules ?? []).filter(cl => cl.id !== entry.id),
      }))
    } catch {}
  }

  const handleDrop = async (toIdx) => {
    const fromIdx = dragIdx
    setDragIdx(null)
    setDragOverIdx(null)
    if (fromIdx == null || fromIdx === toIdx) return

    const items = [...(course.modules ?? [])]
    const [moved] = items.splice(fromIdx, 1)
    items.splice(toIdx, 0, moved)
    const reordered = items.map((l, i) => ({ ...l, order: i + 1 }))

    setCourse(prev => ({ ...prev, modules: reordered }))

    try {
      await Promise.all(
        reordered.map(l => reorderCourseModule(id, { coursemodule_id: l.id, new_order: l.order }))
      )
    } catch {
      setCourse(prev => ({ ...prev, modules: course.modules }))
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="crd-page">
        <NavBar />
        <div className="crd-loading">Loading…</div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="crd-page">
        <NavBar />
        <div className="crd-loading">Course not found.</div>
      </div>
    )
  }

  return (
    <div className="crd-page">
      <NavBar />

      {/* Topbar */}
      <div className="crd-topbar">
        <button className="crd-back-btn" onClick={() => navigate('/admin/courses')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Courses
        </button>
        <div className="crd-topbar-center">
          <h1 className="crd-course-title">{course.title}</h1>
          <StatusBadge status={course.status} />
          {course.department_name && (
            <span className="crd-course-class">{course.department_name}</span>
          )}
          {course.organisation_name && !course.department_name && (
            <span className="crd-course-org">{course.organisation_name}</span>
          )}
        </div>
        <button
          className={`crd-publish-btn${course.status === 'published' ? ' crd-publish-btn--active' : ''}`}
          onClick={togglePublish}
        >
          {course.status === 'published' ? 'Unpublish' : 'Publish'}
        </button>
      </div>

      <div className="crd-body">
        {/* Left column: Modules */}
        <section className="crd-section crd-section--modules">
          <div className="crd-section-header">
            <h2 className="crd-section-title">Modules</h2>
            <span className="crd-section-count">{course.modules?.length ?? 0}</span>
          </div>

          {/* Add-type tabs */}
          <div className="crd-add-tabs">
            <button
              className={`crd-add-tab${addMode === 'lesson' ? ' crd-add-tab--active' : ''}`}
              onClick={() => { setAddMode('lesson'); setModuleSearch(''); setTestSearch('') }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
              Add Lesson
            </button>
            <button
              className={`crd-add-tab${addMode === 'test' ? ' crd-add-tab--active' : ''}`}
              onClick={() => { setAddMode('test'); setModuleSearch(''); setTestSearch('') }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
              Add Test
            </button>
            <div className="crd-add-tabs-create-group">
              <button className="crd-add-tab crd-add-tab--create" onClick={() => setModulePanel(true)}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                New Module
              </button>
              <button className="crd-add-tab crd-add-tab--create" onClick={() => setTestPanel(true)}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                New Test
              </button>
            </div>
          </div>

          {/* Search dropdown */}
          {addMode === 'lesson' ? (
            <div className="crd-module-search-wrap">
              <input
                className="crd-form-input"
                placeholder="Search lessons to add…"
                value={moduleSearch}
                onChange={e => setModuleSearch(e.target.value)}
                onFocus={() => setModuleFocus(true)}
                onBlur={() => setTimeout(() => setModuleFocus(false), 150)}
              />
              {moduleFocus && (
                <div className="crd-module-dropdown">
                  {filteredModules.length === 0 ? (
                    <p className="crd-module-no-results">
                      {qLesson ? 'No lessons match your search.' : 'No lessons available to add.'}
                    </p>
                  ) : (
                    filteredModules.slice(0, 10).map(l => (
                      <button key={l.id} className="crd-module-option" onMouseDown={() => handleAddModule(l)}>
                        <span className="crd-module-option-title">{l.title}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="crd-module-search-wrap">
              <input
                className="crd-form-input"
                placeholder="Search tests to add…"
                value={testSearch}
                onChange={e => setTestSearch(e.target.value)}
                onFocus={() => setTestFocus(true)}
                onBlur={() => setTimeout(() => setTestFocus(false), 150)}
              />
              {testFocus && (
                <div className="crd-module-dropdown">
                  {filteredTests.length === 0 ? (
                    <p className="crd-module-no-results">
                      {qTest ? 'No tests match your search.' : 'No tests available to add.'}
                    </p>
                  ) : (
                    filteredTests.slice(0, 10).map(t => (
                      <button key={t.id} className="crd-module-option" onMouseDown={() => handleAddTest(t)}>
                        <span className="crd-module-option-title">{t.title}</span>
                        <span className="crd-module-badge crd-module-badge--test">{t.status}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          <div className="crd-modules-list">
            {(course.modules?.length ?? 0) === 0 ? (
              <p className="crd-empty-msg">No modules added yet.</p>
            ) : (
              course.modules.map((entry, index) => (
                <CourseItemRow
                  key={entry.id}
                  entry={entry}
                  index={index}
                  dragOverIndex={dragOverIdx}
                  onRemove={handleRemoveModule}
                  onNavigate={e => e.test ? navigate(`/admin/tests`, { state: { openTestId: e.test } }) : navigate(`/admin/modules/${e.module}/panels`, { state: { backPath: '/admin/courses', backLabel: 'Courses' } })}
                  onDragStart={i => setDragIdx(i)}
                  onDragOver={i => setDragOverIdx(i)}
                  onDrop={handleDrop}
                  onDragEnd={() => { setDragIdx(null); setDragOverIdx(null) }}
                />
              ))
            )}
          </div>
        </section>

        {/* Right column: Diplomas */}
        <section className="crd-section crd-section--diplomas">
          <div className="crd-section-header">
            <h2 className="crd-section-title">Diplomas</h2>
            <span className="crd-section-count">{diplomas.length}</span>
            <button className="crd-btn-primary crd-btn-sm" onClick={openCreateDiploma}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New
            </button>
          </div>

          {diplomas.length === 0 ? (
            <p className="crd-empty-msg">No diplomas created yet.</p>
          ) : (
            <div className="crd-diplomas-list">
              {diplomas.map(d => (
                <DiplomaCard
                  key={d.id}
                  diploma={d}
                  onEdit={openEditDiploma}
                  onDelete={setDeleteTarget}
                  onAward={setAwardModal}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {diplomaModal !== null && (
        <DiplomaFormModal
          mode={diplomaModal === 'create' ? 'create' : 'edit'}
          form={diplomaForm}
          errors={diplomaErrors}
          courses={allCourses}
          saving={diplomaSaving}
          onChange={handleDiplomaFormChange}
          onClose={() => { if (!diplomaSaving) { setDiplomaModal(null); setDiplomaErrors({}) } }}
          onSave={handleDiplomaSave}
        />
      )}

      {awardModal && (
        <AwardDiplomaModal
          diploma={awardModal}
          students={students}
          onClose={() => setAwardModal(null)}
          onAward={handleAward}
        />
      )}

      {modulePanel && (
        <ModuleFormPanel
          form={moduleForm}
          onChange={(f, v) => setModuleForm(prev => ({ ...prev, [f]: v }))}
          onClose={() => { setModulePanel(false); setModuleForm(EMPTY_MODULE_FORM) }}
          onSave={handleCreateModule}
        />
      )}

      {testPanel && (
        <TestFormPanel
          form={testForm}
          onChange={(f, v) => setTestForm(prev => ({ ...prev, [f]: v }))}
          onClose={() => { setTestPanel(false); setTestForm(EMPTY_TEST_FORM) }}
          onSave={handleCreateTest}
        />
      )}

      {deleteTarget && (
        <div className="crd-modal-backdrop" onClick={() => setDeleteTarget(null)}>
          <div className="crd-modal-card crd-modal-card--sm" onClick={e => e.stopPropagation()}>
            <div className="crd-modal-header">
              <span className="crd-modal-title">Delete Diploma</span>
              <button className="crd-modal-close" onClick={() => setDeleteTarget(null)}>✕</button>
            </div>
            <div className="crd-modal-body">
              <p className="crd-delete-confirm-text">
                Delete <strong>{deleteTarget.title}</strong>? All awards will be revoked. This cannot be undone.
              </p>
            </div>
            <div className="crd-modal-footer">
              <button className="crd-btn-ghost" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="crd-btn-danger" onClick={handleDiplomaDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
