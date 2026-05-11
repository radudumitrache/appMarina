import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '../../components/admin/NavBar'
import LessonsSidebar from '../../components/admin/lessons/LessonsSidebar'
import LessonsToolbar from '../../components/admin/lessons/LessonsToolbar'
import LessonRow from '../../components/admin/lessons/LessonRow'
import LessonFormPanel from '../../components/admin/lessons/LessonFormPanel'
import LessonDeleteModal from '../../components/admin/lessons/LessonDeleteModal'
import { getLessons, createLesson, deleteLesson } from '../../api/lessons'
import Sk from '../../components/shared/Skeleton'
import '../css/admin/Lessons.css'

const CATEGORIES = [
  { id: 'all',   label: 'All Lessons'         },
  { id: 'nav',   label: 'Bridge Navigation'   },
  { id: 'emg',   label: 'Emergency Protocols' },
  { id: 'eng',   label: 'Engine Room'         },
  { id: 'cargo', label: 'Cargo Management'    },
  { id: 'comm',  label: 'Communications'      },
]

const DIFFICULTIES = ['easy', 'intermediate', 'advanced']

const EMPTY_FORM = {
  title: '', category: 'nav', duration_minutes: 60,
  difficulty: 'intermediate', visibility: 'class',
}

function mapLesson(l) {
  return {
    id:               l.id,
    title:            l.title,
    category:         l.category,
    duration:         `${l.duration_minutes} min`,
    duration_minutes: l.duration_minutes,
    difficulty:       l.difficulty,
    visibility:       l.visibility,
    author:           l.author_name ?? '',
    locked:           l.locked,
  }
}

export default function Lessons() {
  const navigate = useNavigate()

  const [lessons, setLessons]               = useState([])
  const [loading, setLoading]               = useState(true)
  const [search, setSearch]                 = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [visFilter, setVisFilter]           = useState('all')
  const [panel, setPanel]                   = useState(null)
  const [form, setForm]                     = useState(EMPTY_FORM)
  const [deleteTarget, setDeleteTarget]     = useState(null)

  useEffect(() => {
    getLessons()
      .then(({ data }) => setLessons(data.map(mapLesson)))
      .finally(() => setLoading(false))
  }, [])

  const filtered = lessons
    .filter(l => activeCategory === 'all' || l.category === activeCategory)
    .filter(l => visFilter === 'all' || l.visibility === visFilter)
    .filter(l => l.title.toLowerCase().includes(search.toLowerCase().trim()))

  const openCreate = () => { setForm(EMPTY_FORM); setPanel('create') }

  const handleFormChange = (field, value) => setForm(f => ({ ...f, [field]: value }))

  const handleSave = async () => {
    if (!form.title.trim()) return
    try {
      const { data } = await createLesson(form)
      setLessons(prev => [mapLesson(data), ...prev])
      setPanel(null)
    } catch {}
  }

  const executeDelete = async () => {
    try {
      await deleteLesson(deleteTarget.id)
      setLessons(prev => prev.filter(l => l.id !== deleteTarget.id))
    } catch {}
    setDeleteTarget(null)
  }

  const activeLabel = CATEGORIES.find(c => c.id === activeCategory)?.label

  return (
    <div className="lessons-adm-page">
      <div className="lessons-adm-layout">
        <NavBar />
        <div className="lessons-adm-body">

          <LessonsSidebar
            categories={CATEGORIES}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            lessons={lessons}
          />

          <main className="lessons-adm-main">
            <LessonsToolbar
              title={activeLabel}
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
                filtered.map((lesson, i) => (
                  <LessonRow
                    key={lesson.id}
                    lesson={lesson}
                    categories={CATEGORIES}
                    index={i}
                    onView={() => navigate(`/admin/lessons/${lesson.id}/panels`, { state: { backPath: '/admin/lessons' } })}
                    onDelete={() => setDeleteTarget(lesson)}
                  />
                ))
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
          onClose={() => setPanel(null)}
          onSave={handleSave}
          categories={CATEGORIES.filter(c => c.id !== 'all')}
          difficulties={DIFFICULTIES}
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
