import { useState } from 'react'
import NavBar from '../../components/admin/NavBar'
import LessonsSidebar from '../../components/admin/lessons/LessonsSidebar'
import LessonsToolbar from '../../components/admin/lessons/LessonsToolbar'
import LessonRow from '../../components/admin/lessons/LessonRow'
import LessonFormPanel from '../../components/admin/lessons/LessonFormPanel'
import LessonDeleteModal from '../../components/admin/lessons/LessonDeleteModal'
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
const TEACHERS = ['Capt. Rodriguez', 'Prof. Whitmore', 'Instr. Chen', 'Eng. Vasquez']

let nextId = 13
const INITIAL_LESSONS = [
  { id: 1,  cat: 'nav',   title: 'Helm Control Basics',        duration: '45 min', difficulty: 'easy',         status: 'published', author: 'Capt. Rodriguez', visibility: 'class'  },
  { id: 2,  cat: 'nav',   title: 'Chart Reading Fundamentals', duration: '60 min', difficulty: 'easy',         status: 'published', author: 'Capt. Rodriguez', visibility: 'class'  },
  { id: 3,  cat: 'nav',   title: 'Radar & ARPA Systems',       duration: '75 min', difficulty: 'intermediate', status: 'published', author: 'Prof. Whitmore',  visibility: 'public' },
  { id: 4,  cat: 'nav',   title: 'Celestial Navigation',       duration: '90 min', difficulty: 'advanced',     status: 'draft',     author: 'Prof. Whitmore',  visibility: 'public' },
  { id: 5,  cat: 'emg',   title: 'Fire Safety Protocols',      duration: '50 min', difficulty: 'easy',         status: 'published', author: 'Instr. Chen',     visibility: 'class'  },
  { id: 6,  cat: 'emg',   title: 'Man Overboard Response',     duration: '60 min', difficulty: 'intermediate', status: 'published', author: 'Instr. Chen',     visibility: 'class'  },
  { id: 7,  cat: 'emg',   title: 'Abandon Ship Procedure',     duration: '45 min', difficulty: 'intermediate', status: 'draft',     author: 'Prof. Whitmore',  visibility: 'public' },
  { id: 8,  cat: 'eng',   title: 'Main Engine Operations',     duration: '80 min', difficulty: 'intermediate', status: 'published', author: 'Eng. Vasquez',    visibility: 'class'  },
  { id: 9,  cat: 'eng',   title: 'Fuel Management Systems',    duration: '65 min', difficulty: 'intermediate', status: 'published', author: 'Eng. Vasquez',    visibility: 'class'  },
  { id: 10, cat: 'cargo', title: 'Load Calculation',           duration: '70 min', difficulty: 'advanced',     status: 'published', author: 'Prof. Whitmore',  visibility: 'public' },
  { id: 11, cat: 'cargo', title: 'Stability & Trim',           duration: '85 min', difficulty: 'advanced',     status: 'draft',     author: 'Prof. Whitmore',  visibility: 'public' },
  { id: 12, cat: 'comm',  title: 'GMDSS Radio Operations',     duration: '55 min', difficulty: 'intermediate', status: 'published', author: 'Instr. Chen',     visibility: 'public' },
]

const EMPTY_FORM = {
  title: '', cat: 'nav', duration: '60 min', difficulty: 'intermediate',
  description: '', status: 'draft', visibility: 'class', author: '',
}

export default function Lessons() {
  const [lessons, setLessons]               = useState(INITIAL_LESSONS)
  const [search, setSearch]                 = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [statusFilter, setStatusFilter]     = useState('all')
  const [panel, setPanel]                   = useState(null)
  const [form, setForm]                     = useState(EMPTY_FORM)
  const [deleteTarget, setDeleteTarget]     = useState(null)

  const filtered = lessons
    .filter(l => activeCategory === 'all' || l.cat === activeCategory)
    .filter(l => statusFilter === 'all' || l.status === statusFilter)
    .filter(l => l.title.toLowerCase().includes(search.toLowerCase().trim()))

  const openCreate = () => { setForm(EMPTY_FORM); setPanel('create') }
  const openEdit   = lesson => {
    setForm({
      title: lesson.title, cat: lesson.cat, duration: lesson.duration,
      difficulty: lesson.difficulty, description: lesson.description || '',
      status: lesson.status, visibility: lesson.visibility, author: lesson.author,
    })
    setPanel(lesson)
  }

  const handleFormChange = (field, value) => setForm(f => ({ ...f, [field]: value }))

  const handleSave = () => {
    if (!form.title.trim()) return
    if (panel === 'create') {
      setLessons(prev => [...prev, { id: nextId++, ...form }])
    } else {
      setLessons(prev => prev.map(l => l.id === panel.id ? { ...l, ...form } : l))
    }
    setPanel(null)
  }

  const toggleStatus = id =>
    setLessons(prev => prev.map(l =>
      l.id === id ? { ...l, status: l.status === 'published' ? 'draft' : 'published' } : l
    ))

  const executeDelete = () => {
    setLessons(prev => prev.filter(l => l.id !== deleteTarget.id))
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
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              onCreateNew={openCreate}
            />

            <div className="lessons-adm-list">
              {filtered.length === 0 ? (
                <p className="lessons-adm-empty">No lessons match your filters.</p>
              ) : (
                filtered.map((lesson, i) => (
                  <LessonRow
                    key={lesson.id}
                    lesson={lesson}
                    categories={CATEGORIES}
                    index={i}
                    onEdit={() => openEdit(lesson)}
                    onToggleStatus={() => toggleStatus(lesson.id)}
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
          teachers={TEACHERS}
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
