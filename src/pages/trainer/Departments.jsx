import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '../../components/trainer/NavBar'
import ClassesHeader from '../../components/trainer/classes/ClassesHeader'
import ClassesStats from '../../components/trainer/classes/ClassesStats'
import ClassesToolbar from '../../components/trainer/classes/ClassesToolbar'
import ClassesGrid from '../../components/trainer/classes/ClassesGrid'
import ClassFormModal from '../../components/trainer/classes/ClassFormModal'
import DeleteConfirmModal from '../../components/admin/classes/DeleteConfirmModal'
import { getDepartments, createDepartment, deleteDepartment } from '../../api/departments'
import '../css/trainer/Classes.css'

const EMPTY_FORM = {
  name: '', code: '', subject: '',
  start_date: '', end_date: '', status: 'active',
}

export default function Departments() {
  const navigate = useNavigate()
  const [departments, setDepartments]       = useState([])
  const [loading, setLoading]               = useState(true)
  const [tab, setTab]                       = useState('all')
  const [search, setSearch]                 = useState('')
  const [showModal, setShowModal]           = useState(false)
  const [form, setForm]                     = useState(EMPTY_FORM)
  const [formErrors, setFormErrors]         = useState({})
  const [deleteTarget, setDeleteTarget]     = useState(null)
  const [saving, setSaving]                 = useState(false)

  useEffect(() => {
    getDepartments()
      .then(({ data }) => setDepartments(data.map(dep => ({
        ...dep,
        students:      dep.student_count,
        coursesTotal:  dep.course_count,
        modulesTotal:  dep.module_count,
        modulesDone:   0,
      }))))
      .finally(() => setLoading(false))
  }, [])

  const filtered = departments
    .filter(c => tab === 'all' || c.status === tab)
    .filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase().trim()) ||
      (c.subject || '').toLowerCase().includes(search.toLowerCase().trim())
    )

  const openCreate = () => { setForm(EMPTY_FORM); setFormErrors({}); setShowModal(true) }
  const closeModal = () => { if (saving) return; setShowModal(false); setFormErrors({}) }

  const executeDelete = async () => {
    try {
      await deleteDepartment(deleteTarget.id)
      setDepartments(prev => prev.filter(c => c.id !== deleteTarget.id))
    } catch {}
    setDeleteTarget(null)
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

    const nameTaken = departments.some(c => c.name.trim().toLowerCase() === form.name.trim().toLowerCase())
    const codeTaken = departments.some(c => c.code.trim().toLowerCase() === form.code.trim().toLowerCase())
    if (nameTaken) clientErrors.name = 'A department with this name already exists.'
    if (codeTaken) clientErrors.code = 'A department with this code already exists.'

    if (Object.keys(clientErrors).length) { setFormErrors(clientErrors); return }

    setFormErrors({})
    setSaving(true)
    try {
      const { data } = await createDepartment(form)
      setDepartments(prev => [{ ...data, students: data.student_count, coursesTotal: data.course_count, modulesTotal: data.module_count, modulesDone: 0 }, ...prev])
      closeModal()
    } catch (err) {
      const d = err?.response?.data
      if (d && typeof d === 'object' && !Array.isArray(d)) {
        setFormErrors(Object.fromEntries(Object.entries(d).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])))
      } else {
        setFormErrors({ non_field_errors: 'Something went wrong. Please try again.' })
      }
    } finally {
      setSaving(false)
    }
  }

  const totalStudents = departments.reduce((sum, c) => sum + c.student_count, 0)
  const activeCount   = departments.filter(c => c.status === 'active').length
  const avgProgress   = 0

  return (
    <>
    <div className="classes-page">
      <div className="classes-layout">
        <NavBar />

        <ClassesHeader onCreateNew={openCreate} />

        <div className="classes-content">
          <ClassesStats
            totalClasses={departments.length}
            totalStudents={totalStudents}
            activeCount={activeCount}
            avgProgress={avgProgress}
          />

          <ClassesToolbar
            classes={departments}
            tab={tab}
            onTabChange={setTab}
            search={search}
            onSearchChange={setSearch}
          />

          <ClassesGrid
            loading={loading}
            classes={filtered}
            onView={dep => navigate(`/trainer/departments/${dep.id}`)}
            onDelete={setDeleteTarget}
          />
        </div>
      </div>
    </div>

    {showModal && (
      <ClassFormModal
        form={form}
        errors={formErrors}
        onChange={handleFormChange}
        onClose={closeModal}
        onSave={handleSave}
        saving={saving}
      />
    )}
    {deleteTarget && (
      <DeleteConfirmModal
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={executeDelete}
      />
    )}
    </>
  )
}
