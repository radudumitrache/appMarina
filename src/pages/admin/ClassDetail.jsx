import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import NavBar from '../../components/admin/NavBar'
import ClassDetailTopbar from '../../components/admin/class-detail/ClassDetailTopbar'
import ClassDetailHeader from '../../components/admin/class-detail/ClassDetailHeader'
import ManagementPanel from '../../components/admin/class-detail/ManagementPanel'
import EditDetailsModal from '../../components/admin/class-detail/EditDetailsModal'
import '../css/admin/ClassDetail.css'

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

const TEACHERS = ['Capt. Rodriguez', 'Prof. Whitmore', 'Instr. Chen', 'Eng. Vasquez']

const INITIAL_CLASSES = [
  { id: 1, name: 'SEC-2024-A', teacher: 'Capt. Rodriguez',  students: [1, 2, 5],     lessons: [1, 2, 3, 5],     status: 'active',   description: 'Main cohort — Spring 2024'    },
  { id: 2, name: 'SEC-2024-B', teacher: 'Prof. Whitmore',   students: [3, 4, 11],    lessons: [1, 3, 6, 8],     status: 'active',   description: 'Advanced track — Spring 2024' },
  { id: 3, name: 'SEC-2024-C', teacher: 'Instr. Chen',      students: [6, 8, 12],    lessons: [1, 2, 5, 12],    status: 'active',   description: 'Evening cohort — Spring 2024' },
  { id: 4, name: 'SEC-2023-A', teacher: 'Eng. Vasquez',     students: [7, 9, 10],    lessons: [1, 2, 3, 8, 10], status: 'archived', description: 'Completed cohort — 2023'      },
]

export default function AdminClassDetail() {
  const { id }   = useParams()
  const navigate = useNavigate()

  const base = INITIAL_CLASSES.find(c => c.id === Number(id))

  const [cls, setCls]               = useState(base || null)
  const [editMode, setEditMode]     = useState(false)
  const [editForm, setEditForm]     = useState(null)
  const [studentSearch, setStudentSearch] = useState('')
  const [lessonSearch,  setLessonSearch]  = useState('')
  const [studentFocus,  setStudentFocus]  = useState(false)
  const [lessonFocus,   setLessonFocus]   = useState(false)

  if (!cls) {
    return (
      <div className="cd-page">
        <NavBar />
        <div className="cd-not-found">
          <p>Class not found.</p>
          <button className="btn-ghost" onClick={() => navigate('/admin/classes')}>Back to Classes</button>
        </div>
      </div>
    )
  }

  const openEdit = () => {
    setEditForm({ name: cls.name, teacher: cls.teacher, description: cls.description || '', status: cls.status })
    setEditMode(true)
  }
  const saveEdit = () => {
    if (!editForm.name.trim()) return
    setCls(c => ({ ...c, ...editForm }))
    setEditMode(false)
  }
  const handleEditChange = (field, value) =>
    setEditForm(f => ({ ...f, [field]: value }))

  const enrolledStudents = ALL_STUDENTS.filter(s => cls.students.includes(s.id))
  const assignedLessons  = ALL_LESSONS.filter(l => cls.lessons.includes(l.id))

  const studentSuggestions = useMemo(() => {
    const q = studentSearch.trim().toLowerCase()
    if (!q) return []
    return ALL_STUDENTS.filter(s => !cls.students.includes(s.id) && s.name.toLowerCase().includes(q))
  }, [studentSearch, cls.students])

  const lessonSuggestions = useMemo(() => {
    const q = lessonSearch.trim().toLowerCase()
    if (!q) return []
    return ALL_LESSONS.filter(l => !cls.lessons.includes(l.id) && l.title.toLowerCase().includes(q))
  }, [lessonSearch, cls.lessons])

  const addStudent    = s   => { setCls(c => ({ ...c, students: [...c.students, s.id] })); setStudentSearch('') }
  const removeStudent = sid => setCls(c => ({ ...c, students: c.students.filter(x => x !== sid) }))
  const addLesson     = l   => { setCls(c => ({ ...c, lessons: [...c.lessons, l.id] })); setLessonSearch('') }
  const removeLesson  = lid => setCls(c => ({ ...c, lessons: c.lessons.filter(x => x !== lid) }))
  const toggleArchive = ()  => setCls(c => ({ ...c, status: c.status === 'active' ? 'archived' : 'active' }))

  return (
    <div className="cd-page">
      <NavBar />

      <ClassDetailTopbar
        status={cls.status}
        onBack={() => navigate('/admin/classes')}
        onToggleArchive={toggleArchive}
        onEdit={openEdit}
      />

      <ClassDetailHeader cls={cls} />

      <div className="cd-panels">
        <ManagementPanel
          title="Students"
          type="student"
          items={enrolledStudents}
          searchValue={studentSearch}
          onSearchChange={setStudentSearch}
          searchPlaceholder="Search students to add…"
          suggestions={studentSuggestions}
          isFocused={studentFocus}
          onFocus={() => setStudentFocus(true)}
          onBlur={() => setTimeout(() => setStudentFocus(false), 150)}
          onAdd={addStudent}
          onRemove={removeStudent}
        />
        <ManagementPanel
          title="Lessons"
          type="lesson"
          items={assignedLessons}
          searchValue={lessonSearch}
          onSearchChange={setLessonSearch}
          searchPlaceholder="Search lessons to assign…"
          suggestions={lessonSuggestions}
          isFocused={lessonFocus}
          onFocus={() => setLessonFocus(true)}
          onBlur={() => setTimeout(() => setLessonFocus(false), 150)}
          onAdd={addLesson}
          onRemove={removeLesson}
        />
      </div>

      {editMode && (
        <EditDetailsModal
          editForm={editForm}
          onChange={handleEditChange}
          onClose={() => setEditMode(false)}
          onSave={saveEdit}
          teachers={TEACHERS}
        />
      )}
    </div>
  )
}
