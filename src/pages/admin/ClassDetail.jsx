import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import NavBar from '../../components/admin/NavBar'
import ClassDetailTopbar from '../../components/admin/class-detail/ClassDetailTopbar'
import ClassDetailHeader from '../../components/admin/class-detail/ClassDetailHeader'
import ManagementPanel from '../../components/admin/class-detail/ManagementPanel'
import EditDetailsModal from '../../components/admin/class-detail/EditDetailsModal'
import {
  getClass, updateClass,
  getClassStudents, enrollStudent, removeStudent,
  getClassLessons, assignLesson, unassignLesson,
  getClassTests,
} from '../../api/classes'
import { getUsers, getTeachers } from '../../api/admin'
import { getLessons } from '../../api/lessons'
import { getTests, updateTest } from '../../api/tests'
import Sk from '../../components/shared/Skeleton'
import '../css/admin/ClassDetail.css'

export default function AdminClassDetail() {
  const { id }   = useParams()
  const navigate = useNavigate()

  const [cls, setCls]                   = useState(null)
  const [students, setStudents]         = useState([])
  const [lessons, setLessons]           = useState([])
  const [tests, setTests]               = useState([])
  const [allStudents, setAllStudents]   = useState([])
  const [allLessons, setAllLessons]     = useState([])
  const [allTests, setAllTests]         = useState([])
  const [teachers, setTeachers]         = useState([])
  const [loading, setLoading]           = useState(true)
  const [editMode, setEditMode]         = useState(false)
  const [editForm, setEditForm]         = useState(null)
  const [studentSearch, setStudentSearch] = useState('')
  const [lessonSearch,  setLessonSearch]  = useState('')
  const [testSearch,    setTestSearch]    = useState('')
  const [studentFocus,  setStudentFocus]  = useState(false)
  const [lessonFocus,   setLessonFocus]   = useState(false)
  const [testFocus,     setTestFocus]     = useState(false)

  useEffect(() => {
    Promise.all([
      getClass(id),
      getClassStudents(id),
      getClassLessons(id),
      getClassTests(id),
      getUsers({ 'userprofile__role': 'student' }),
      getLessons(),
      getTests(),
      getTeachers(),
    ]).then(([clsRes, stuRes, lesRes, tstRes, allStuRes, allLesRes, allTstRes, tchRes]) => {
      setCls(clsRes.data)
      setStudents(stuRes.data.map(e => ({ id: e.student, name: e.student_name, email: e.student_email })))
      setLessons(lesRes.data.map(cl => ({ id: cl.lesson, title: cl.lesson_detail.title })))
      setTests(tstRes.data.map(t => ({ id: t.id, title: t.title })))
      setAllStudents(allStuRes.data.map(u => ({ id: u.id, name: `${u.first_name} ${u.last_name}`.trim() || u.username, email: u.email })))
      setAllLessons(allLesRes.data.map(l => ({ id: l.id, title: l.title })))
      setAllTests(allTstRes.data.map(t => ({ id: t.id, title: t.title })))
      setTeachers(tchRes.data)
    }).finally(() => setLoading(false))
  }, [id])

  const openEdit = () => {
    setEditForm({
      name:       cls.name,
      code:       cls.code,
      subject:    cls.subject,
      teacher:    cls.teacher,
      start_date: cls.start_date,
      end_date:   cls.end_date,
      status:     cls.status,
    })
    setEditMode(true)
  }

  const saveEdit = async () => {
    if (!editForm.name.trim()) return
    try {
      const { data } = await updateClass(id, editForm)
      setCls(data)
    } catch {}
    setEditMode(false)
  }

  const handleEditChange = (field, value) => setEditForm(f => ({ ...f, [field]: value }))

  const enrolledIds     = useMemo(() => new Set(students.map(s => s.id)), [students])
  const assignedIds     = useMemo(() => new Set(lessons.map(l => l.id)),  [lessons])
  const assignedTestIds = useMemo(() => new Set(tests.map(t => t.id)),    [tests])

  const studentSuggestions = useMemo(() => {
    const q = studentSearch.trim().toLowerCase()
    if (!q) return []
    return allStudents.filter(s => !enrolledIds.has(s.id) && (s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)))
  }, [studentSearch, allStudents, enrolledIds])

  const lessonSuggestions = useMemo(() => {
    const q = lessonSearch.trim().toLowerCase()
    if (!q) return []
    return allLessons.filter(l => !assignedIds.has(l.id) && l.title.toLowerCase().includes(q))
  }, [lessonSearch, allLessons, assignedIds])

  const testSuggestions = useMemo(() => {
    const q = testSearch.trim().toLowerCase()
    if (!q) return []
    return allTests.filter(t => !assignedTestIds.has(t.id) && t.title.toLowerCase().includes(q))
  }, [testSearch, allTests, assignedTestIds])

  const addStudent = async s => {
    setStudentSearch('')
    try {
      await enrollStudent(id, { email: s.email })
      setStudents(prev => [...prev, s])
    } catch {}
  }

  const handleRemoveStudent = async uid => {
    setStudents(prev => prev.filter(s => s.id !== uid))
    try {
      await removeStudent(id, uid)
    } catch {
      setStudents(prev => [...prev])
    }
  }

  const addLesson = async l => {
    setLessonSearch('')
    try {
      await assignLesson(id, { lesson: l.id })
      setLessons(prev => [...prev, l])
    } catch {}
  }

  const handleRemoveLesson = async lid => {
    setLessons(prev => prev.filter(l => l.id !== lid))
    try {
      await unassignLesson(id, lid)
    } catch {
      setLessons(prev => [...prev])
    }
  }

  const addTest = async t => {
    setTestSearch('')
    try {
      await updateTest(t.id, { classroom: parseInt(id, 10) })
      setTests(prev => [...prev, t])
    } catch {}
  }

  const handleRemoveTest = async tid => {
    setTests(prev => prev.filter(t => t.id !== tid))
    try {
      await updateTest(tid, { classroom: null })
    } catch {
      setTests(prev => [...prev])
    }
  }

  const toggleArchive = async () => {
    const newStatus = cls.status === 'active' ? 'archived' : 'active'
    try {
      const { data } = await updateClass(id, { status: newStatus })
      setCls(data)
    } catch {}
  }

  if (loading) {
    return (
      <div className="cd-page">
        <NavBar />
        <div style={{ padding: '24px 40px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Sk w={120} h={13} r={4} />
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Sk w={220} h={26} r={6} />
            <Sk w={64} h={20} r={4} />
          </div>
          <Sk w={160} h={13} r={4} />
          <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} style={{ flex: 1, background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Sk w={90} h={14} r={4} />
                  <Sk w={100} h={32} r={6} />
                </div>
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)', opacity: 1 - j * 0.15 }}>
                    <Sk w={28} h={28} r={14} style={{ flexShrink: 0 }} />
                    <Sk w={`${50 + (j % 3) * 12}%`} h={12} r={4} />
                    <Sk w={20} h={20} r={4} style={{ marginLeft: 'auto', flexShrink: 0 }} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

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

  return (
    <div className="cd-page">
      <NavBar />

      <ClassDetailTopbar
        status={cls.status}
        onBack={() => navigate('/admin/classes')}
        onToggleArchive={toggleArchive}
        onEdit={openEdit}
      />

      <ClassDetailHeader cls={cls} studentCount={students.length} lessonCount={lessons.length} testCount={tests.length} />

      <div className="cd-panels">
        <ManagementPanel
          title="Students"
          type="student"
          items={students}
          searchValue={studentSearch}
          onSearchChange={setStudentSearch}
          searchPlaceholder="Search students to add…"
          suggestions={studentSuggestions}
          isFocused={studentFocus}
          onFocus={() => setStudentFocus(true)}
          onBlur={() => setTimeout(() => setStudentFocus(false), 150)}
          onAdd={addStudent}
          onRemove={handleRemoveStudent}
          onSelectItem={s => navigate(`/admin/students/${s.id}/progress`)}
        />
        <ManagementPanel
          title="Lessons"
          type="lesson"
          items={lessons}
          searchValue={lessonSearch}
          onSearchChange={setLessonSearch}
          searchPlaceholder="Search lessons to assign…"
          suggestions={lessonSuggestions}
          isFocused={lessonFocus}
          onFocus={() => setLessonFocus(true)}
          onBlur={() => setTimeout(() => setLessonFocus(false), 150)}
          onAdd={addLesson}
          onRemove={handleRemoveLesson}
        />
        <ManagementPanel
          title="Tests"
          type="test"
          items={tests}
          searchValue={testSearch}
          onSearchChange={setTestSearch}
          searchPlaceholder="Search tests to assign…"
          suggestions={testSuggestions}
          isFocused={testFocus}
          onFocus={() => setTestFocus(true)}
          onBlur={() => setTimeout(() => setTestFocus(false), 150)}
          onAdd={addTest}
          onRemove={handleRemoveTest}
        />
      </div>

      {editMode && (
        <EditDetailsModal
          editForm={editForm}
          onChange={handleEditChange}
          onClose={() => setEditMode(false)}
          onSave={saveEdit}
          teachers={teachers}
        />
      )}
    </div>
  )
}
