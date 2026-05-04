import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '../../components/admin/NavBar'
import ClassesHeader from '../../components/admin/classes/ClassesHeader'
import ClassesStats from '../../components/admin/classes/ClassesStats'
import ClassCard from '../../components/admin/classes/ClassCard'
import ClassFormModal from '../../components/admin/classes/ClassFormModal'
import DeleteConfirmModal from '../../components/admin/classes/DeleteConfirmModal'
import '../css/admin/Classes.css'

const TEACHERS = ['Capt. Rodriguez', 'Prof. Whitmore', 'Instr. Chen', 'Eng. Vasquez']

const ALL_STUDENTS = [
  { id: 1,  name: 'Alice Chen'      },
  { id: 2,  name: 'Bob Martinez'    },
  { id: 3,  name: 'Clara Novak'     },
  { id: 4,  name: 'Daniel Park'     },
  { id: 5,  name: 'Eva Rossi'       },
  { id: 6,  name: 'Frank Okafor'    },
  { id: 7,  name: 'Grace Yamamoto'  },
  { id: 8,  name: 'Hugo Brennan'    },
  { id: 9,  name: 'Isla Torres'     },
  { id: 10, name: 'James Okonkwo'   },
  { id: 11, name: 'Kira Petrov'     },
  { id: 12, name: 'Liam Walsh'      },
]

const ALL_LESSONS = [
  { id: 1,  title: 'Helm Control Basics'        },
  { id: 2,  title: 'Chart Reading Fundamentals' },
  { id: 3,  title: 'Radar & ARPA Systems'       },
  { id: 5,  title: 'Fire Safety Protocols'      },
  { id: 6,  title: 'Man Overboard Response'     },
  { id: 8,  title: 'Main Engine Operations'     },
  { id: 10, title: 'Load Calculation'           },
  { id: 12, title: 'GMDSS Radio Operations'     },
]

let nextId = 5
const INITIAL_CLASSES = [
  { id: 1, name: 'SEC-2024-A', teacher: 'Capt. Rodriguez', students: [1, 2, 5],     lessons: [1, 2, 3, 5],     status: 'active',   description: 'Main cohort — Spring 2024'    },
  { id: 2, name: 'SEC-2024-B', teacher: 'Prof. Whitmore',  students: [3, 4, 11],    lessons: [1, 3, 6, 8],     status: 'active',   description: 'Advanced track — Spring 2024' },
  { id: 3, name: 'SEC-2024-C', teacher: 'Instr. Chen',     students: [6, 8, 12],    lessons: [1, 2, 5, 12],    status: 'active',   description: 'Evening cohort — Spring 2024' },
  { id: 4, name: 'SEC-2023-A', teacher: 'Eng. Vasquez',    students: [7, 9, 10],    lessons: [1, 2, 3, 8, 10], status: 'archived', description: 'Completed cohort — 2023'      },
]

const EMPTY_FORM = { name: '', teacher: TEACHERS[0], students: [], lessons: [], status: 'active', description: '' }

export default function Classes() {
  const navigate = useNavigate()
  const [classes, setClasses]               = useState(INITIAL_CLASSES)
  const [search, setSearch]                 = useState('')
  const [statusFilter, setStatusFilter]     = useState('all')
  const [modal, setModal]                   = useState(null)   // null | 'create' | class-object
  const [form, setForm]                     = useState(EMPTY_FORM)
  const [deleteTarget, setDeleteTarget]     = useState(null)
  const [expandedStudents, setExpandedStudents] = useState(null)
  const [expandedLessons, setExpandedLessons]   = useState(null)

  const filtered = classes
    .filter(c => statusFilter === 'all' || c.status === statusFilter)
    .filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.teacher.toLowerCase().includes(search.toLowerCase())
    )

  const stats = {
    total:    classes.length,
    active:   classes.filter(c => c.status === 'active').length,
    archived: classes.filter(c => c.status === 'archived').length,
    students: new Set(classes.flatMap(c => c.students)).size,
  }

  const openCreate = () => { setForm(EMPTY_FORM); setModal('create') }
  const openEdit   = cls => {
    setForm({ name: cls.name, teacher: cls.teacher, students: [...cls.students], lessons: [...cls.lessons], status: cls.status, description: cls.description || '' })
    setModal(cls)
  }

  const handleFormChange = (field, value) => setForm(f => ({ ...f, [field]: value }))

  const handleSave = () => {
    if (!form.name.trim()) return
    if (modal === 'create') {
      setClasses(prev => [...prev, { id: nextId++, ...form }])
    } else {
      setClasses(prev => prev.map(c => c.id === modal.id ? { ...c, ...form } : c))
    }
    setModal(null)
  }

  const toggleArchive = id =>
    setClasses(prev => prev.map(c => c.id === id ? { ...c, status: c.status === 'active' ? 'archived' : 'active' } : c))

  const executeDelete = () => {
    setClasses(prev => prev.filter(c => c.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  return (
    <div className="classes-adm-page">
      <div className="classes-adm-layout">
        <NavBar />

        <ClassesHeader
          filteredCount={filtered.length}
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onCreateNew={openCreate}
        />

        <ClassesStats stats={stats} />

        <div className="classes-adm-main">
          {filtered.length === 0 ? (
            <p className="classes-adm-empty">No classes found.</p>
          ) : (
            <div className="classes-grid">
              {filtered.map((cls, i) => (
                <ClassCard
                  key={cls.id}
                  cls={cls}
                  index={i}
                  allStudents={ALL_STUDENTS}
                  allLessons={ALL_LESSONS}
                  isStudentsExpanded={expandedStudents === cls.id}
                  isLessonsExpanded={expandedLessons === cls.id}
                  onToggleStudents={() => setExpandedStudents(expandedStudents === cls.id ? null : cls.id)}
                  onToggleLessons={() => setExpandedLessons(expandedLessons === cls.id ? null : cls.id)}
                  onManage={() => navigate(`/admin/classes/${cls.id}`)}
                  onEdit={() => openEdit(cls)}
                  onToggleArchive={() => toggleArchive(cls.id)}
                  onDelete={() => setDeleteTarget(cls)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {modal !== null && (
        <ClassFormModal
          mode={modal === 'create' ? 'create' : 'edit'}
          form={form}
          onChange={handleFormChange}
          onClose={() => setModal(null)}
          onSave={handleSave}
          teachers={TEACHERS}
          allStudents={ALL_STUDENTS}
          allLessons={ALL_LESSONS}
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
