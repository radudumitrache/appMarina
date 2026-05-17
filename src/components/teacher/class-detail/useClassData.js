import { useState, useEffect } from 'react'
import { getClass, getClassStudents, getClassLessons, getAnnouncements } from '../../../api/classes'
import { getTests } from '../../../api/tests'

export function useClassData(id) {
  const [cls,           setCls]           = useState(null)
  const [students,      setStudents]      = useState([])
  const [lessons,       setLessons]       = useState([])
  const [tests,         setTests]         = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [loading,       setLoading]       = useState(true)

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
        id:             cl.lesson,
        num:            String(i + 1).padStart(2, '0'),
        title:          cl.lesson_detail?.title     ?? '—',
        department_ids: cl.lesson_detail?.department_ids ?? [],
        duration:       cl.lesson_detail?.duration_minutes ? `${cl.lesson_detail.duration_minutes} min` : '—',
        completed:      Math.round((cl.completion_pct / 100) * (clsRes.data.student_count || 0)),
        total:          clsRes.data.student_count || 0,
      })))

      setTests(testRes.data)
    }).finally(() => setLoading(false))
  }, [id])

  function handleClassLessonUpdate(lessonId, data) {
    setLessons(prev => prev.map(l => l.id !== lessonId ? l : {
      ...l,
      title:          data.title          ?? l.title,
      department_ids: data.department_ids ?? l.department_ids,
      duration:       data.duration_minutes != null ? `${data.duration_minutes} min` : l.duration,
    }))
  }

  function handleTestCreated(test) {
    setTests(prev => [...prev, test])
  }

  function handleAnnouncementAdded(ann) {
    setAnnouncements(prev =>
      [ann, ...prev].sort((a, b) => (b.pinned - a.pinned) || new Date(b.created_at) - new Date(a.created_at))
    )
  }

  function handleAnnouncementUpdated(ann) {
    setAnnouncements(prev =>
      prev.map(a => a.id === ann.id ? ann : a)
         .sort((a, b) => (b.pinned - a.pinned) || new Date(b.created_at) - new Date(a.created_at))
    )
  }

  function handleAnnouncementRemoved(annId) {
    setAnnouncements(prev => prev.filter(a => a.id !== annId))
  }

  return {
    cls, setCls,
    students, lessons, tests, announcements,
    loading,
    handleClassLessonUpdate,
    handleTestCreated,
    handleAnnouncementAdded,
    handleAnnouncementUpdated,
    handleAnnouncementRemoved,
  }
}
