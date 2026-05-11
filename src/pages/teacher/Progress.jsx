import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar            from '../../components/teacher/NavBar'
import ProgressStats     from '../../components/teacher/progress/ProgressStats'
import ProgressClassTabs from '../../components/teacher/progress/ProgressClassTabs'
import ProgressToolbar   from '../../components/teacher/progress/ProgressToolbar'
import ProgressTable     from '../../components/teacher/progress/ProgressTable'
import { getTeacherProgress } from '../../api/progress'
import { getClasses }         from '../../api/classes'
import Sk from '../../components/shared/Skeleton'
import '../css/teacher/Progress.css'

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function relativeTime(iso) {
  if (!iso) return 'Never'
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'Just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7)  return `${d}d ago`
  return `${Math.floor(d / 7)}w ago`
}

function mapStudent(s) {
  return {
    id:           s.student_id,
    name:         s.student_name,
    initials:     initials(s.student_name),
    classId:      s.classroom_id,
    className:    s.classroom_name,
    lessonsDone:  s.lessons_done,
    lessonsTotal: s.lessons_total,
    lastActive:   relativeTime(s.last_active),
    status:       s.status,
  }
}

export default function Progress() {
  const navigate = useNavigate()

  const [students,        setStudents]        = useState([])
  const [classes,         setClasses]         = useState([])
  const [loading,         setLoading]         = useState(true)
  const [classFilter,     setClassFilter]     = useState('all')
  const [search,          setSearch]          = useState('')
  const [sortBy,          setSortBy]          = useState('name')
  const [page,            setPage]            = useState(1)
  const [pageSize,        setPageSize]        = useState(10)

  useEffect(() => {
    Promise.all([getTeacherProgress(), getClasses()])
      .then(([progRes, clsRes]) => {
        setStudents(progRes.data.map(mapStudent))
        setClasses([
          { id: 'all', label: 'All Classes' },
          ...clsRes.data.map(c => ({ id: c.id, label: c.code ? `${c.code} — ${c.name}` : c.name })),
        ])
      })
      .finally(() => setLoading(false))
  }, [])

  const visible = useMemo(() => {
    setPage(1)
    return students
      .filter(s => classFilter === 'all' || s.classId === classFilter)
      .filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase().trim()) ||
        s.className.toLowerCase().includes(search.toLowerCase().trim())
      )
      .sort((a, b) => {
        if (sortBy === 'name')     return a.name.localeCompare(b.name)
        if (sortBy === 'progress') return (b.lessonsDone / (b.lessonsTotal || 1)) - (a.lessonsDone / (a.lessonsTotal || 1))
        return 0
      })
  }, [students, classFilter, search, sortBy])

  const totalPages = Math.max(1, Math.ceil(visible.length / pageSize))
  const paginated  = visible.slice((page - 1) * pageSize, page * pageSize)

  const avgPct = students.length
    ? Math.round(students.reduce((sum, s) => sum + (s.lessonsDone / (s.lessonsTotal || 1)) * 100, 0) / students.length)
    : 0

  if (loading) {
    return (
      <div className="tp-page">
        <NavBar />
        <header className="tp-header">
          <div className="tp-header-left">
            <Sk w={180} h={13} r={4} mb={8} />
            <Sk w={160} h={24} r={6} />
          </div>
        </header>
        <div className="tp-content">
          <div className="tp-stats">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="tp-stat-card">
                <Sk w="60%" h={11} r={3} mb={8} />
                <Sk w="40%" h={28} r={4} mb={6} />
                <Sk w="70%" h={10} r={3} />
              </div>
            ))}
          </div>
          <div className="tp-body">
            <div style={{ width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Array.from({ length: 4 }).map((_, i) => <Sk key={i} w="100%" h={56} r={8} />)}
            </div>
            <div className="tp-main">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 16px', borderBottom: '1px solid var(--border)', opacity: 1 - i * 0.1 }}>
                  <Sk w={32} h={32} r={16} style={{ flexShrink: 0 }} />
                  <Sk w={`${120 + (i % 3) * 30}px`} h={13} r={4} />
                  <Sk w={100} h={13} r={4} style={{ marginLeft: 'auto' }} />
                  <Sk w={120} h={8} r={4} />
                  <Sk w={40} h={13} r={4} />
                  <Sk w={60} h={13} r={4} />
                  <Sk w={64} h={20} r={4} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="tp-page">
      <NavBar />

      <header className="tp-header">
        <div className="tp-header-left">
          <div className="tp-breadcrumb">
            <button className="tp-crumb-link" onClick={() => navigate('/teacher/dashboard')}>Dashboard</button>
            <span className="tp-crumb-sep">/</span>
          </div>
          <h1 className="tp-title">Student Progress</h1>
        </div>
      </header>

      <div className="tp-content">
        <ProgressStats
          totalStudents={students.length}
          classCount={classes.length - 1}
          avgPct={avgPct}
        />

        <div className="tp-body">
          <ProgressClassTabs
            classes={classes}
            students={students}
            classFilter={classFilter}
            onClassChange={setClassFilter}
          />

          <div className="tp-main">
            <ProgressToolbar
              search={search}
              onSearchChange={setSearch}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />

            <ProgressTable
              students={paginated}
              filteredCount={visible.length}
              totalCount={students.length}
              selectedId={null}
              onSelect={s => navigate(`/teacher/students/${s.id}/progress`)}
              page={page}
              pageSize={pageSize}
              totalPages={totalPages}
              onPageChange={setPage}
              onPageSizeChange={n => { setPageSize(n); setPage(1) }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
