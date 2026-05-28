import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '../../components/admin/NavBar'
import LessonsSidebar from '../../components/admin/lessons/LessonsSidebar'
import LessonsToolbar from '../../components/admin/lessons/LessonsToolbar'
import LessonRow from '../../components/admin/lessons/LessonRow'
import LessonFormPanel from '../../components/admin/lessons/LessonFormPanel'
import LessonDeleteModal from '../../components/admin/lessons/LessonDeleteModal'
import { getLessons, createLesson, updateLesson, deleteLesson } from '../../api/lessons'
import { getDepartments } from '../../api/departments'
import { getOrganisations } from '../../api/organisations'
import { useAuth } from '../../auth/AuthContext'
import Sk from '../../components/shared/Skeleton'
import '../css/admin/Lessons.css'

const DIFFICULTIES = ['easy', 'intermediate', 'advanced']

const EMPTY_FORM = {
  title: '', duration_minutes: 60,
  difficulty: 'intermediate', visibility: 'class', department: null, organisation_id: null,
}

function mapLesson(l) {
  return {
    id:               l.id,
    title:            l.title,
    duration:         `${l.duration_minutes} min`,
    duration_minutes: l.duration_minutes,
    difficulty:       l.difficulty,
    visibility:       l.visibility,
    author:           l.author_name ?? '',
    author_id:        l.author ?? null,
    locked:           l.locked,
    department_id:    l.department_id ?? null,
    organisation_id:  l.organisation_id ?? null,
  }
}

export default function Lessons() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [lessons, setLessons]               = useState([])
  const [organisations, setOrganisations]   = useState([])
  const [loading, setLoading]               = useState(true)
  const [search, setSearch]                 = useState('')
  const [visFilter, setVisFilter]           = useState('all')
  const [activeDepartment, setActiveDepartment] = useState('all')
  const [panel, setPanel]                   = useState(null)
  const [form, setForm]                     = useState(EMPTY_FORM)
  const [editTarget, setEditTarget]         = useState(null)
  const [deleteTarget, setDeleteTarget]     = useState(null)
  const [departments, setDepartments]       = useState([])
  const [sidebarOpen, setSidebarOpen]       = useState(false)

  useEffect(() => {
    getLessons()
      .then(({ data }) => setLessons(data.map(mapLesson)))
      .finally(() => setLoading(false))
    getDepartments().then(({ data }) => setDepartments(data)).catch(() => {})
    if (user?.is_staff) {
      getOrganisations().then(({ data }) => setOrganisations(data)).catch(() => {})
    }
  }, [])

  const filtered = lessons
    .filter(l => activeDepartment === 'all' || (activeDepartment === null ? !l.department_id : l.department_id === activeDepartment))
    .filter(l => visFilter === 'all' || l.visibility === visFilter)
    .filter(l => l.title.toLowerCase().includes(search.toLowerCase().trim()))

  const openCreate = () => { setForm(EMPTY_FORM); setPanel('create') }

  const openEdit = (lesson) => {
    setEditTarget(lesson)
    setForm({
      title:            lesson.title,
      duration_minutes: lesson.duration_minutes,
      difficulty:       lesson.difficulty,
      visibility:       lesson.visibility,
      department:       lesson.department_id ?? null,
      organisation_id:  lesson.organisation_id ?? null,
    })
    setPanel('edit')
  }

  const handleFormChange = (field, value) => setForm(f => ({ ...f, [field]: value }))

  const handleSave = async () => {
    if (!form.title.trim()) return
    try {
      const { data } = await createLesson(form)
      setLessons(prev => [mapLesson(data), ...prev])
      setPanel(null)
    } catch {}
  }

  const handleUpdate = async () => {
    if (!form.title.trim() || !editTarget) return
    try {
      const { data } = await updateLesson(editTarget.id, form)
      setLessons(prev => prev.map(l => l.id === editTarget.id ? mapLesson(data) : l))
      setPanel(null)
      setEditTarget(null)
    } catch {}
  }

  const executeDelete = async () => {
    try {
      await deleteLesson(deleteTarget.id)
      setLessons(prev => prev.filter(l => l.id !== deleteTarget.id))
    } catch {}
    setDeleteTarget(null)
  }

  return (
    <div className="lessons-adm-page">
      <div className="lessons-adm-layout">
        <NavBar />
        <div className="lessons-adm-body">
          {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
          <LessonsSidebar
            lessons={lessons}
            departments={departments}
            activeDepartment={activeDepartment}
            onDepartmentChange={(d) => { setActiveDepartment(d); setSidebarOpen(false) }}
            className={sidebarOpen ? 'sidebar--open' : ''}
          />

          <main className="lessons-adm-main">
            <button className="sidebar-toggle-btn" onClick={() => setSidebarOpen(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
              Filter
            </button>
            <LessonsToolbar
              title={activeDepartment === 'all' ? 'All Lessons' : activeDepartment === null ? 'Unassigned Lessons' : (departments.find(c => c.id === activeDepartment)?.name ?? 'Lessons')}
              filteredCount={filtered.length}
              search={search}
              onSearchChange={setSearch}
              statusFilter={visFilter}
              onStatusFilterChange={setVisFilter}
              onCreateNew={openCreate}
            />

            <div className="lessons-adm-list">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="lesson-row" style={{ opacity: 1 - i * 0.1, animation: 'none' }}>
                    <div className="lesson-row-main">
                      <Sk h={14} w={`${52 + (i % 3) * 8}%`} mb={8} />
                      <div className="lesson-row-meta">
                        <Sk h={18} w={72} r={4} />
                        <Sk h={11} w={48} />
                        <Sk h={11} w={70} />
                        <Sk h={11} w={90} />
                      </div>
                    </div>
                    <div className="lesson-row-right">
                      <Sk h={22} w={62} r={4} />
                    </div>
                  </div>
                ))
              ) : filtered.length === 0 ? (
                <p className="lessons-adm-empty">No lessons match your filters.</p>
              ) : (
                filtered.map((lesson, i) => {
                  const canEdit = user?.is_staff || lesson.visibility !== 'public' || lesson.author_id === user?.id
                  return (
                    <LessonRow
                      key={lesson.id}
                      lesson={lesson}
                      departments={departments}
                      index={i}
                      canEdit={canEdit}
                      onView={() => navigate(`/admin/lessons/${lesson.id}/panels`, { state: { backPath: '/admin/lessons' } })}
                      onEdit={() => openEdit(lesson)}
                      onDelete={() => setDeleteTarget(lesson)}
                    />
                  )
                })
              )}
            </div>
          </main>
        </div>
      </div>

      {panel !== null && (
        <LessonFormPanel
          mode={panel === 'create' ? 'create' : 'edit'}
          form={form}
          onChange={handleFormChange}
          onClose={() => { setPanel(null); setEditTarget(null) }}
          onSave={panel === 'create' ? handleSave : handleUpdate}
          difficulties={DIFFICULTIES}
          departments={departments}
          organisations={organisations}
        />
      )}

      {deleteTarget && (
        <LessonDeleteModal
          target={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={executeDelete}
        />
      )}
    </div>
  )
}
