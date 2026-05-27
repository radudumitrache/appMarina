import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import NavBar from '../../components/admin/NavBar'
import { getCourses, createCourse, updateCourse, deleteCourse } from '../../api/lessons'
import { getDepartments } from '../../api/departments'
import { getTeachers } from '../../api/admin'
import '../css/admin/Courses.css'

const EMPTY_FORM = { title: '', description: '', department_id: '', status: 'draft', author_id: '' }

function CourseFormModal({ mode, form, errors, departments, teachers, onChange, onClose, onSave }) {
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
              className={`form-input form-textarea${errors.description ? ' form-input--error' : ''}`}
              placeholder="Brief description of this course…"
              value={form.description}
              onChange={e => onChange('description', e.target.value)}
              rows={3}
            />
            {errors.description && <span className="form-error">{errors.description}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Department (optional)</label>
            <select
              className="form-input form-select"
              value={form.department_id}
              onChange={e => onChange('department_id', e.target.value)}
            >
              <option value="">— Organisation-wide —</option>
              {departments.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Author</label>
            <select
              className="form-input form-select"
              value={form.author_id}
              onChange={e => onChange('author_id', e.target.value)}
            >
              <option value="">— Assign to me —</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>
                  {t.first_name || t.last_name ? `${t.first_name} ${t.last_name}`.trim() : t.username}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="form-input form-select"
              value={form.status}
              onChange={e => onChange('status', e.target.value)}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          {errors.non_field_errors && (
            <p className="form-error">{errors.non_field_errors}</p>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={onSave}>
            {mode === 'create' ? 'Create Course' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

function DeleteConfirmModal({ target, onClose, onConfirm }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card modal-card--sm" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Delete Course</span>
          <button className="modal-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="modal-body">
          <p className="delete-confirm-text">
            Delete <strong>{target.title}</strong>? This will also remove all diplomas tied to it. This action cannot be undone.
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-danger" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  )
}

function CourseCard({ course, onEdit, onDelete, onManage, index }) {
  const style = { animationDelay: `${Math.min(index, 6) * 0.04}s` }

  return (
    <div className="course-card" style={style}>
      <div className="course-card-top">
        <div className="course-card-info">
          <span className={`course-status-badge course-status-badge--${course.status}`}>
            {course.status}
          </span>
          <h3 className="course-card-title">{course.title}</h3>
          {course.description && (
            <p className="course-card-desc">{course.description}</p>
          )}
        </div>
      </div>

      <div className="course-card-meta">
        {course.department_name
          ? <span className="course-meta-item">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
              {course.department_name}
            </span>
          : <span className="course-meta-item course-meta-item--org">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              Organisation-wide
            </span>
        }
        <span className="course-meta-item">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
          {course.lessons?.length ?? 0} lessons
        </span>
        <span className="course-meta-item">By {course.author_name}</span>
      </div>

      <div className="course-card-actions">
        <button className="course-action-btn course-action-btn--primary" onClick={() => onManage(course)}>
          Manage
        </button>
        <button className="course-action-btn" onClick={() => onEdit(course)}>Edit</button>
        <button className="course-action-btn course-action-btn--danger" onClick={() => onDelete(course)}>Delete</button>
      </div>
    </div>
  )
}

export default function Courses() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [courses, setCourses]       = useState([])
  const [departments, setDepartments] = useState([])
  const [teachers, setTeachers]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [statusFilter, setStatus]   = useState('all')
  const [modal, setModal]           = useState(null)
  const [form, setForm]             = useState(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState({})
  const [deleteTarget, setDelete]   = useState(null)

  useEffect(() => {
    Promise.all([getCourses(), getDepartments(), getTeachers()])
      .then(([cRes, clRes, tRes]) => {
        setCourses(cRes.data)
        setDepartments(clRes.data)
        setTeachers(tRes.data?.results ?? tRes.data ?? [])
      })
      .finally(() => setLoading(false))
  }, [])

  const filtered = courses.filter(c => {
    const q = search.toLowerCase()
    const matchSearch = (c.title || '').toLowerCase().includes(q) ||
      (c.description || '').toLowerCase().includes(q) ||
      (c.department_name || '').toLowerCase().includes(q)
    const matchStatus = statusFilter === 'all' || c.status === statusFilter
    return matchSearch && matchStatus
  })

  const stats = {
    total:     courses.length,
    published: courses.filter(c => c.status === 'published').length,
    draft:     courses.filter(c => c.status === 'draft').length,
  }

  const openCreate = () => { setForm(EMPTY_FORM); setFormErrors({}); setModal('create') }
  const openEdit   = course => {
    setForm({
      title:        course.title,
      description:  course.description || '',
      department_id: course.department_id ?? '',
      status:       course.status,
      author_id:    course.author ?? '',
    })
    setFormErrors({})
    setModal(course)
  }

  const handleFormChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }))
    setFormErrors(e => { const n = { ...e }; delete n[field]; return n })
  }

  const handleSave = async () => {
    const errs = {}
    if (!form.title.trim()) errs.title = 'Title is required.'
    if (Object.keys(errs).length) { setFormErrors(errs); return }
    setFormErrors({})
    const payload = {
      title:        form.title.trim(),
      description:  form.description.trim(),
      status:       form.status,
      department_id: form.department_id ? Number(form.department_id) : null,
      ...(form.author_id ? { author_id: Number(form.author_id) } : {}),
    }
    try {
      if (modal === 'create') {
        const { data } = await createCourse(payload)
        setCourses(prev => [data, ...prev])
      } else {
        const { data } = await updateCourse(modal.id, payload)
        setCourses(prev => prev.map(c => c.id === modal.id ? data : c))
      }
      setModal(null)
    } catch (err) {
      const data = err?.response?.data
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        setFormErrors(Object.fromEntries(
          Object.entries(data).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])
        ))
      } else {
        setFormErrors({ non_field_errors: 'Something went wrong. Please try again.' })
      }
    }
  }

  const executeDelete = async () => {
    try {
      await deleteCourse(deleteTarget.id)
      setCourses(prev => prev.filter(c => c.id !== deleteTarget.id))
    } catch {}
    setDelete(null)
  }

  return (
    <div className="courses-adm-page">
      <div className="courses-adm-layout">
        <NavBar />

        <div className="courses-adm-header">
          <div className="courses-adm-header-left">
            <h1 className="courses-adm-title">Courses</h1>
            <span className="courses-adm-count">{filtered.length} courses</span>
          </div>
          <div className="courses-adm-header-right">
            <div className="search-wrap-inline">
              <svg className="search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                className="search-input-inline"
                type="text"
                placeholder="Search courses…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="courses-status-filter">
              {['all', 'published', 'draft'].map(s => (
                <button
                  key={s}
                  className={`status-filter-btn${statusFilter === s ? ' status-filter-btn--active' : ''}`}
                  onClick={() => setStatus(s)}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
            <button className="btn-primary" onClick={openCreate}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New Course
            </button>
          </div>
        </div>

        <div className="courses-adm-stats">
          <div className="course-stat-card">
            <span className="course-stat-value">{stats.total}</span>
            <span className="course-stat-label">Total</span>
          </div>
          <div className="course-stat-card">
            <span className="course-stat-value course-stat-value--published">{stats.published}</span>
            <span className="course-stat-label">Published</span>
          </div>
          <div className="course-stat-card">
            <span className="course-stat-value course-stat-value--draft">{stats.draft}</span>
            <span className="course-stat-label">Draft</span>
          </div>
        </div>

        <div className="courses-adm-main">
          {loading ? (
            <div className="courses-grid">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="course-card course-card--skeleton" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="courses-empty">No courses found.</p>
          ) : (
            <div className="courses-grid">
              {filtered.map((course, i) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  index={i}
                  onManage={c => navigate(`/admin/courses/${c.id}`)}
                  onEdit={openEdit}
                  onDelete={setDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {modal !== null && (
        <CourseFormModal
          mode={modal === 'create' ? 'create' : 'edit'}
          form={form}
          errors={formErrors}
          departments={departments}
          teachers={teachers}
          onChange={handleFormChange}
          onClose={() => { setModal(null); setFormErrors({}) }}
          onSave={handleSave}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          target={deleteTarget}
          onClose={() => setDelete(null)}
          onConfirm={executeDelete}
        />
      )}
    </div>
  )
}
