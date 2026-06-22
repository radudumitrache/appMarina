import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import NavBar from '../../components/admin/NavBar'
import MultiSelectDropdown from '../../components/shared/MultiSelectDropdown'
import ModuleFormPanel from '../../components/admin/modules/ModuleFormPanel'
import TestFormPanel from '../../components/admin/tests/TestFormPanel'
import ModuleDeleteModal from '../../components/admin/modules/ModuleDeleteModal'
import {
  getCourses, createCourse, updateCourse, deleteCourse,
  getCourse, getModules, createModule, updateModule, deleteModule,
  addCourseModule, removeCourseModule, reorderCourseModule,
} from '../../api/modules'
import { getTests, createTest } from '../../api/tests'
import {
  getDepartments,
  getCourseDiplomas, createCourseDiploma, updateCourseDiploma,
  deleteCourseDiploma, awardCourseDiploma, revokeCourseDiploma,
  getClassStudents,
} from '../../api/departments'
import { getTrainers, getUsers } from '../../api/admin'
import { getOrganisations } from '../../api/organisations'
import '../css/admin/Courses.css'
import '../css/admin/CourseDetail.css'

const EMPTY_COURSE_FORM  = { title: '', description: '', department_ids: [], status: 'draft', author_id: '' }
const EMPTY_MODULE_FORM  = { title: '', duration_minutes: 60, difficulty: 'intermediate', visibility: 'class', department: null, organisation_id: null }
const EMPTY_TEST_FORM    = { title: '', time_limit_minutes: 30, department_ids: [] }
const DIFFICULTIES       = ['easy', 'intermediate', 'advanced']

function mapModule(l) {
  return {
    id:              l.id,
    title:           l.title,
    duration:        `${l.duration_minutes} min`,
    duration_minutes: l.duration_minutes,
    difficulty:      l.difficulty,
    visibility:      l.visibility,
    author:          l.author_name ?? '',
    author_id:       l.author ?? null,
    locked:          l.locked,
    department_id:   l.department_id ?? null,
    organisation_id: l.organisation_id ?? null,
  }
}

// ── Status Badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  return <span className={`crd-status-badge crd-status-badge--${status}`}>{status}</span>
}

// ── Course Item Row (lesson or test in a course) ──────────────────────────────

