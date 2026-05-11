import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import NavBar from '../../components/teacher/NavBar'
import ClassHeader from '../../components/teacher/class-detail/ClassHeader'
import ClassStats from '../../components/teacher/class-detail/ClassStats'
import ClassTabBar from '../../components/teacher/class-detail/ClassTabBar'
import StudentList from '../../components/teacher/class-detail/StudentList'
import LessonsCoursesTab from '../../components/teacher/class-detail/LessonsCoursesTab'
import TestList from '../../components/teacher/class-detail/TestList'
import AnnouncementsTab from '../../components/teacher/class-detail/AnnouncementsTab'
import CreateLessonModal from '../../components/teacher/class-detail/CreateLessonModal'
import CreateTestModal from '../../components/teacher/class-detail/CreateTestModal'
import { getClass, getClassStudents, getClassLessons, getAnnouncements } from '../../api/classes'
import { createLesson } from '../../api/lessons'
import { getTests } from '../../api/tests'
import Sk from '../../components/shared/Skeleton'
import '../css/teacher/ClassDetail.css'

export default function ClassDetail() {
  const { id } = useParams()

  const [cls, setCls]               = useState(null)
  const [students, setStudents]     = useState([])
  const [lessons, setLessons]       = useState([])
  const [tests, setTests]           = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading]       = useState(true)
  const [tab, setTab]               = useState('students')
  const [search, setSearch]         = useState('')

  const [showLessonModal, setShowLessonModal] = useState(false)
  const [showTestModal,   setShowTestModal]   = useState(false)

  useEffect(() => {
    Promise.all([
      getClass(id),
      getClassStudents(id),
      getClassLessons(id),
      getTests({ class: id }),
      getAnnouncements(id),
    ]).then(([clsRes, stuRes, lesRes, testRes, annRes]) => {
      setCls(clsRes.data)
      setAnnouncements(annRes.data)

      setStudents(stuRes.data.map(e => ({
        id:         e.student,
        initials:   (e.student_name || '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
        name:       e.student_name,
        email:      e.student_email,
        done:       e.lessons_done ?? 0,
        lastActive: e.last_active ? new Date(e.last_active).toLocaleDateString() : '—',
        status:     e.status,
      })))

      setLessons(lesRes.data.map((cl, i) => ({
        id:        cl.lesson,
        num:       String(i + 1).padStart(2, '0'),
        title:     cl.lesson_detail?.title     ?? '—',
        cat:       cl.lesson_detail?.category  ?? '—',
        duration:  cl.lesson_detail?.duration_minutes ? `${cl.lesson_detail.duration_minutes} min` : '—',
        completed: Math.round((cl.completion_pct / 100) * (clsRes.data.student_count || 0)),
        total:     clsRes.data.student_count || 0,
      })))

      setTests(testRes.data)
    }).finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="cd-page">
        <div className="cd-layout">
          <NavBar />
          <div style={{ padding: '24px 40px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <Sk w={180} h={22} r={5} /><Sk w={60} h={20} r={4} />
            </div>
            <Sk w={120} h={12} r={4} />
            <div style={{ display: 'flex', gap: 12 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ flex: 1, background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px 20px' }}>
                  <Sk w="55%" h={22} r={4} mb={6} /><Sk w="70%" h={11} r={3} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {Array.from({ length: 3 }).map((_, i) => <Sk key={i} w={90} h={34} r={6} />)}
            </div>
          </div>
        </div>
      </div>
    )
  }

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

  const totalStudents   = students.length
  const activeStudents  = students.filter(s => s.status === 'active').length
  const lessonsComplete = lessons.filter(l => l.total > 0 && l.completed === l.total).length
  const avgProgress     = totalStudents > 0
    ? Math.round(students.reduce((sum, s) => sum + (s.done / (lessons.length || 1)) * 100, 0) / totalStudents)
    : 0

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase().trim()) ||
    s.email.toLowerCase().includes(search.toLowerCase().trim())
  )

  function handleTabChange(next) { setTab(next); setSearch('') }

  // Called when a new lesson is created and assigned via CreateLessonModal
  function handleLessonCreated(classLesson, lesson) {
    const num = lessons.length + 1
    setLessons(prev => [...prev, {
      id:        lesson.id,
      num:       String(num).padStart(2, '0'),
      title:     lesson.title,
      cat:       lesson.category ?? '—',
      duration:  lesson.duration_minutes ? `${lesson.duration_minutes} min` : '—',
      completed: 0,
      total:     totalStudents,
    }])
  }

  // Called when a lesson's metadata is updated inline in LessonsCoursesTab
  function handleClassLessonUpdate(lessonId, data) {
    setLessons(prev => prev.map(l => l.id !== lessonId ? l : {
      ...l,
      title:    data.title    ?? l.title,
      cat:      data.category ?? l.cat,
      duration: data.duration_minutes != null ? `${data.duration_minutes} min` : l.duration,
    }))
  }

  function handleTestCreated(test) { setTests(prev => [...prev, test]) }

  function handleAnnouncementAdded(ann) {
    setAnnouncements(prev => {
      const list = [ann, ...prev]
      return list.sort((a, b) => (b.pinned - a.pinned) || new Date(b.created_at) - new Date(a.created_at))
    })
  }

  function handleAnnouncementUpdated(ann) {
    setAnnouncements(prev => {
      const list = prev.map(a => a.id === ann.id ? ann : a)
      return list.sort((a, b) => (b.pinned - a.pinned) || new Date(b.created_at) - new Date(a.created_at))
    })
  }

  function handleAnnouncementRemoved(annId) {
    setAnnouncements(prev => prev.filter(a => a.id !== annId))
  }

  return (
    <>
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
            lessonsCount={lessons.length}
            subject={cls.subject}
          />

          <ClassTabBar
            tab={tab}
            onTabChange={handleTabChange}
            search={search}
            onSearchChange={setSearch}
            onNewTest={() => setShowTestModal(true)}
          />

          <div className="cd-tab-content">
            {tab === 'students' && (
              <StudentList students={filteredStudents} lessonsTotal={lessons.length} />
            )}
            {tab === 'lessons' && (
              <LessonsCoursesTab
                classId={id}
                classLessons={lessons}
                onNewLesson={() => setShowLessonModal(true)}
                onClassLessonUpdate={handleClassLessonUpdate}
              />
            )}
            {tab === 'tests' && <TestList tests={tests} />}
            {tab === 'announcements' && (
              <AnnouncementsTab
                classId={id}
                announcements={announcements}
                onAdd={handleAnnouncementAdded}
                onUpdate={handleAnnouncementUpdated}
                onRemove={handleAnnouncementRemoved}
              />
            )}
          </div>
        </div>
      </div>
    </div>

    {showLessonModal && (
      <CreateLessonModal
        classId={id}
        onClose={() => setShowLessonModal(false)}
        onCreated={handleLessonCreated}
      />
    )}
    {showTestModal && (
      <CreateTestModal
        classId={id}
        onClose={() => setShowTestModal(false)}
        onCreated={handleTestCreated}
      />
    )}
    </>
  )
}
