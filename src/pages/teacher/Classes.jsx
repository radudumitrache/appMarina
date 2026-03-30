import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '../../components/teacher/NavBar'
import ClassCard from '../../components/teacher/classes/ClassCard'
import '../css/teacher/Classes.css'

const CLASSES = [
  {
    id: 1,
    name: 'Maritime Navigation — Alpha',
    code: 'MN-2024-A',
    subject: 'Bridge Navigation',
    students: 24,
    lessonsTotal: 12,
    lessonsDone: 7,
    status: 'active',
  },
  {
    id: 2,
    name: 'Emergency Protocols — Beta',
    code: 'EP-2024-B',
    subject: 'Emergency Protocols',
    students: 18,
    lessonsTotal: 8,
    lessonsDone: 3,
    status: 'active',
  },
  {
    id: 3,
    name: 'Engine Room Ops — Charlie',
    code: 'ER-2024-C',
    subject: 'Engine Room',
    students: 20,
    lessonsTotal: 10,
    lessonsDone: 9,
    status: 'active',
  },
  {
    id: 4,
    name: 'Cargo & Logistics — Delta',
    code: 'CL-2024-D',
    subject: 'Cargo Management',
    students: 15,
    lessonsTotal: 6,
    lessonsDone: 2,
    status: 'active',
  },
  {
    id: 5,
    name: 'Communications — Echo',
    code: 'CM-2024-E',
    subject: 'Communications',
    students: 22,
    lessonsTotal: 5,
    lessonsDone: 5,
    status: 'complete',
  },
  {
    id: 6,
    name: 'Advanced Navigation — 2023',
    code: 'AN-2023-F',
    subject: 'Bridge Navigation',
    students: 19,
    lessonsTotal: 14,
    lessonsDone: 14,
    status: 'archived',
  },
]

const TABS = [
  { id: 'all',      label: 'All'      },
  { id: 'active',   label: 'Active'   },
  { id: 'complete', label: 'Complete' },
  { id: 'archived', label: 'Archived' },
]

export default function Classes() {
  const navigate = useNavigate()
  const [tab, setTab]       = useState('all')
  const [search, setSearch] = useState('')

  const filtered = CLASSES
    .filter(c => tab === 'all' || c.status === tab)
    .filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase().trim()) ||
      c.subject.toLowerCase().includes(search.toLowerCase().trim())
    )

  const totalStudents = CLASSES.reduce((sum, c) => sum + c.students, 0)
  const activeCount   = CLASSES.filter(c => c.status === 'active').length
  const avgProgress   = Math.round(
    CLASSES.reduce((sum, c) => sum + (c.lessonsDone / c.lessonsTotal) * 100, 0) / CLASSES.length
  )

  return (
    <div className="classes-page">
      <div className="classes-layout">
        <NavBar />

        {/* ─── Page header ──────────────────────────────────────────────── */}
        <div className="classes-header">
          <div className="classes-header-left">
            <button
              className="classes-breadcrumb"
              onClick={() => navigate('/teacher/dashboard')}
            >
              Dashboard /
            </button>
            <h1 className="classes-title">My Classes</h1>
          </div>
          <button className="classes-new-btn">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5"  y1="12" x2="19" y2="12"/>
            </svg>
            New Class
          </button>
        </div>

        <div className="classes-content">

          {/* ─── Stat cards ─────────────────────────────────────────────── */}
          <div className="classes-stats">
            <div className="stat-card">
              <span className="stat-label">Total Classes</span>
              <span className="stat-value">{CLASSES.length}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Total Students</span>
              <span className="stat-value">{totalStudents}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Active Classes</span>
              <span className="stat-value">{activeCount}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Avg. Progress</span>
              <span className="stat-value">{avgProgress}%</span>
            </div>
          </div>

          {/* ─── Toolbar: tabs + search ──────────────────────────────────── */}
          <div className="classes-toolbar">
            <div className="classes-tabs">
              {TABS.map(t => (
                <button
                  key={t.id}
                  className={`tab-btn ${tab === t.id ? 'tab-btn--active' : ''}`}
                  onClick={() => setTab(t.id)}
                >
                  {t.label}
                  {t.id !== 'all' && (
                    <span className="tab-count">
                      {CLASSES.filter(c => c.status === t.id).length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="classes-search-wrap">
              <svg className="classes-search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                className="classes-search-input"
                type="text"
                placeholder="Search classes…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button className="classes-search-clear" onClick={() => setSearch('')} title="Clear">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6"  x2="6"  y2="18"/>
                    <line x1="6"  y1="6"  x2="18" y2="18"/>
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* ─── Class grid ─────────────────────────────────────────────── */}
          {filtered.length === 0 ? (
            <p className="classes-empty">No classes match your search.</p>
          ) : (
            <div className="classes-grid">
              {filtered.map((cls, i) => (
                <ClassCard
                  key={cls.id}
                  cls={cls}
                  index={i}
                  onView={() => navigate(`/teacher/classes/${cls.id}`)}
                  onManage={() => {}}
                />
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
