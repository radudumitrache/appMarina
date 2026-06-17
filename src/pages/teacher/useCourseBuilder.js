import { useState, useEffect, useRef, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  getCourses, createCourse, updateCourse as apiUpdateCourse, deleteCourse as apiDeleteCourse,
  getCourse, addCourseModule, removeCourseModule, reorderCourseModule,
  getModules, createModule as apiCreateModule, updateModule as apiUpdateModule, deleteModule as apiDeleteModule,
} from '../../api/modules'
import { getTests, createTest as apiCreateTest } from '../../api/tests'

export function useCourseBuilder() {
  const [searchParams] = useSearchParams()
  const [courses, setCourses]                   = useState([])
  const [courseModulesMap, setCourseModulesMap] = useState({})
  const [moduleBank, setModuleBank]             = useState([])
  const [allTests, setAllTests]                 = useState([])
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
  const selectedModules = selectedId != null ? (courseModulesMap[selectedId] ?? null) : null

  const visible = courses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase().trim())
  )

  const bankFiltered = moduleBank.filter(l => {
    const q = bankSearch.toLowerCase().trim()
    return l.title.toLowerCase().includes(q)
  })

  const moduleCourseMap = useMemo(() => {
    const map = {}
    for (const [courseId, modules] of Object.entries(courseModulesMap)) {
      const course = courses.find(c => c.id === Number(courseId))
      if (!course || !modules) continue
      for (const l of modules) {
        // Only index lesson entries by their module ID (tests are not in the bank)
        const moduleId = l._type === 'test' ? null : (l.moduleId ?? l.id)
        if (!moduleId) continue
        if (!map[moduleId]) map[moduleId] = []
        map[moduleId].push(course)
      }
    }
    return map
  }, [courseModulesMap, courses])

  /* â”€â”€ Load courses + module bank on mount â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  useEffect(() => {
    setLoading(true)
    const safe = p => p.catch(() => null)
    Promise.all([safe(getCourses()), safe(getModules()), safe(getTests())])
      .then(([cRes, lRes, tRes]) => {
        if (!cRes) { setError('Could not load courses.'); return }
        const list = cRes.data
        setCourses(list)
        if (lRes) setModuleBank(lRes.data)
        if (tRes) setAllTests(tRes.data)
        const selectParam = searchParams.get('select')
        const preselect = selectParam ? list.find(c => c.id === Number(selectParam)) : null
        if (preselect) setSelected(preselect.id)
        else if (list.length > 0) setSelected(list[0].id)
      })
      .finally(() => setLoading(false))
  }, [])

  /* â”€â”€ Load course detail when selection changes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  useEffect(() => {
    if (selectedId == null) return
    if (courseModulesMap[selectedId] !== undefined) return

    setLoadingDetail(true)
    getCourse(selectedId)
      .then(res => {
        setCourseModulesMap(prev => ({ ...prev, [selectedId]: normalizeModules(res.data.modules) }))
      })
      .catch(() => {})
      .finally(() => setLoadingDetail(false))
  }, [selectedId]) // eslint-disable-line react-hooks/exhaustive-deps

  /* â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  function setModulesFor(courseId, updater) {
    setCourseModulesMap(prev => ({
      ...prev,
      [courseId]: typeof updater === 'function' ? updater(prev[courseId] ?? []) : updater,
    }))
  }

  function normalizeModules(apiModules) {
    return (apiModules ?? []).map(cl => {
      if (cl.test_detail) {
        return {
          _courseModuleId: cl.id,
          _type: 'test',
          id: cl.id,
          moduleId: null,
          testId: cl.test,
          title: cl.test_detail.title,
          time_limit_minutes: cl.test_detail.time_limit_minutes,
          status: cl.test_detail.status,
        }
      }
      return {
        ...(cl.module_detail ?? cl),
        _courseModuleId: cl.id,
        _type: 'lesson',
        moduleId: (cl.module_detail ?? cl).id,
      }
    })
  }

  function reloadDetail(courseId) {
    getCourse(courseId)
      .then(res => {
        setCourseModulesMap(prev => ({ ...prev, [courseId]: normalizeModules(res.data.modules) }))
      })
      .catch(() => {})
  }

  function ensureAllCoursesLoaded() {
    const unloaded = courses.filter(c => courseModulesMap[c.id] === undefined)
    for (const c of unloaded) {
      getCourse(c.id)
        .then(res => {
          setCourseModulesMap(prev => ({ ...prev, [c.id]: normalizeModules(res.data.modules) }))
        })
        .catch(() => {})
    }
  }

  /* â”€â”€ Course mutations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  async function handleNewCourse({ title, description = '', status = 'draft', department_ids = [] } = {}) {
    const res = await createCourse({ title: title?.trim() || 'Untitled Course', description, status, department_ids })
    const course = res.data
    setCourses(prev => [course, ...prev])
    setSelected(course.id)
    setActiveTab('courses')
    setModulesFor(course.id, [])
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

  async function handleDepartmentsChange(id, departmentIds) {
    const prev = courses.find(c => c.id === id)
    const prevDepartmentIds = prev?.department_ids ?? []
    const nextIds = departmentIds.map(Number)
    setCourses(list => list.map(c => c.id === id ? { ...c, department_ids: nextIds } : c))
    try {
      await apiUpdateCourse(id, { department_ids: nextIds })
    } catch {
      setCourses(list => list.map(c => c.id === id ? { ...c, department_ids: prevDepartmentIds } : c))
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
      setCourseModulesMap(prev => {
        const next = { ...prev }
        delete next[id]
        return next
      })
      if (selectedId === id) setSelected(remaining[0]?.id ?? null)
    } catch {
      setError('Could not delete course.')
    }
  }

  /* â”€â”€ Lesson mutations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  async function handleAddModule(moduleId) {
    if (!selectedId) return
    const mod = moduleBank.find(l => l.id === moduleId)
    if (!mod) return

    setModulesFor(selectedId, prev => [...prev, mod])
    setSaving(true)
    try {
      await addCourseModule(selectedId, { module: moduleId })
      reloadDetail(selectedId)
    } catch {
      reloadDetail(selectedId)
    } finally {
      setSaving(false)
    }
  }

  async function handleAddTest(testId) {
    if (!selectedId) return
    const test = allTests.find(t => t.id === testId)
    if (!test) return

    setModulesFor(selectedId, prev => [...prev, {
      _courseModuleId: `temp-test-${testId}`,
      _type: 'test',
      id: `temp-test-${testId}`,
      moduleId: null,
      testId: test.id,
      title: test.title,
      time_limit_minutes: test.time_limit_minutes,
      status: test.status,
    }])
    setSaving(true)
    try {
      await addCourseModule(selectedId, { test: testId })
      reloadDetail(selectedId)
    } catch {
      reloadDetail(selectedId)
    } finally {
      setSaving(false)
    }
  }

  async function handleRemoveModule(courseModuleId) {
    if (!selectedId) return
    setModulesFor(selectedId, prev => prev.filter(l => (l._courseModuleId ?? l.id) !== courseModuleId))
    try {
      await removeCourseModule(selectedId, courseModuleId)
    } catch {
      reloadDetail(selectedId)
    }
  }

  async function handleMoveModule(index, direction) {
    if (!selectedModules) return
    const toIdx = index + direction
    if (toIdx < 0 || toIdx >= selectedModules.length) return

    const next = [...selectedModules]
    ;[next[index], next[toIdx]] = [next[toIdx], next[index]]
    setModulesFor(selectedId, next)

    try {
      const movedItem = next[toIdx]
      await reorderCourseModule(selectedId, {
        coursemodule_id: movedItem._courseModuleId ?? movedItem.id,
        new_order: toIdx,
      })
    } catch {
      reloadDetail(selectedId)
    }
  }

  async function handleCreateModule(data) {
    const res = await apiCreateModule(data)
    const module = res.data
    setModuleBank(prev => [module, ...prev])
    return module
  }

  async function handleCreateTest(data) {
    const res = await apiCreateTest(data)
    const test = res.data
    setAllTests(prev => [test, ...prev])
    if (selectedId) {
      setModulesFor(selectedId, prev => [...prev, {
        _courseModuleId: `temp-test-${test.id}`,
        _type: 'test',
        id: `temp-test-${test.id}`,
        moduleId: null,
        testId: test.id,
        title: test.title,
        time_limit_minutes: test.time_limit_minutes,
        status: test.status,
      }])
      setSaving(true)
      try {
        await addCourseModule(selectedId, { test: test.id })
        reloadDetail(selectedId)
      } catch {
        reloadDetail(selectedId)
      } finally {
        setSaving(false)
      }
    }
    return test
  }

  async function handleUpdateModule(moduleId, data) {
    await apiUpdateModule(moduleId, data)
    const updateFn = l => l.id === moduleId ? { ...l, ...data } : l
    setModuleBank(prev => prev.map(updateFn))
    setCourseModulesMap(prev => {
      const next = { ...prev }
      for (const id of Object.keys(next)) {
        if (next[id]) next[id] = next[id].map(updateFn)
      }
      return next
    })
  }

  async function handleDeleteModule(moduleId) {
    await apiDeleteModule(moduleId)
    setModuleBank(prev => prev.filter(l => l.id !== moduleId))
    setCourseModulesMap(prev => {
      const next = { ...prev }
      for (const id of Object.keys(next)) {
        if (next[id]) next[id] = next[id].filter(l => l.id !== moduleId)
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
    selected, selectedModules,
    visible, bankFiltered, moduleBank, courseModulesMap, moduleCourseMap,
    allTests,
    activeTab, setActiveTab,
    handleNewCourse,
    handleTitleChange, handleDescChange, handleDepartmentsChange, handleToggleStatus, handleDeleteCourse,
    handleAddModule, handleAddTest, handleRemoveModule, handleMoveModule,
    handleCreateModule, handleUpdateModule, handleDeleteModule, handleCreateTest,
    ensureAllCoursesLoaded,
  }
}
