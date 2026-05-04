import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar              from '../../components/teacher/NavBar'
import ProgressStats       from '../../components/teacher/progress/ProgressStats'
import ProgressClassTabs   from '../../components/teacher/progress/ProgressClassTabs'
import ProgressToolbar     from '../../components/teacher/progress/ProgressToolbar'
import ProgressTable       from '../../components/teacher/progress/ProgressTable'
import { CLASSES, STUDENTS, STATUS_ORDER } from './progressMock'
import '../css/teacher/Progress.css'

export default function Progress() {
  const navigate = useNavigate()

  const [classFilter,   setClassFilter]   = useState('all')
  const [statusFilter,  setStatusFilter]  = useState('all')
  const [search,        setSearch]        = useState('')
  const [sortBy,        setSortBy]        = useState('status')

  const visible = STUDENTS
    .filter(s => classFilter === 'all' || s.classId === classFilter)
    .filter(s => statusFilter === 'all' || s.status === statusFilter)
    .filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase().trim()) ||
      s.className.toLowerCase().includes(search.toLowerCase().trim())
    )
    .sort((a, b) => {
      if (sortBy === 'name')     return a.name.localeCompare(b.name)
      if (sortBy === 'progress') return (b.lessonsDone / b.lessonsTotal) - (a.lessonsDone / a.lessonsTotal)
      if (sortBy === 'score')    return (b.avgScore ?? -1) - (a.avgScore ?? -1)
      if (sortBy === 'status')   return STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
      return 0
    })

  const atRiskCount = STUDENTS.filter(s => s.status === 'at-risk').length
  const avgPct      = Math.round(STUDENTS.reduce((sum, s) => sum + (s.lessonsDone / s.lessonsTotal) * 100, 0) / STUDENTS.length)
  const scored      = STUDENTS.filter(s => s.avgScore !== null)
  const avgScore    = Math.round(scored.reduce((sum, s) => sum + s.avgScore, 0) / scored.length)

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
          totalStudents={STUDENTS.length}
          classCount={CLASSES.length - 1}
          avgPct={avgPct}
          avgScore={avgScore}
          atRiskCount={atRiskCount}
        />

        <ProgressClassTabs
          classes={CLASSES}
          students={STUDENTS}
          classFilter={classFilter}
          onClassChange={setClassFilter}
        />

        <ProgressToolbar
          students={STUDENTS}
          classFilter={classFilter}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          search={search}
          onSearchChange={setSearch}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        <ProgressTable students={visible} totalCount={STUDENTS.length} />
      </div>
    </div>
  )
}