function CourseItemRow({ entry, index, dragOverIndex, onRemove, onNavigate, onDragStart, onDragOver, onDrop, onDragEnd }) {
  const isTarget = dragOverIndex === index
  const isTest   = !!entry.test
  const title    = isTest
    ? (entry.test_detail?.title   ?? `Test #${entry.test}`)
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
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
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

function AwardDiplomaModal({ diploma, students, studentsLoading, saving, onClose, onAward }) {
  const [selected, setSelected] = useState(new Set(diploma.recipients.map(r => r.id)))
  const [search, setSearch]     = useState('')

  const toggle = id => {
    if (saving) return
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
          <button className="crd-modal-close" onClick={onClose} disabled={saving}>✕</button>
        </div>
        <div className="crd-modal-body">
          <p className="crd-award-hint">Select students to award this diploma. Deselecting revokes it.</p>
          <div className="crd-form-group">
            <input
              className="crd-form-input"
              placeholder="Search students…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              disabled={studentsLoading || saving}
            />
          </div>
          {studentsLoading ? (
            <p className="crd-award-empty">Loading students…</p>
          ) : filtered.length === 0 ? (
            <p className="crd-award-empty">{students.length === 0 ? 'No students enrolled in this course\'s departments.' : 'No students match your search.'}</p>
          ) : (
            <div className="crd-student-list">
              {filtered.map(s => (
                <label key={s.id} className={`crd-student-row${saving ? ' crd-student-row--disabled' : ''}`}>
                  <input type="checkbox" checked={selected.has(s.id)} onChange={() => toggle(s.id)} className="crd-student-check" disabled={saving} />
                  <span className="crd-student-name">{s.name}</span>
                  <span className="crd-student-email">{s.email}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        <div className="crd-modal-footer">
          <span className="crd-award-count">{selected.size} selected</span>
          <button className="crd-btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
          <button
            className="crd-btn-primary"
            onClick={() => onAward(diploma, selected, diploma.recipients)}
            disabled={saving || studentsLoading}
          >
            {saving ? 'Saving…' : 'Save Awards'}
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
          {diploma.description && <p className="crd-diploma-desc">{diploma.description}</p>}
        </div>
      </div>
      <div className="crd-diploma-recipients">
        <span className="crd-diploma-recipient-count">{diploma.recipient_count} recipient{diploma.recipient_count !== 1 ? 's' : ''}</span>
        {diploma.recipients.slice(0, 4).map(r => (
          <span key={r.id} className="crd-recipient-chip">{r.name}</span>
        ))}
        {diploma.recipients.length > 4 && (
          <span className="crd-recipient-chip crd-recipient-chip--more">+{diploma.recipients.length - 4} more</span>
        )}
      </div>
      <div className="crd-diploma-actions">
        <button className="crd-diploma-btn crd-diploma-btn--award" onClick={() => onAward(diploma)}>Award</button>
        <button className="crd-diploma-btn" onClick={() => onEdit(diploma)}>Edit</button>
        <button className="crd-diploma-btn crd-diploma-btn--danger" onClick={() => onDelete(diploma)}>Delete</button>
      </div>
    </div>
  )
}

// ── Course Form Modal ─────────────────────────────────────────────────────────

function CourseFormModal({ mode, form, errors, departments, trainers, onChange, onClose, onSave }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{mode === 'create' ? 'New Course' : 'Edit Course'}</span>
          <button className="modal-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              className={`form-input${errors.title ? ' form-input--error' : ''}`}
              placeholder="e.g. Maritime Safety Fundamentals"
              value={form.title}
              onChange={e => onChange('title', e.target.value)}
            />
            {errors.title && <span className="form-error">{errors.title}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-input form-textarea"
              placeholder="Brief description of this course…"
              value={form.description}
              onChange={e => onChange('description', e.target.value)}
              rows={3}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Departments (optional)</label>
            <MultiSelectDropdown
              value={form.department_ids}
              onChange={ids => onChange('department_ids', ids)}
              placeholder="– Organisation-wide –"
              options={departments.map(c => ({ value: c.id, label: `${c.name} (${c.code})` }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Author</label>
            <select className="form-input form-select" value={form.author_id} onChange={e => onChange('author_id', e.target.value)}>
              <option value="">– Assign to me –</option>
              {trainers.map(t => (
                <option key={t.id} value={t.id}>
                  {t.first_name || t.last_name ? `${t.first_name} ${t.last_name}`.trim() : t.username}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-input form-select" value={form.status} onChange={e => onChange('status', e.target.value)}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          {errors.non_field_errors && <p className="form-error">{errors.non_field_errors}</p>}
        </div>
        <div className="modal-footer">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={onSave}>{mode === 'create' ? 'Create Course' : 'Save Changes'}</button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function Courses() {
  const navigate = useNavigate()
  const { user } = useAuth()

  // ── Data ───────────────────────────────────────────────────────────────────
  const [courses,       setCourses]       = useState([])
  const [departments,   setDepartments]   = useState([])
  const [trainers,      settrainers]      = useState([])
  const [organisations, setOrganisations] = useState([])
  const [moduleBank,    setModuleBank]    = useState([])
  const [allTests,      setAllTests]      = useState([])

  const [selectedId,       setSelectedId]       = useState(null)
  const [courseDetailMap,  setCourseDetailMap]  = useState({})
  const [studentsMap,      setStudentsMap]      = useState({})
  const [loadingList,      setLoadingList]      = useState(true)
  const [loadingDetail,    setLoadingDetail]    = useState(false)

  // ── Sidebar UI ─────────────────────────────────────────────────────────────
  const [search,       setSearch]       = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // ── Right panel UI ─────────────────────────────────────────────────────────
  const [rightTab,     setRightTab]     = useState('modules')
  const [addMode,      setAddMode]      = useState('lesson')
  const [moduleSearch, setModuleSearch] = useState('')
  const [testSearch,   setTestSearch]   = useState('')
  const [moduleFocus,  setModuleFocus]  = useState(false)
  const [testFocus,    setTestFocus]    = useState(false)
  const [dragIdx,      setDragIdx]      = useState(null)
  const [dragOverIdx,  setDragOverIdx]  = useState(null)

  // ── Module bank UI ─────────────────────────────────────────────────────────
  const [bankOpen,          setBankOpen]          = useState(false)
  const [bankSearch,        setBankSearch]        = useState('')
  const [bankDepFilter,     setBankDepFilter]     = useState('all')
  const [modulePanel,       setModulePanel]       = useState(null)
  const [moduleForm,        setModuleForm]        = useState(EMPTY_MODULE_FORM)
  const [moduleDeleteTarget, setModuleDeleteTarget] = useState(null)
  const [testCreatePanel,   setTestCreatePanel]   = useState(false)
  const [testCreateForm,    setTestCreateForm]    = useState(EMPTY_TEST_FORM)

  // ── Course CRUD UI ─────────────────────────────────────────────────────────
  const [courseModal,      setCourseModal]      = useState(null)
  const [courseForm,       setCourseForm]       = useState(EMPTY_COURSE_FORM)
  const [courseFormErrors, setCourseFormErrors] = useState({})
  const [deleteTarget,     setDeleteTarget]     = useState(null)

  // ── Diploma UI ─────────────────────────────────────────────────────────────
  const [diplomaModal,        setDiplomaModal]        = useState(null)
  const [awardModal,          setAwardModal]          = useState(null)
  const [awardSaving,         setAwardSaving]         = useState(false)
  const [studentsLoading,     setStudentsLoading]     = useState(false)
  const [diplomaDeleteTarget, setDiplomaDeleteTarget] = useState(null)
  const [diplomaForm,         setDiplomaForm]         = useState({ title: '', description: '', courseId: null })
  const [diplomaErrors,       setDiplomaErrors]       = useState({})
  const [diplomaSaving,       setDiplomaSaving]       = useState(false)

  // ── Derived ────────────────────────────────────────────────────────────────
  const selectedCourse = courses.find(c => c.id === selectedId) ?? null
  const detail         = selectedId != null ? (courseDetailMap[selectedId] ?? null) : null
  const students       = selectedId != null ? (studentsMap[selectedId] ?? []) : []

  const filteredCourses = courses.filter(c => {
    const q = search.toLowerCase().trim()
    const deptNames = (c.departments ?? []).map(d => d.name).join(' ')
    const matchSearch = !q || c.title.toLowerCase().includes(q) || deptNames.toLowerCase().includes(q)
    const matchStatus = statusFilter === 'all' || c.status === statusFilter
    return matchSearch && matchStatus
  })

  const addedModuleIds = detail?.modules?.filter(cl => cl.module).map(cl => cl.module) ?? []
  const addedTestIds   = detail?.modules?.filter(cl => cl.test).map(cl => cl.test)     ?? []

  const qLesson = moduleSearch.trim().toLowerCase()
  const availableModules = moduleBank.filter(l => {
    if (addedModuleIds.includes(l.id)) return false
    return l.visibility === 'public' || (selectedCourse?.department_ids?.includes(l.department_id))
  })
  const filteredModules       = qLesson ? availableModules.filter(l => l.title.toLowerCase().includes(qLesson)) : availableModules
  const classSpecificModules  = filteredModules.filter(l => selectedCourse?.department_ids?.includes(l.department_id))
  const publicModules         = filteredModules.filter(l => l.visibility === 'public')

  const qTest          = testSearch.trim().toLowerCase()
  const availableTests = allTests.filter(t => !addedTestIds.includes(t.id))
  const filteredTests  = qTest ? availableTests.filter(t => t.title.toLowerCase().includes(qTest)) : availableTests

  const filteredBank = moduleBank.filter(l => {
    const q = bankSearch.toLowerCase()
    return (!q || l.title.toLowerCase().includes(q)) &&
      (bankDepFilter === 'all' || l.department_id === bankDepFilter)
  })

  // ── Mount ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    setLoadingList(true)
    const safe = p => p.catch(() => null)
    const promises = [safe(getCourses()), safe(getDepartments()), safe(getTrainers()), safe(getModules()), safe(getTests())]
    if (user?.is_staff) promises.push(safe(getOrganisations()))

    Promise.all(promises).then(([cRes, dRes, tRes, lRes, testRes, orgRes]) => {
      if (cRes) {
        const list = cRes.data
        setCourses(list)
        if (list.length > 0) setSelectedId(list[0].id)
      }
      if (dRes)    setDepartments(dRes.data)
      if (tRes)    settrainers(tRes.data?.results ?? tRes.data ?? [])
      if (lRes)    setModuleBank(lRes.data.map(mapModule))
      if (testRes) setAllTests(testRes.data)
      if (orgRes)  setOrganisations(orgRes.data)
    }).finally(() => setLoadingList(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Load detail when selection changes ────────────────────────────────────
  useEffect(() => {
    if (selectedId == null) return
    if (courseDetailMap[selectedId] !== undefined) return

    setLoadingDetail(true)
    Promise.all([getCourse(selectedId), getCourseDiplomas(selectedId)])
      .then(([cRes, dRes]) => {
        setCourseDetailMap(prev => ({
          ...prev,
          [selectedId]: { modules: cRes.data.modules ?? [], diplomas: dRes.data },
        }))
      })
      .catch(() => {
        setCourseDetailMap(prev => ({ ...prev, [selectedId]: { modules: [], diplomas: [] } }))
      })
      .finally(() => setLoadingDetail(false))
  }, [selectedId]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Selection ──────────────────────────────────────────────────────────────
  function selectCourse(id) {
    setSelectedId(id)
    setRightTab('modules')
    setAddMode('lesson')
    setModuleSearch('')
    setTestSearch('')
    setBankOpen(false)
  }

  // ── Detail helpers ─────────────────────────────────────────────────────────
  function setDetailModules(updater) {
    setCourseDetailMap(prev => {
      const cur = prev[selectedId] ?? { modules: [], diplomas: [] }
      return { ...prev, [selectedId]: { ...cur, modules: typeof updater === 'function' ? updater(cur.modules) : updater } }
    })
  }
  function setDetailDiplomas(updater) {
    setCourseDetailMap(prev => {
      const cur = prev[selectedId] ?? { modules: [], diplomas: [] }
      return { ...prev, [selectedId]: { ...cur, diplomas: typeof updater === 'function' ? updater(cur.diplomas) : updater } }
    })
  }

  // ── Course CRUD ────────────────────────────────────────────────────────────
  function openCreateCourse() { setCourseForm(EMPTY_COURSE_FORM); setCourseFormErrors({}); setCourseModal('create') }
  function openEditCourse(c) {
    setCourseForm({ title: c.title, description: c.description || '', department_ids: c.department_ids ?? [], status: c.status, author_id: c.author ?? '' })
    setCourseFormErrors({})
    setCourseModal(c)
  }
  function handleCourseFormChange(field, value) {
    setCourseForm(f => ({ ...f, [field]: value }))
    setCourseFormErrors(e => { const n = { ...e }; delete n[field]; return n })
  }
  async function handleSaveCourse() {
    const errs = {}
    if (!courseForm.title.trim()) errs.title = 'Title is required.'
    if (Object.keys(errs).length) { setCourseFormErrors(errs); return }
    setCourseFormErrors({})
    const payload = {
      title: courseForm.title.trim(), description: courseForm.description.trim(), status: courseForm.status,
      department_ids: courseForm.department_ids.map(Number),
      ...(courseForm.author_id ? { author_id: Number(courseForm.author_id) } : {}),
    }
    try {
      if (courseModal === 'create') {
        const { data } = await createCourse(payload)
        setCourses(prev => [data, ...prev])
        selectCourse(data.id)
        setCourseDetailMap(prev => ({ ...prev, [data.id]: { modules: [], diplomas: [] } }))
      } else {
        const { data } = await updateCourse(courseModal.id, payload)
        setCourses(prev => prev.map(c => c.id === courseModal.id ? data : c))
      }
      setCourseModal(null)
    } catch (err) {
      const data = err?.response?.data
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        setCourseFormErrors(Object.fromEntries(Object.entries(data).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])))
      } else {
        setCourseFormErrors({ non_field_errors: 'Something went wrong. Please try again.' })
      }
    }
  }
  async function executeDeleteCourse() {
    try {
      await deleteCourse(deleteTarget.id)
      const remaining = courses.filter(c => c.id !== deleteTarget.id)
      setCourses(remaining)
      setCourseDetailMap(prev => { const n = { ...prev }; delete n[deleteTarget.id]; return n })
      if (selectedId === deleteTarget.id) setSelectedId(remaining[0]?.id ?? null)
    } catch {}
    setDeleteTarget(null)
  }
  async function togglePublish() {
    if (!selectedCourse) return
    const newStatus = selectedCourse.status === 'published' ? 'draft' : 'published'
    setCourses(prev => prev.map(c => c.id === selectedId ? { ...c, status: newStatus } : c))
    try { await updateCourse(selectedId, { status: newStatus }) }
    catch { setCourses(prev => prev.map(c => c.id === selectedId ? { ...c, status: selectedCourse.status } : c)) }
  }

  // ── Course modules ─────────────────────────────────────────────────────────
  async function handleAddModule(mod) {
    try {
      const { data } = await addCourseModule(selectedId, { module: mod.id })
      setDetailModules(m => [...m, data])
    } catch {}
    setModuleSearch(''); setModuleFocus(false)
  }
  async function handleAddTest(test) {
    try {
      const { data } = await addCourseModule(selectedId, { test: test.id })
      setDetailModules(m => [...m, data])
    } catch {}
    setTestSearch(''); setTestFocus(false)
  }
  async function handleAddModuleFromBank(mod) {
    if (!selectedId || addedModuleIds.includes(mod.id)) return
    try {
      const { data } = await addCourseModule(selectedId, { module: mod.id })
      setDetailModules(m => [...m, data])
    } catch {}
  }
  async function handleRemoveCourseModule(entry) {
    setDetailModules(m => m.filter(cl => cl.id !== entry.id))
    try { await removeCourseModule(selectedId, entry.id) }
    catch { getCourse(selectedId).then(r => setDetailModules(r.data.modules ?? [])).catch(() => {}) }
  }
  async function handleDrop(toIdx) {
    const fromIdx = dragIdx
    setDragIdx(null); setDragOverIdx(null)
    if (fromIdx == null || fromIdx === toIdx) return
    const items = [...(detail.modules ?? [])]
    const [moved] = items.splice(fromIdx, 1)
    items.splice(toIdx, 0, moved)
    const reordered = items.map((l, i) => ({ ...l, order: i + 1 }))
    setDetailModules(reordered)
    try { await Promise.all(reordered.map(l => reorderCourseModule(selectedId, { coursemodule_id: l.id, new_order: l.order }))) }
    catch { getCourse(selectedId).then(r => setDetailModules(r.data.modules ?? [])).catch(() => {}) }
  }

  // ── Module bank CRUD ───────────────────────────────────────────────────────
  function openCreateModule() { setModuleForm(EMPTY_MODULE_FORM); setModulePanel('create') }
  function openEditModule(mod) {
    setModuleForm({ title: mod.title, duration_minutes: mod.duration_minutes, difficulty: mod.difficulty, visibility: mod.visibility, department: mod.department_id ?? null, organisation_id: mod.organisation_id ?? null })
    setModulePanel(mod)
  }
  function handleModuleFormChange(field, value) { setModuleForm(f => ({ ...f, [field]: value })) }
  async function handleCreateModule() {
    if (!moduleForm.title.trim()) return
    try { const { data } = await createModule(moduleForm); setModuleBank(prev => [mapModule(data), ...prev]); setModulePanel(null) } catch {}
  }
  async function handleUpdateModule() {
    if (!moduleForm.title.trim() || !modulePanel || modulePanel === 'create') return
    try { const { data } = await updateModule(modulePanel.id, moduleForm); setModuleBank(prev => prev.map(l => l.id === modulePanel.id ? mapModule(data) : l)); setModulePanel(null) } catch {}
  }
  async function executeDeleteModule() {
    try { await deleteModule(moduleDeleteTarget.id); setModuleBank(prev => prev.filter(l => l.id !== moduleDeleteTarget.id)) } catch {}
    setModuleDeleteTarget(null)
  }

  // ── Test creation from courses panel ──────────────────────────────────────
  function openCreateTestPanel() { setTestCreateForm(EMPTY_TEST_FORM); setTestCreatePanel(true) }
  function handleTestCreateFormChange(field, value) { setTestCreateForm(f => ({ ...f, [field]: value })) }
  async function handleCreateTestFromPanel() {
    if (!testCreateForm.title.trim()) return
    try {
      const payload = { title: testCreateForm.title.trim(), time_limit_minutes: testCreateForm.time_limit_minutes || 30 }
      if (testCreateForm.department_ids?.length) payload.department_ids = testCreateForm.department_ids
      const { data } = await createTest(payload)
      setAllTests(prev => [data, ...prev])
      setTestCreatePanel(false)
    } catch {}
  }

  // ── Diplomas ───────────────────────────────────────────────────────────────
  function openCreateDiploma() { setDiplomaForm({ title: '', description: '', courseId: selectedId }); setDiplomaErrors({}); setDiplomaModal('create') }
  function openEditDiploma(d) { setDiplomaForm({ title: d.title, description: d.description || '', courseId: d.course ?? selectedId }); setDiplomaErrors({}); setDiplomaModal(d) }
  function handleDiplomaFormChange(field, value) {
    setDiplomaForm(f => ({ ...f, [field]: value }))
    setDiplomaErrors(e => { const n = { ...e }; delete n[field]; return n })
  }
  async function handleDiplomaSave() {
    const errs = {}
    if (!diplomaForm.title.trim()) errs.title = 'Title is required.'
    if (Object.keys(errs).length) { setDiplomaErrors(errs); return }
    setDiplomaErrors({}); setDiplomaSaving(true)
    const targetCourseId = diplomaForm.courseId || selectedId
    const payload = { title: diplomaForm.title.trim(), description: diplomaForm.description.trim() }
    try {
      if (diplomaModal === 'create') {
        const { data } = await createCourseDiploma(targetCourseId, payload)
        if (targetCourseId === selectedId) setDetailDiplomas(d => [data, ...d])
      } else {
        const { data } = await updateCourseDiploma(targetCourseId, diplomaModal.id, payload)
        if (targetCourseId === selectedId) setDetailDiplomas(d => d.map(x => x.id === diplomaModal.id ? data : x))
        else setDetailDiplomas(d => d.filter(x => x.id !== diplomaModal.id))
      }
      setDiplomaModal(null)
    } catch (err) {
      const data = err?.response?.data
      if (data && typeof data === 'object') setDiplomaErrors(Object.fromEntries(Object.entries(data).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])))
      else setDiplomaErrors({ non_field_errors: 'Something went wrong.' })
    } finally { setDiplomaSaving(false) }
  }
  async function handleDiplomaDelete() {
    try { await deleteCourseDiploma(selectedId, diplomaDeleteTarget.id); setDetailDiplomas(d => d.filter(x => x.id !== diplomaDeleteTarget.id)) } catch {}
    setDiplomaDeleteTarget(null)
  }
  async function openAwardModal(diploma) {
    setAwardModal(diploma)
    if (studentsMap[selectedId]) return
    setStudentsLoading(true)
    try {
      if (selectedCourse?.department_ids?.length) {
        const resList = await Promise.all(selectedCourse.department_ids.map(id => getClassStudents(id)))
        const merged = new Map()
        for (const res of resList) {
          for (const e of res.data) {
            merged.set(e.student, { id: e.student, name: e.student_name, email: e.student_email })
          }
        }
        setStudentsMap(prev => ({ ...prev, [selectedId]: Array.from(merged.values()) }))
      } else {
        const res = await getUsers({ 'userprofile__role': 'student' })
        setStudentsMap(prev => ({ ...prev, [selectedId]: res.data.map(u => ({ id: u.id, name: `${u.first_name} ${u.last_name}`.trim() || u.username, email: u.email })) }))
      }
    } catch {
      setStudentsMap(prev => ({ ...prev, [selectedId]: [] }))
    } finally {
      setStudentsLoading(false)
    }
  }
  async function handleAward(diploma, selectedSet, previousRecipients) {
    const prevIds  = new Set(previousRecipients.map(r => r.id))
    const toAdd    = [...selectedSet].filter(uid => !prevIds.has(uid))
    const toRevoke = [...prevIds].filter(uid => !selectedSet.has(uid))
    setAwardSaving(true)
    try {
      let updated = diploma
      if (toAdd.length) { const { data } = await awardCourseDiploma(selectedId, diploma.id, { user_ids: toAdd }); updated = data }
      for (const uid of toRevoke) { const { data } = await revokeCourseDiploma(selectedId, diploma.id, uid); updated = data }
      setDetailDiplomas(d => d.map(x => x.id === diploma.id ? updated : x))
      setAwardModal(null)
    } catch {
      // keep modal open so user knows something went wrong
    } finally {
      setAwardSaving(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="courses-adm-page">
      <div className="courses-adm-layout">
        <NavBar />

        <div className="ca-body">

          {/* ── Left sidebar ── */}
          <aside className="ca-sidebar">
            <div className="ca-sidebar-top">
              <div className="ca-sidebar-header-row">
                <span className="ca-sidebar-title">Courses</span>
                <button className="ca-sidebar-new-btn" onClick={openCreateCourse}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  New
                </button>
              </div>
              <div className="ca-sidebar-search">
                <svg className="ca-sidebar-search-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  className="ca-sidebar-search-input"
                  placeholder="Search courses…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="ca-status-filter">
                {['all', 'published', 'draft'].map(s => (
                  <button
                    key={s}
                    className={`ca-status-btn${statusFilter === s ? ' ca-status-btn--active' : ''}`}
                    onClick={() => setStatusFilter(s)}
                  >
                    {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="ca-course-list">
              {loadingList ? (
                <div className="ca-list-state">Loading…</div>
              ) : filteredCourses.length === 0 ? (
                <div className="ca-list-state">No courses found.</div>
              ) : (
                filteredCourses.map((c, i) => (
                  <div
                    key={c.id}
                    className={`ca-course-item${selectedId === c.id ? ' ca-course-item--active' : ''}`}
                    style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
                    onClick={() => selectCourse(c.id)}
                  >
                    <div className="ca-course-item-row">
                      <span className="ca-course-item-title">{c.title}</span>
                      <span className={`course-status-badge course-status-badge--${c.status}`}>{c.status}</span>
                    </div>
                    <span className="ca-course-item-meta">
                      {c.modules?.length ?? 0} modules · {c.author_name}
                    </span>
                    {(c.departments?.length ?? 0) > 0 ? (
                      <div className="ca-course-item-depts">
                        {c.departments.map(d => (
                          <span key={d.id} className="ca-course-item-dept-chip">{d.name}</span>
                        ))}
                      </div>
                    ) : (
                      <span className="ca-course-item-no-dept">No departments</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </aside>

          {/* ── Right panel ── */}
          <div className="ca-right">
            {!selectedId ? (
              <div className="ca-right-empty">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                </svg>
                <p>Select a course or create one</p>
              </div>
            ) : loadingDetail ? (
              <div className="ca-right-empty"><p>Loading…</p></div>
            ) : (
              <>
                {/* Topbar */}
                <div className="ca-topbar">
                  <div className="ca-topbar-left">
                    <h2 className="ca-topbar-title">{selectedCourse?.title}</h2>
                    {selectedCourse && <StatusBadge status={selectedCourse.status} />}
                  </div>
                  <div className="ca-topbar-right">
                    <button
                      className={`ca-publish-btn${selectedCourse?.status === 'published' ? ' ca-publish-btn--active' : ''}`}
                      onClick={togglePublish}
                    >
                      {selectedCourse?.status === 'published' ? 'Unpublish' : 'Publish'}
                    </button>
                    <button className="ca-action-btn" onClick={() => openEditCourse(selectedCourse)}>Edit</button>
                    <button className="ca-action-btn ca-action-btn--danger" onClick={() => setDeleteTarget(selectedCourse)}>Delete</button>
                  </div>
                </div>

                {/* Tab bar */}
                <div className="ca-tab-bar">
                  <div className="ca-tab-left">
                    <button
                      className={`ca-tab${rightTab === 'modules' ? ' ca-tab--active' : ''}`}
                      onClick={() => setRightTab('modules')}
                    >
                      Modules
                      <span className="ca-tab-count">{detail?.modules?.length ?? 0}</span>
                    </button>
                    <button
                      className={`ca-tab${rightTab === 'diplomas' ? ' ca-tab--active' : ''}`}
                      onClick={() => setRightTab('diplomas')}
                    >
                      Diplomas
                      <span className="ca-tab-count">{detail?.diplomas?.length ?? 0}</span>
                    </button>
                  </div>
                  <div className="ca-tab-right">
                    {rightTab === 'modules' && (
                      <button className="ca-tab-action-btn" onClick={() => setBankOpen(true)}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                        </svg>
                        Module Bank
                      </button>
                    )}
                    {rightTab === 'diplomas' && (
                      <button className="ca-tab-action-btn" onClick={openCreateDiploma}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        New Diploma
                      </button>
                    )}
                  </div>
                </div>

                {/* Department assignment row */}
                <div className="ca-dept-row">
                  <span className="ca-dept-row-label">Departments</span>
                  {(selectedCourse?.departments?.length ?? 0) > 0 ? (
                    selectedCourse.departments.map(d => (
                      <span key={d.id} className="ca-dept-row-chip">{d.name}</span>
                    ))
                  ) : (
                    <span className="ca-dept-row-empty">Not assigned to any department</span>
                  )}
                </div>

                {/* Panel body */}
                <div className="ca-panel-body">
                  {rightTab === 'modules' && (
                    <>
                      {/* Add-type toggle */}
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
                          <button
                            className="crd-add-tab crd-add-tab--create"
                            onClick={openCreateModule}
                          >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="12" y1="5" x2="12" y2="19"/>
                              <line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                            New Module
                          </button>
                          <button
                            className="crd-add-tab crd-add-tab--create"
                            onClick={openCreateTestPanel}
                          >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="12" y1="5" x2="12" y2="19"/>
                              <line x1="5" y1="12" x2="19" y2="12"/>
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
                                <>
                                  {classSpecificModules.length > 0 && (
                                    <>
                                      <div className="crd-module-group-label">
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                                          <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                                        </svg>
                                        Department lessons
                                      </div>
                                      {classSpecificModules.slice(0, 6).map(l => (
                                        <button key={l.id} className="crd-module-option" onMouseDown={() => handleAddModule(l)}>
                                          <span className="crd-module-option-title">{l.title}</span>
                                          <span className="crd-module-badge crd-module-badge--class">Department</span>
                                        </button>
                                      ))}
                                    </>
                                  )}
                                  {publicModules.length > 0 && (
                                    <>
                                      <div className="crd-module-group-label">
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                                        </svg>
                                        Public modules
                                      </div>
                                      {publicModules.slice(0, 6).map(l => (
                                        <button key={l.id} className="crd-module-option" onMouseDown={() => handleAddModule(l)}>
                                          <span className="crd-module-option-title">{l.title}</span>
                                          <span className="crd-module-badge crd-module-badge--public">Public</span>
                                        </button>
                                      ))}
                                    </>
                                  )}
                                </>
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

                      {/* Module list */}
                      <div className="crd-modules-list">
                        {(detail?.modules?.length ?? 0) === 0 ? (
                          <p className="crd-empty-msg">No modules added yet. Use the search above or open Module Bank.</p>
                        ) : (
                          detail.modules.map((entry, index) => (
                            <CourseItemRow
                              key={entry.id}
                              entry={entry}
                              index={index}
                              dragOverIndex={dragOverIdx}
                              onRemove={handleRemoveCourseModule}
                              onNavigate={e => e.test ? navigate('/admin/tests', { state: { openTestId: e.test } }) : navigate(`/admin/modules/${e.module}/panels`)}
                              onDragStart={i => setDragIdx(i)}
                              onDragOver={i => setDragOverIdx(i)}
                              onDrop={handleDrop}
                              onDragEnd={() => { setDragIdx(null); setDragOverIdx(null) }}
                            />
                          ))
                        )}
                      </div>
                    </>
                  )}

                  {rightTab === 'diplomas' && (
                    <>
                      {(detail?.diplomas?.length ?? 0) === 0 ? (
                        <p className="crd-empty-msg">No diplomas created yet.</p>
                      ) : (
                        <div className="crd-diplomas-list">
                          {detail.diplomas.map(d => (
                            <DiplomaCard
                              key={d.id}
                              diploma={d}
                              onEdit={openEditDiploma}
                              onDelete={setDiplomaDeleteTarget}
                              onAward={openAwardModal}
                            />
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Module bank slide-out ── */}
      {bankOpen && (
        <>
          <div className="ca-bank-backdrop" onClick={() => setBankOpen(false)} />
          <aside className="ca-bank">
            <div className="ca-bank-header">
              <span className="ca-bank-title">Module Bank</span>
              <button className="ca-bank-close" onClick={() => setBankOpen(false)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="ca-bank-search-wrap">
              <input
                className="ca-bank-search-input"
                placeholder="Search modules…"
                value={bankSearch}
                onChange={e => setBankSearch(e.target.value)}
              />
            </div>

            <div className="ca-bank-dep-filter">
              <button
                className={`ca-bank-dep-btn${bankDepFilter === 'all' ? ' ca-bank-dep-btn--active' : ''}`}
                onClick={() => setBankDepFilter('all')}
              >
                All
              </button>
              {departments.map(d => (
                <button
                  key={d.id}
                  className={`ca-bank-dep-btn${bankDepFilter === d.id ? ' ca-bank-dep-btn--active' : ''}`}
                  onClick={() => setBankDepFilter(d.id)}
                >
                  {d.name}
                </button>
              ))}
            </div>

            <div className="ca-bank-list">
              {filteredBank.length === 0 ? (
                <p className="ca-bank-empty">No modules match your filters.</p>
              ) : (
                filteredBank.map(mod => {
                  const isAdded = addedModuleIds.includes(mod.id)
                  return (
                    <div key={mod.id} className={`ca-bank-row${isAdded ? ' ca-bank-row--added' : ''}`}>
                      <div className="ca-bank-row-info">
                        <span className="ca-bank-row-title">{mod.title}</span>
                        <span className="ca-bank-row-meta">{mod.duration} · {mod.difficulty}</span>
                      </div>
                      <div className="ca-bank-row-actions">
                        <button
                          className={`ca-bank-add-btn${isAdded ? ' ca-bank-add-btn--added' : ''}`}
                          onClick={() => handleAddModuleFromBank(mod)}
                          disabled={isAdded}
                          title={isAdded ? 'Already in course' : 'Add to course'}
                        >
                          {isAdded ? (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 6L9 17l-5-5"/>
                            </svg>
                          ) : (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                          )}
                        </button>
                        <button className="ca-bank-icon-btn" onClick={() => navigate(`/admin/modules/${mod.id}/panels`)} title="View panels">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                          </svg>
                        </button>
                        <button className="ca-bank-icon-btn" onClick={() => openEditModule(mod)} title="Edit module">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button className="ca-bank-icon-btn ca-bank-icon-btn--danger" onClick={() => setModuleDeleteTarget(mod)} title="Delete module">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            <div className="ca-bank-footer">
              <button className="ca-bank-create-btn" onClick={openCreateModule}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Create New Module
              </button>
            </div>
          </aside>
        </>
      )}

      {/* ── Module form panel ── */}
      {modulePanel !== null && (
        <ModuleFormPanel
          mode={modulePanel === 'create' ? 'create' : 'edit'}
          form={moduleForm}
          onChange={handleModuleFormChange}
          onClose={() => setModulePanel(null)}
          onSave={modulePanel === 'create' ? handleCreateModule : handleUpdateModule}
          difficulties={DIFFICULTIES}
          departments={departments}
          organisations={organisations}
        />
      )}

      {/* ── Test create panel ── */}
      {testCreatePanel && (
        <TestFormPanel
          form={testCreateForm}
          onChange={handleTestCreateFormChange}
          onClose={() => setTestCreatePanel(false)}
          onSave={handleCreateTestFromPanel}
          departments={departments}
        />
      )}

      {/* ── Module delete modal ── */}
      {moduleDeleteTarget && (
        <ModuleDeleteModal
          target={moduleDeleteTarget}
          onClose={() => setModuleDeleteTarget(null)}
          onConfirm={executeDeleteModule}
        />
      )}

      {/* ── Course form modal ── */}
      {courseModal !== null && (
        <CourseFormModal
          mode={courseModal === 'create' ? 'create' : 'edit'}
          form={courseForm}
          errors={courseFormErrors}
          departments={departments}
          trainers={trainers}
          onChange={handleCourseFormChange}
          onClose={() => { setCourseModal(null); setCourseFormErrors({}) }}
          onSave={handleSaveCourse}
        />
      )}

      {/* ── Delete course confirm ── */}
      {deleteTarget && (
        <div className="modal-backdrop" onClick={() => setDeleteTarget(null)}>
          <div className="modal-card modal-card--sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Delete Course</span>
              <button className="modal-close" onClick={() => setDeleteTarget(null)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <p className="delete-confirm-text">
                Delete <strong>{deleteTarget.title}</strong>? This will also remove all diplomas tied to it. This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn-danger" onClick={executeDeleteCourse}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Diploma form modal ── */}
      {diplomaModal !== null && (
        <DiplomaFormModal
          mode={diplomaModal === 'create' ? 'create' : 'edit'}
          form={diplomaForm}
          errors={diplomaErrors}
          courses={courses.map(c => ({ id: c.id, title: c.title }))}
          saving={diplomaSaving}
          onChange={handleDiplomaFormChange}
          onClose={() => { if (!diplomaSaving) { setDiplomaModal(null); setDiplomaErrors({}) } }}
          onSave={handleDiplomaSave}
        />
      )}

      {/* ── Award modal ── */}
      {awardModal && (
        <AwardDiplomaModal
          diploma={awardModal}
          students={students}
          studentsLoading={studentsLoading}
          saving={awardSaving}
          onClose={() => { if (!awardSaving) setAwardModal(null) }}
          onAward={handleAward}
        />
      )}

      {/* ── Diploma delete confirm ── */}
      {diplomaDeleteTarget && (
        <div className="crd-modal-backdrop" onClick={() => setDiplomaDeleteTarget(null)}>
          <div className="crd-modal-card crd-modal-card--sm" onClick={e => e.stopPropagation()}>
            <div className="crd-modal-header">
              <span className="crd-modal-title">Delete Diploma</span>
              <button className="crd-modal-close" onClick={() => setDiplomaDeleteTarget(null)}>✕</button>
            </div>
            <div className="crd-modal-body">
              <p className="crd-delete-confirm-text">
                Delete <strong>{diplomaDeleteTarget.title}</strong>? All awards will be revoked. This cannot be undone.
              </p>
            </div>
            <div className="crd-modal-footer">
              <button className="crd-btn-ghost" onClick={() => setDiplomaDeleteTarget(null)}>Cancel</button>
              <button className="crd-btn-danger" onClick={handleDiplomaDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
