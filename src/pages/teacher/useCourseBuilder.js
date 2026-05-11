import { useState, useEffect, useRef, useMemo } from 'react'
import {
  getCourses, createCourse, updateCourse as apiUpdateCourse, deleteCourse as apiDeleteCourse,
  getCourse, addCourseLesson, removeCourseLesson, reorderCourseLesson,
  getLessons, createLesson as apiCreateLesson, updateLesson as apiUpdateLesson, deleteLesson as apiDeleteLesson,
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
  const [activeTab, setActiveTab]               = useState('courses')

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
      (CAT_LABELS[l.category] ?? l.category ?? '').toLowerCase().includes(q)
    )
  })

  const lessonCourseMap = useMemo(() => {
    const map = {}
    for (const [courseId, lessons] of Object.entries(courseLessonsMap)) {
      const course = courses.find(c => c.id === Number(courseId))
      if (!course || !lessons) continue
      for (const l of lessons) {
        if (!map[l.id]) map[l.id] = []
        map[l.id].push(course)
      }
    }
    return map
  }, [courseLessonsMap, courses])

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
  }, [selectedId]) // eslint-disable-line react-hooks/exhaustive-deps

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

  function ensureAllCoursesLoaded() {
    const unloaded = courses.filter(c => courseLessonsMap[c.id] === undefined)
    for (const c of unloaded) {
      getCourse(c.id)
        .then(res => {
          const lessons = (res.data.lessons ?? []).map(cl => cl.lesson_detail ?? cl)
          setCourseLessonsMap(prev => ({ ...prev, [c.id]: lessons }))
        })
        .catch(() => {})
    }
  }

  /* ── Course mutations ─────────────────────────────────────────────────── */
  async function handleNewCourse({ title, description = '', status = 'draft', classroom_id = null } = {}) {
    const res = await createCourse({ title: title?.trim() || 'Untitled Course', description, status, classroom_id })
    const course = res.data
    setCourses(prev => [course, ...prev])
    setSelected(course.id)
    setActiveTab('courses')
    setLessonsFor(course.id, [])
    return course
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

  async function handleClassroomChange(id, classroomId) {
    const prev = courses.find(c => c.id === id)
    const prevClassroomId = prev?.classroom_id ?? null
    setCourses(list => list.map(c => c.id === id ? { ...c, classroom_id: classroomId ? Number(classroomId) : null } : c))
    try {
      await apiUpdateCourse(id, { classroom_id: classroomId ? Number(classroomId) : null })
    } catch {
      setCourses(list => list.map(c => c.id === id ? { ...c, classroom_id: prevClassroomId } : c))
    }
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

  async function handleDeleteCourse(id) {
    try {
      await apiDeleteCourse(id)
      const remaining = courses.filter(c => c.id !== id)
      setCourses(remaining)
      setCourseLessonsMap(prev => {
        const next = { ...prev }
        delete next[id]
        return next
      })
      if (selectedId === id) setSelected(remaining[0]?.id ?? null)
    } catch {
      setError('Could not delete course.')
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
      await addCourseLesson(selectedId, { lesson: lessonId })
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

  async function handleCreateLesson(data) {
    const res = await apiCreateLesson(data)
    const lesson = res.data
    setLessonBank(prev => [lesson, ...prev])
    return lesson
  }

  async function handleUpdateLesson(lessonId, data) {
    await apiUpdateLesson(lessonId, data)
    const updateFn = l => l.id === lessonId ? { ...l, ...data } : l
    setLessonBank(prev => prev.map(updateFn))
    setCourseLessonsMap(prev => {
      const next = { ...prev }
      for (const id of Object.keys(next)) {
        if (next[id]) next[id] = next[id].map(updateFn)
      }
      return next
    })
  }

  async function handleDeleteLesson(lessonId) {
    await apiDeleteLesson(lessonId)
    setLessonBank(prev => prev.filter(l => l.id !== lessonId))
    setCourseLessonsMap(prev => {
      const next = { ...prev }
      for (const id of Object.keys(next)) {
        if (next[id]) next[id] = next[id].filter(l => l.id !== lessonId)
      }
      return next
    })
  }

  return {
    courses, loading, error,
    selectedId, setSelected,
    search, setSearch,
    bankSearch, setBankSearch,
    bankOpen, setBankOpen,
    saving, loadingDetail,
    selected, selectedLessons,
    visible, bankFiltered, lessonBank, courseLessonsMap, lessonCourseMap,
    activeTab, setActiveTab,
    handleNewCourse,
    handleTitleChange, handleDescChange, handleClassroomChange, handleToggleStatus, handleDeleteCourse,
    handleAddLesson, handleRemoveLesson, handleMoveLesson,
    handleCreateLesson, handleUpdateLesson, handleDeleteLesson,
    ensureAllCoursesLoaded,
  }
}
