import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '../../components/student/NavBar'
import LessonCard from '../../components/student/lessons/LessonCard'
import CourseCard from '../../components/student/lessons/CourseCard'
import { getLessons, getCourses, completeLesson, uncompleteLesson } from '../../api/lessons'
import { getClasses } from '../../api/classes'
import Sk from '../../components/shared/Skeleton'
import '../css/student/Lessons.css'

export const CATEGORIES = [
  { id: 'all',   label: 'All'               },
  { id: 'nav',   label: 'Bridge Navigation' },
  { id: 'emg',   label: 'Emergency'         },
  { id: 'eng',   label: 'Engine Room'       },
  { id: 'cargo', label: 'Cargo'             },
  { id: 'comm',  label: 'Communications'    },
]

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
  const navigate = useNavigate()
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

  const filteredPublic = activeCategory === 'all'
    ? publicLessons
    : publicLessons.filter(l => l.cat === activeCategory)

  return (
    <div className="lessons-page">
      <div className="lessons-layout">
        <NavBar />

        <main className="lessons-main">
          {/* ── Mode switcher ─────────────────────────────────────────── */}
          <div className="les-switcher">
            <button
              className={`les-switch-btn ${mode === 'courses' ? 'les-switch-btn--active' : ''}`}
              onClick={() => setMode('courses')}
            >
              Class Courses
            </button>
            <button
              className={`les-switch-btn ${mode === 'public' ? 'les-switch-btn--active' : ''}`}
              onClick={() => setMode('public')}
            >
              Public Lessons
            </button>
          </div>

          {loading ? (
            <div className="les-skeletons">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="les-sk-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Sk w="55%" h={14} r={4} />
                    <Sk w={80} h={4} r={2} style={{ marginLeft: 'auto' }} />
                    <Sk w={34} h={11} r={3} />
                  </div>
                  <Sk w="30%" h={11} r={3} mt={6} />
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* ── Class Courses ──────────────────────────────────────── */}
              {mode === 'courses' && (
                <div className="les-section">
                  {classes.length === 0 ? (
                    <div className="les-empty">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                      </svg>
                      <span>You haven't joined a class yet.</span>
                      <button className="les-join-link" onClick={() => navigate('/student/myclass')}>
                        Go to My Class →
                      </button>
                    </div>
                  ) : courseGroups.length === 0 ? (
                    <div className="les-empty">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                      </svg>
                      <span>No published courses in your classes yet.</span>
                    </div>
                  ) : (
                    courseGroups.map(({ cls, items }) => (
                      <div key={cls.id} className="les-class-group">
                        <div className="les-class-group-header">
                          <span className="les-class-group-name">{cls.name}</span>
                          <span className="les-class-group-code">{cls.code}</span>
                          <span className="les-class-group-count">{items.length} course{items.length !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="les-course-list">
                          {items.map((course, i) => (
                            <CourseCard
                              key={course.id}
                              course={course}
                              index={i}
                              onLessonToggle={handleLessonToggle}
                            />
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* ── Public Lessons ─────────────────────────────────────── */}
              {mode === 'public' && (
                <div className="les-section">
                  <div className="les-cat-pills">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        className={`les-cat-pill ${activeCategory === cat.id ? 'les-cat-pill--active' : ''}`}
                        onClick={() => setActiveCategory(cat.id)}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {filteredPublic.length === 0 ? (
                    <div className="les-empty">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"/>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                      </svg>
                      <span>No public lessons in this category.</span>
                    </div>
                  ) : (
                    <div className="lessons-list lessons-list--grid">
                      {filteredPublic.map((lesson, i) => (
                        <LessonCard
                          key={lesson.id}
                          lesson={lesson}
                          index={i}
                          viewMode="grid"
                          onToggleComplete={handlePublicToggle}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}
