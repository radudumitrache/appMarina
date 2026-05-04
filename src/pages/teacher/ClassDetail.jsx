import { useState } from 'react'
import { useParams } from 'react-router-dom'
import NavBar from '../../components/teacher/NavBar'
import ClassHeader from '../../components/teacher/class-detail/ClassHeader'
import ClassStats from '../../components/teacher/class-detail/ClassStats'
import ClassTabBar from '../../components/teacher/class-detail/ClassTabBar'
import StudentList from '../../components/teacher/class-detail/StudentList'
import LessonList from '../../components/teacher/class-detail/LessonList'
import AssignmentList from '../../components/teacher/class-detail/AssignmentList'
import { CLASSES, STUDENTS, LESSONS, ASSIGNMENTS } from './classDetailMock'
import '../css/teacher/ClassDetail.css'

export default function ClassDetail() {
  const { id } = useParams()
  const cls    = CLASSES[Number(id)]

  const [tab, setTab]       = useState('students')
  const [search, setSearch] = useState('')

  if (!cls) {
    return (
      <div className="cd-page">
        <div className="cd-layout">
          <NavBar />
          <div className="cd-not-found">Class not found.</div>
        </div>
      </div>
    )
  }

  const totalStudents   = STUDENTS.length
  const activeStudents  = STUDENTS.filter(s => s.status === 'active').length
  const avgProgress     = Math.round(
    STUDENTS.reduce((sum, s) => sum + (s.done / cls.lessonsTotal) * 100, 0) / STUDENTS.length
  )
  const lessonsComplete = LESSONS.filter(l => l.completed === l.total).length

  const filteredStudents = STUDENTS.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase().trim()) ||
    s.email.toLowerCase().includes(search.toLowerCase().trim())
  )

  const filteredLessons = LESSONS.filter(l =>
    l.title.toLowerCase().includes(search.toLowerCase().trim()) ||
    l.cat.toLowerCase().includes(search.toLowerCase().trim())
  )

  function handleTabChange(next) {
    setTab(next)
    setSearch('')
  }

  return (
    <div className="cd-page">
      <div className="cd-layout">
        <NavBar />

        <ClassHeader name={cls.name} code={cls.code} status={cls.status} />

        <div className="cd-content">
          <ClassStats
            totalStudents={totalStudents}
            activeStudents={activeStudents}
            avgProgress={avgProgress}
            lessonsComplete={lessonsComplete}
            lessonsCount={LESSONS.length}
            subject={cls.subject}
          />

          <ClassTabBar
            tab={tab}
            onTabChange={handleTabChange}
            search={search}
            onSearchChange={setSearch}
          />

          <div className="cd-tab-content">
            {tab === 'students'    && <StudentList    students={filteredStudents} lessonsTotal={cls.lessonsTotal} />}
            {tab === 'lessons'     && <LessonList     lessons={filteredLessons} />}
            {tab === 'assignments' && <AssignmentList assignments={ASSIGNMENTS} />}
          </div>
        </div>
      </div>
    </div>
  )
}
