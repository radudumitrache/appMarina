import { useState, useEffect, useRef } from 'react'
import {
  getCourses, createCourse, updateCourse as apiUpdateCourse,
  getCourse, addCourseLesson, removeCourseLesson, reorderCourseLesson,
  getLessons,
} from '../../api/lessons'
import { CAT_LABELS } from '../../components/teacher/course-builder/courseBuilderUtils'

export function useCourseBuilder() {
  const [courses, setCourses]                   = useState([])
  const [courseLessonsMap, setCourseLessonsMap] = useState({})
  const [lessonBank, setLessonBank]             = useState([])
  const [selectedId, setSelected]               = useState(null)
  const [search, setSearch]                     = useState('')
  const [bankSearch, setBankSearch]             = useState('')
  const [bankOpen, setBankOpen]                 = useState(false)
  const [loading, setLoading]                   = useState(true)
  const [loadingDetail, setLoadingDetail]       = useState(false)
  const [error, setError]                       = useState(null)
  const [saving, setSaving]                     = useState(false)

  const titleDebounceRef = useRef(null)
  const descDebounceRef  = useRef(null)

  const selected        = courses.find(c => c.id === selectedId) ?? null
  const selectedLessons = selectedId != null ? (courseLessonsMap[selectedId] ?? null) : null

  const visible = courses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase().trim())
  )

  const bankFiltered = lessonBank.filter(l => {
    const q = bankSearch.toLowerCase().trim()
    return (
      l.title.toLowerCase().includes(q) ||
      (CAT_LABELS[l.category] ?? l.category).toLowerCase().includes(q)
    )
  })

  /* ── Load courses + lesson bank on mount ──────────────────────────────── */
  useEffect(() => {
    setLoading(true)
    Promise.all([getCourses(), getLessons()])
      .then(([cRes, lRes]) => {
        const list = cRes.data
        setCourses(list)
        setLessonBank(lRes.data)
        if (list.length > 0) setSelected(list[0].id)
      })
      .catch(() => setError('Could not load data.'))
      .finally(() => setLoading(false))
  }, [])

  /* ── Load course detail when selection changes ────────────────────────── */
  useEffect(() => {
    if (selectedId == null) return
    if (courseLessonsMap[selectedId] !== undefined) return

    setLoadingDetail(true)
    getCourse(selectedId)
      .then(res => {
        const lessons = (res.data.lessons ?? []).map(cl => cl.lesson_detail ?? cl)
        setCourseLessonsMap(prev => ({ ...prev, [selectedId]: lessons }))
      })
      .catch(() => {})
      .finally(() => setLoadingDetail(false))
  }, [selectedId]) // courseLessonsMap intentionally omitted

  /* ── Helpers ──────────────────────────────────────────────────────────── */
  function setLessonsFor(courseId, updater) {
    setCourseLessonsMap(prev => ({
      ...prev,
      [courseId]: typeof updater === 'function' ? updater(prev[courseId] ?? []) : updater,
    }))
  }

  function reloadDetail(courseId) {
    getCourse(courseId)
      .then(res => {
        const lessons = (res.data.lessons ?? []).map(cl => cl.lesson_detail ?? cl)
        setCourseLessonsMap(prev => ({ ...prev, [courseId]: lessons }))
      })
      .catch(() => {})
  }

  /* ── Course mutations ─────────────────────────────────────────────────── */
  async function handleNewCourse() {
    try {
      const res = await createCourse({ title: 'Untitled Course', description: '', status: 'draft' })
      const course = res.data
      setCourses(prev => [course, ...prev])
      setSelected(course.id)
      setLessonsFor(course.id, [])
    } catch {
      setError('Could not create course.')
    }
  }

  function handleTitleChange(id, newTitle) {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, title: newTitle } : c))
    clearTimeout(titleDebounceRef.current)
    titleDebounceRef.current = setTimeout(() => {
      apiUpdateCourse(id, { title: newTitle }).catch(() => {})
    }, 700)
  }

  function handleDescChange(id, newDesc) {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, description: newDesc } : c))
    clearTimeout(descDebounceRef.current)
    descDebounceRef.current = setTimeout(() => {
      apiUpdateCourse(id, { description: newDesc }).catch(() => {})
    }, 700)
  }

  async function handleToggleStatus(id) {
    const course = courses.find(c => c.id === id)
    if (!course) return
    const newStatus = course.status === 'published' ? 'draft' : 'published'
    setCourses(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c))
    try {
      await apiUpdateCourse(id, { status: newStatus })
    } catch {
      setCourses(prev => prev.map(c => c.id === id ? { ...c, status: course.status } : c))
    }
  }

  /* ── Lesson mutations ─────────────────────────────────────────────────── */
  async function handleAddLesson(lessonId) {
    if (!selectedId) return
    const lesson = lessonBank.find(l => l.id === lessonId)
    if (!lesson) return

    setLessonsFor(selectedId, prev => [...prev, lesson])
    setSaving(true)
    try {
      await addCourseLesson(selectedId, { lesson_id: lessonId })
      reloadDetail(selectedId)
    } catch {
      reloadDetail(selectedId)
    } finally {
      setSaving(false)
    }
  }

  async function handleRemoveLesson(lessonId) {
    if (!selectedId) return
    setLessonsFor(selectedId, prev => prev.filter(l => l.id !== lessonId))
    try {
      await removeCourseLesson(selectedId, lessonId)
    } catch {
      reloadDetail(selectedId)
    }
  }

  async function handleMoveLesson(index, direction) {
    if (!selectedLessons) return
    const toIdx = index + direction
    if (toIdx < 0 || toIdx >= selectedLessons.length) return

    const next = [...selectedLessons]
    ;[next[index], next[toIdx]] = [next[toIdx], next[index]]
    setLessonsFor(selectedId, next)

    try {
      await reorderCourseLesson(selectedId, { lesson_id: next[toIdx].id, new_order: toIdx })
    } catch {
      reloadDetail(selectedId)
    }
  }

  return {
    courses, loading, error,
    selectedId, setSelected,
    search, setSearch,
    bankSearch, setBankSearch,
    bankOpen, setBankOpen,
    saving, loadingDetail,
    selected, selectedLessons,
    visible, bankFiltered, lessonBank, courseLessonsMap,
    handleNewCourse,
    handleTitleChange, handleDescChange, handleToggleStatus,
    handleAddLesson, handleRemoveLesson, handleMoveLesson,
  }
}
