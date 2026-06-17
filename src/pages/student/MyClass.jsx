import { useState, useEffect, useRef } from 'react'
import { useNavigate }    from 'react-router-dom'
import { useAuth }        from '../../auth/AuthContext'
import NavBar             from '../../components/student/NavBar'
import MyClassHeader      from '../../components/student/my-class/MyClassHeader'
import ClassRoster        from '../../components/student/my-class/ClassRoster'
import Announcements      from '../../components/student/my-class/Announcements'
import JoinClassCard      from '../../components/student/my-class/JoinClassCard'
import ClassSidebar       from '../../components/student/my-class/ClassSidebar'
import ClassStatCards     from '../../components/student/my-class/ClassStatCards'
import {
  getDepartments, getClassStudents, getClassModules,
  getClassAssignments, getAnnouncements, joinClass,
} from '../../api/departments'
import '../css/student/MyClass.css'

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function MyClass() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [departments,   setDepartments]   = useState([])
  const [selectedId,    setSelectedId]    = useState(null)
  const [enrollments,   setEnrollments]   = useState([])
  const [modules,       setModules]       = useState([])
  const [assignments,   setAssignments]   = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [loading,       setLoading]       = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)

  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [joinCode,  setJoinCode]  = useState('')
  const [joining,   setJoining]   = useState(false)
  const [joinError, setJoinError] = useState(null)
  const codeRef = useRef(null)

  useEffect(() => { loadClasses() }, [])
  useEffect(() => { if (selectedId !== null) loadClassDetail(selectedId) }, [selectedId])

  async function loadClasses() {
    setLoading(true)
    try {
      const { data } = await getDepartments()
      setDepartments(data)
      if (data.length > 0) setSelectedId(data[0].id)
    } catch {
    } finally {
      setLoading(false)
    }
  }

  async function loadClassDetail(departmentId) {
    setDetailLoading(true)
    try {
      const [enrollRes, moduleRes, assignRes, announceRes] = await Promise.all([
        getClassStudents(departmentId),
        getClassModules(departmentId),
        getClassAssignments(departmentId),
        getAnnouncements(departmentId),
      ])
      setEnrollments(enrollRes.data)
      setModules(moduleRes.data)
      setAssignments(assignRes.data)
      setAnnouncements(announceRes.data)
    } catch {
    } finally {
      setDetailLoading(false)
    }
  }

  async function handleFirstJoin(e) {
    e.preventDefault()
    if (!joinCode.trim()) return
    setJoining(true)
    setJoinError(null)
    try {
      await joinClass(joinCode.trim())
      const { data } = await getDepartments()
      setDepartments(data)
      setSelectedId(data[0]?.id ?? null)
      setJoinCode('')
    } catch (err) {
      setJoinError(err.response?.data?.detail ?? 'Could not join. Check the code and try again.')
      codeRef.current?.focus()
    } finally {
      setJoining(false)
    }
  }

  async function handleSidebarJoin(code) {
    await joinClass(code)
    const { data: updated } = await getDepartments()
    const newClass = updated.find(c => !departments.some(old => old.id === c.id))
    setDepartments(updated)
    setSelectedId(newClass ? newClass.id : updated[0]?.id ?? null)
  }

  if (loading) {
    return (
      <div className="myclass-page">
        <NavBar />
        <div className="myclass-loading"><span>Loading...</span></div>
      </div>
    )
  }

  if (departments.length === 0) {
    return (
      <div className="myclass-page">
        <NavBar />
        <JoinClassCard
          joinCode={joinCode}
          onChange={e => { setJoinCode(e.target.value.toUpperCase()); setJoinError(null) }}
          joining={joining}
          joinError={joinError}
          onSubmit={handleFirstJoin}
          codeRef={codeRef}
        />
      </div>
    )
  }

  const classroom = departments.find(c => c.id === selectedId) ?? departments[0]

  const classmates = enrollments
    .map(e => ({
      id:              e.student,
      name:            e.student_name,
      avatar:          initials(e.student_name),
      modulesComplete: e.modules_done,
      totalModules:    e.modules_total,
      avgGrade:        e.avg_grade,
      isMe:            e.student === user?.id,
    }))
    .sort((a, b) => {
      if (b.modulesComplete !== a.modulesComplete) return b.modulesComplete - a.modulesComplete
      return (b.avgGrade ?? -1) - (a.avgGrade ?? -1)
    })

  const myRank = classmates.findIndex(c => c.isMe) + 1
  const me     = classmates.find(c => c.isMe)

  const announcementItems = announcements.map(a => ({
    id:     a.id,
    title:  a.title,
    body:   a.body,
    author: a.author_name,
    date:   a.created_at,
    pinned: a.pinned,
  }))

  const classInfo = {
    name:     classroom.name,
    code:     classroom.code,
    teacher:  classroom.teacher_name,
    semester: classroom.semester,
    enrolled: classroom.student_count,
    start:    classroom.start_date,
    end:      classroom.end_date,
  }

  const classAvg  = classroom.class_avg_grade
  const statCards = [
    {
      label: 'Classmates',
      value: String(Math.max(0, classroom.student_count - 1)),
      sub:   'in your department',
    },
    {
      label: 'Modules Assigned',
      value: String(modules.length),
      sub:   me ? `${me.modulesComplete} of ${me.totalModules} complete` : 'in your department',
    },
    {
      label: 'Tests Assigned',
      value: String(assignments.length),
      sub:   `${assignments.filter(t => t.completed).length} completed`,
    },
    {
      label:  'Class Avg Grade',
      value:  classAvg != null ? String(Math.round(classAvg)) : '--',
      suffix: classAvg != null ? '%' : '',
      sub:    'across all tests',
    },
  ]

  return (
    <div className="myclass-page">
      <NavBar />

      <div className="myclass-body">
        {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
        <ClassSidebar
          classes={departments}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onJoin={handleSidebarJoin}
          className={sidebarOpen ? 'sidebar--open' : ''}
        />

        <div className="myclass-main">
          <button className="sidebar-toggle-btn" onClick={() => setSidebarOpen(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
            Filters
          </button>
          <MyClassHeader
            classInfo={classInfo}
            onBack={() => navigate('/student/dashboard')}
          />

          <div className="myclass-content">
            {detailLoading ? (
              <div className="myclass-loading"><span>Loading...</span></div>
            ) : (
              <>
                <ClassStatCards statCards={statCards} />

                <div className="myclass-grid">
                  <ClassRoster classmates={classmates} myRank={myRank} />
                  <Announcements items={announcementItems} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
