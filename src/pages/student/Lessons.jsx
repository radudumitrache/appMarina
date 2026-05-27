import { useState, useEffect } from 'react'
import NavBar from '../../components/student/NavBar'
import LessonsSwitcher from '../../components/student/lessons/LessonsSwitcher'
import LessonsSkeleton from '../../components/student/lessons/LessonsSkeleton'
import ClassCoursesSection from '../../components/student/lessons/ClassCoursesSection'
import PublicLessonsSection from '../../components/student/lessons/PublicLessonsSection'
import { getLessons, getCourses, completeLesson, uncompleteLesson } from '../../api/lessons'
import { getDepartments } from '../../api/departments'
import '../css/student/Lessons.css'

function mapLesson(l) {
  return {
    id:         l.id,
    title:      l.title,
    duration:   l.duration_minutes ? `${l.duration_minutes} min` : '—',
    locked:     l.locked      ?? false,
    complete:   l.completed   ?? false,
    author:     l.author_name ?? '',
    visibility: l.visibility  ?? 'public',
    difficulty: l.difficulty  ?? 'intermediate',
  }
}

export default function Lessons() {
  const [mode, setMode]                   = useState('courses')
  const [departments, setDepartments]     = useState([])
  const [courses, setCourses]             = useState([])
  const [publicLessons, setPublicLessons] = useState([])
  const [loading, setLoading]             = useState(true)

  useEffect(() => {
    Promise.all([
      getDepartments(),
      getCourses(),
      getLessons({ visibility: 'public' }),
    ]).then(([clsRes, crsRes, lesRes]) => {
      setDepartments(clsRes.data ?? [])
      setCourses(crsRes.data ?? [])
      setPublicLessons((lesRes.data ?? []).map(mapLesson))
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  function handleLessonToggle(courseId, lessonId, newCompleted) {
    setCourses(prev => prev.map(c => c.id !== courseId ? c : {
      ...c,
      lessons: c.lessons.map(cl => cl.lesson !== lessonId ? cl : {
        ...cl,
        lesson_detail: { ...cl.lesson_detail, completed: newCompleted },
      }),
    }))
  }

  function handlePublicToggle(id) {
    const lesson = publicLessons.find(l => l.id === id)
    if (!lesson || lesson.locked) return
    const wasComplete = lesson.complete
    setPublicLessons(prev => prev.map(l => l.id === id ? { ...l, complete: !l.complete } : l))
    const apiCall = wasComplete ? uncompleteLesson : completeLesson
    apiCall(id).catch(() => {
      setPublicLessons(prev => prev.map(l => l.id === id ? { ...l, complete: wasComplete } : l))
    })
  }

  const courseGroups = departments
    .map(cls => ({ cls, items: courses.filter(c => c.department_id === cls.id) }))
    .filter(g => g.items.length > 0)

  return (
    <div className="lessons-page">
      <div className="lessons-layout">
        <NavBar />

        <main className="lessons-main">
          <LessonsSwitcher mode={mode} onChange={setMode} />

          {loading ? (
            <LessonsSkeleton />
          ) : (
            <>
              {mode === 'courses' && (
                <ClassCoursesSection
                  classes={departments}
                  courseGroups={courseGroups}
                  onLessonToggle={handleLessonToggle}
                />
              )}
              {mode === 'public' && (
                <PublicLessonsSection
                  lessons={publicLessons}
                  onToggleComplete={handlePublicToggle}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}
