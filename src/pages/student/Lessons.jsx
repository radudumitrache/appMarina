import { useState, useEffect } from 'react'
import NavBar from '../../components/student/NavBar'
import LessonsSwitcher from '../../components/student/lessons/LessonsSwitcher'
import LessonsSkeleton from '../../components/student/lessons/LessonsSkeleton'
import ClassCoursesSection from '../../components/student/lessons/ClassCoursesSection'
import PublicLessonsSection from '../../components/student/lessons/PublicLessonsSection'
import { getLessons, getCourses, completeLesson, uncompleteLesson } from '../../api/lessons'
import { getClasses } from '../../api/classes'
import '../css/student/Lessons.css'

export { CATEGORIES } from '../../components/student/lessons/PublicLessonsSection'

function mapLesson(l) {
  return {
    id:         l.id,
    cat:        l.category        ?? 'nav',
    title:      l.title,
    duration:   l.duration_minutes ? `${l.duration_minutes} min` : '—',
    locked:     l.locked          ?? false,
    complete:   l.completed       ?? false,
    author:     l.author_name     ?? '',
    visibility: l.visibility      ?? 'public',
    difficulty: l.difficulty      ?? 'intermediate',
  }
}

export default function Lessons() {
  const [mode, setMode]                     = useState('courses')
  const [classes, setClasses]               = useState([])
  const [courses, setCourses]               = useState([])
  const [publicLessons, setPublicLessons]   = useState([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [loading, setLoading]               = useState(true)

  useEffect(() => {
    Promise.all([
      getClasses(),
      getCourses(),
      getLessons({ visibility: 'public' }),
    ]).then(([clsRes, crsRes, lesRes]) => {
      setClasses(clsRes.data ?? [])
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

  const courseGroups = classes
    .map(cls => ({ cls, items: courses.filter(c => c.classroom_id === cls.id) }))
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
                  classes={classes}
                  courseGroups={courseGroups}
                  onLessonToggle={handleLessonToggle}
                />
              )}
              {mode === 'public' && (
                <PublicLessonsSection
                  lessons={publicLessons}
                  activeCategory={activeCategory}
                  onCategoryChange={setActiveCategory}
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
