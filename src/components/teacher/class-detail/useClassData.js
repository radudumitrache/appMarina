import { useState, useEffect } from 'react'
import { getDepartment, getClassStudents, getClassModules, getAnnouncements } from '../../../api/departments'
import { getTests } from '../../../api/tests'

export function useClassData(id) {
  const [cls,           setCls]           = useState(null)
  const [students,      setStudents]      = useState([])
  const [modules,       setModules]       = useState([])
  const [tests,         setTests]         = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [loading,       setLoading]       = useState(true)

  useEffect(() => {
    Promise.all([
      getDepartment(id),
      getClassStudents(id),
      getClassModules(id),
      getTests({ class: id }),
      getAnnouncements(id),
    ]).then(([clsRes, stuRes, modRes, testRes, annRes]) => {
      setCls(clsRes.data)
      setAnnouncements(annRes.data)

      setStudents(stuRes.data.map(e => ({
        id:         e.student,
        initials:   (e.student_name || '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
        name:       e.student_name,
        email:      e.student_email,
        done:       e.modules_done ?? 0,
        testsTotal: e.tests_total  ?? 0,
        testsDone:  e.tests_done   ?? 0,
        lastActive: e.last_active ? new Date(e.last_active).toLocaleDateString() : 'â€”',
        status:     e.status,
      })))

      setModules(modRes.data.map((cl, i) => ({
        id:       cl.module,
        num:      String(i + 1).padStart(2, '0'),
        title:    cl.module_detail?.title ?? 'â€”',
        duration: cl.module_detail?.duration_minutes ? `${cl.module_detail.duration_minutes} min` : 'â€”',
        completed:      Math.round((cl.completion_pct / 100) * (clsRes.data.student_count || 0)),
        total:          clsRes.data.student_count || 0,
      })))

      setTests(testRes.data)
    }).finally(() => setLoading(false))
  }, [id])

  function handleModuleUpdate(moduleId, data) {
    setModules(prev => prev.map(l => l.id !== moduleId ? l : {
      ...l,
      title:    data.title ?? l.title,
      duration: data.duration_minutes != null ? `${data.duration_minutes} min` : l.duration,
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
    students, modules, tests, announcements,
    loading,
    handleModuleUpdate,
    handleTestCreated,
    handleAnnouncementAdded,
    handleAnnouncementUpdated,
    handleAnnouncementRemoved,
  }
}
