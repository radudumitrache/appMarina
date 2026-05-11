import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '../../components/teacher/NavBar'
import ClassesHeader from '../../components/teacher/classes/ClassesHeader'
import ClassesStats from '../../components/teacher/classes/ClassesStats'
import ClassesToolbar from '../../components/teacher/classes/ClassesToolbar'
import ClassesGrid from '../../components/teacher/classes/ClassesGrid'
import ClassFormModal from '../../components/teacher/classes/ClassFormModal'
import DeleteConfirmModal from '../../components/admin/classes/DeleteConfirmModal'
import { getClasses, createClass, deleteClass } from '../../api/classes'
import '../css/teacher/Classes.css'

const EMPTY_FORM = {
  name: '', code: '', subject: '',
  semester: '', start_date: '', end_date: '', status: 'active',
}

export default function Classes() {
  const navigate = useNavigate()
  const [classes, setClasses]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [tab, setTab]               = useState('all')
  const [search, setSearch]         = useState('')
  const [showModal, setShowModal]     = useState(false)
  const [form, setForm]               = useState(EMPTY_FORM)
  const [formErrors, setFormErrors]   = useState({})
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    getClasses()
      .then(({ data }) => setClasses(data.map(cls => ({
        ...cls,
        students:     cls.student_count,
        lessonsTotal: cls.lesson_count,
        lessonsDone:  0,
      }))))
      .finally(() => setLoading(false))
  }, [])

  const filtered = classes
    .filter(c => tab === 'all' || c.status === tab)
    .filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase().trim()) ||
      (c.subject || '').toLowerCase().includes(search.toLowerCase().trim())
    )

  const openCreate = () => { setForm(EMPTY_FORM); setFormErrors({}); setShowModal(true) }
  const closeModal = () => { setShowModal(false); setFormErrors({}) }

  const executeDelete = async () => {
    try {
      await deleteClass(deleteTarget.id)
      setClasses(prev => prev.filter(c => c.id !== deleteTarget.id))
    } catch {}
    setDeleteTarget(null)
  }

  const handleFormChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }))
    setFormErrors(e => { const n = { ...e }; delete n[field]; return n })
  }

  const handleSave = async () => {
    const clientErrors = {}
    if (!form.name.trim())     clientErrors.name       = 'Class name is required.'
    if (!form.code.trim())     clientErrors.code       = 'Class code is required.'
    if (!form.subject.trim())  clientErrors.subject    = 'Subject is required.'
    if (!form.semester.trim()) clientErrors.semester   = 'Semester is required.'
    if (!form.start_date)      clientErrors.start_date = 'Start date is required.'
    if (!form.end_date)        clientErrors.end_date   = 'End date is required.'
    if (Object.keys(clientErrors).length) { setFormErrors(clientErrors); return }

    setFormErrors({})
    try {
      const { data } = await createClass(form)
      setClasses(prev => [{ ...data, students: data.student_count, lessonsTotal: data.lesson_count, lessonsDone: 0 }, ...prev])
      closeModal()
    } catch (err) {
      const d = err?.response?.data
      if (d && typeof d === 'object' && !Array.isArray(d)) {
        setFormErrors(Object.fromEntries(Object.entries(d).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])))
      } else {
        setFormErrors({ non_field_errors: 'Something went wrong. Please try again.' })
      }
    }
  }

  const totalStudents = classes.reduce((sum, c) => sum + c.student_count, 0)
  const activeCount   = classes.filter(c => c.status === 'active').length
  const avgProgress   = 0

  return (
    <>
    <div className="classes-page">
      <div className="classes-layout">
        <NavBar />

        <ClassesHeader onCreateNew={openCreate} />

        <div className="classes-content">
          <ClassesStats
            totalClasses={classes.length}
            totalStudents={totalStudents}
            activeCount={activeCount}
            avgProgress={avgProgress}
          />

          <ClassesToolbar
            classes={classes}
            tab={tab}
            onTabChange={setTab}
            search={search}
            onSearchChange={setSearch}
          />

          <ClassesGrid
            loading={loading}
            classes={filtered}
            onView={cls => navigate(`/teacher/classes/${cls.id}`)}
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
