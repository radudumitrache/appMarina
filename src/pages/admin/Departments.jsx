import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '../../components/admin/NavBar'
import ClassesHeader from '../../components/admin/classes/ClassesHeader'
import ClassesStats from '../../components/admin/classes/ClassesStats'
import ClassesSection from '../../components/admin/classes/ClassesSection'
import ClassFormModal from '../../components/admin/classes/ClassFormModal'
import DeleteConfirmModal from '../../components/admin/classes/DeleteConfirmModal'
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from '../../api/departments'
import { getTeachers } from '../../api/admin'
import '../css/admin/Classes.css'

const EMPTY_FORM = {
  name: '', code: '', subject: '', teacher: null,
  start_date: '', end_date: '', status: 'active',
}

export default function Departments() {
  const navigate = useNavigate()
  const [departments, setDepartments]        = useState([])
  const [teachers, setTeachers]              = useState([])
  const [loading, setLoading]                = useState(true)
  const [search, setSearch]                  = useState('')
  const [statusFilter, setStatusFilter]      = useState('all')
  const [modal, setModal]                    = useState(null)
  const [form, setForm]                      = useState(EMPTY_FORM)
  const [formErrors, setFormErrors]          = useState({})
  const [deleteTarget, setDeleteTarget]      = useState(null)

  useEffect(() => {
    Promise.all([getDepartments(), getTeachers()])
      .then(([clsRes, tchRes]) => {
        setDepartments(clsRes.data)
        setTeachers(tchRes.data)
      })
      .finally(() => setLoading(false))
  }, [])

  const matchesSearch = c => {
    const q = search.toLowerCase()
    return (
      (c.name        || '').toLowerCase().includes(q) ||
      (c.code        || '').toLowerCase().includes(q) ||
      (c.subject     || '').toLowerCase().includes(q) ||
      (c.teacher_name || '').toLowerCase().includes(q)
    )
  }

  const activeDepartments   = departments.filter(c => c.status === 'active'   && matchesSearch(c))
  const archivedDepartments = departments.filter(c => c.status === 'archived' && matchesSearch(c))

  const stats = {
    total:    departments.length,
    active:   departments.filter(c => c.status === 'active').length,
    archived: departments.filter(c => c.status === 'archived').length,
    students: departments.reduce((sum, c) => sum + (c.student_count || 0), 0),
  }

  const openCreate = () => { setForm(EMPTY_FORM); setFormErrors({}); setModal('create') }
  const openEdit   = cls => {
    setForm({
      name:       cls.name,
      code:       cls.code,
      subject:    cls.subject,
      teacher:    cls.teacher,
      start_date: cls.start_date,
      end_date:   cls.end_date,
      status:     cls.status,
    })
    setFormErrors({})
    setModal(cls)
  }

  const handleFormChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }))
    setFormErrors(e => { const n = { ...e }; delete n[field]; return n })
  }

  const handleSave = async () => {
    const clientErrors = {}
    if (!form.name.trim())     clientErrors.name       = 'Department name is required.'
    if (!form.code.trim())     clientErrors.code       = 'Department code is required.'
    if (!form.subject.trim())  clientErrors.subject    = 'Subject is required.'
    if (!form.start_date)      clientErrors.start_date = 'Start date is required.'
    if (!form.end_date)        clientErrors.end_date   = 'End date is required.'
    if (modal === 'create' && !form.teacher) clientErrors.teacher = 'Please select a teacher.'
    if (Object.keys(clientErrors).length) { setFormErrors(clientErrors); return }
    setFormErrors({})
    try {
      if (modal === 'create') {
        const { data } = await createDepartment(form)
        setDepartments(prev => [data, ...prev])
      } else {
        const { data } = await updateDepartment(modal.id, form)
        setDepartments(prev => prev.map(c => c.id === modal.id ? data : c))
      }
      setModal(null)
    } catch (err) {
      const data = err?.response?.data
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        setFormErrors(
          Object.fromEntries(
            Object.entries(data).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])
          )
        )
      } else {
        setFormErrors({ non_field_errors: 'Something went wrong. Please try again.' })
      }
    }
  }

  const toggleArchive = async id => {
    const dep = departments.find(c => c.id === id)
    if (!dep) return
    const newStatus = dep.status === 'active' ? 'archived' : 'active'
    setDepartments(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c))
    try {
      const { data } = await updateDepartment(id, { status: newStatus })
      setDepartments(prev => prev.map(c => c.id === id ? data : c))
    } catch {
      setDepartments(prev => prev.map(c => c.id === id ? dep : c))
    }
  }

  const executeDelete = async () => {
    try {
      await deleteDepartment(deleteTarget.id)
      setDepartments(prev => prev.filter(c => c.id !== deleteTarget.id))
    } catch {}
    setDeleteTarget(null)
  }

  const sectionHandlers = {
    onManage:        cls => navigate(`/admin/departments/${cls.id}`),
    onEdit:          openEdit,
    onToggleArchive: toggleArchive,
    onDelete:        cls => setDeleteTarget(cls),
  }

  const showBoth     = statusFilter === 'all'
  const showActive   = statusFilter === 'active'
  const showArchived = statusFilter === 'archived'

  const filteredCount = showBoth
    ? activeDepartments.length + archivedDepartments.length
    : showActive ? activeDepartments.length : archivedDepartments.length

  return (
    <div className="classes-adm-page">
      <div className="classes-adm-layout">
        <NavBar />

        <ClassesHeader
          filteredCount={filteredCount}
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onCreateNew={openCreate}
        />

        <ClassesStats stats={stats} />

        <div className="classes-adm-main">
          {showBoth && (
            <>
              <ClassesSection
                title="Active"
                classes={activeDepartments}
                startIndex={0}
                loading={loading}
                skeletonCount={3}
                {...sectionHandlers}
              />
              {(loading || archivedDepartments.length > 0) && (
                <ClassesSection
                  title="Archived"
                  classes={archivedDepartments}
                  startIndex={activeDepartments.length}
                  loading={loading}
                  skeletonCount={1}
                  {...sectionHandlers}
                />
              )}
            </>
          )}

          {showActive && (
            <ClassesSection
              title="Active"
              classes={activeDepartments}
              startIndex={0}
              loading={loading}
              skeletonCount={4}
              {...sectionHandlers}
            />
          )}

          {showArchived && (
            <ClassesSection
              title="Archived"
              classes={archivedDepartments}
              startIndex={0}
              loading={loading}
              skeletonCount={2}
              {...sectionHandlers}
            />
          )}
        </div>
      </div>

      {modal !== null && (
        <ClassFormModal
          mode={modal === 'create' ? 'create' : 'edit'}
          form={form}
          errors={formErrors}
          onChange={handleFormChange}
          onClose={() => { setModal(null); setFormErrors({}) }}
          onSave={handleSave}
          teachers={teachers}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          target={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={executeDelete}
        />
      )}
    </div>
  )
}
