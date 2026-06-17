import { useState, useEffect } from 'react'
import NavBar       from '../../components/student/NavBar'
import TestsSidebar from '../../components/student/tests/TestsSidebar'
import TestsToolbar from '../../components/student/tests/TestsToolbar'
import TestsContent from '../../components/student/tests/TestsContent'
import { getTests }   from '../../api/tests'
import { getDepartments } from '../../api/departments'
import '../css/student/Tests.css'

function getClassStats(tests, departmentId) {
  const subset =
    departmentId === 'all'  ? tests :
    departmentId === 'open' ? tests.filter(t => !t.departments?.length) :
    tests.filter(t => t.departments?.some(d => d.id === departmentId))
  return {
    total:   subset.length,
    pending: subset.filter(t => !t.completed).length,
    done:    subset.filter(t => t.completed).length,
  }
}

function avgGrade(tests) {
  const done = tests.filter(t => t.completed && t.grade !== null)
  if (!done.length) return null
  return Math.round(done.reduce((s, t) => s + t.grade, 0) / done.length)
}

export default function Tests() {
  const [tests,             setTests]             = useState([])
  const [departments,       setDepartments]       = useState([])
  const [loading,           setLoading]           = useState(true)
  const [error,             setError]             = useState(null)
  const [activeDepartment,  setActiveDepartment]  = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [searchQuery,  setSearchQuery]  = useState('')
  const [sidebarOpen,  setSidebarOpen]  = useState(false)

  useEffect(() => {
    Promise.all([getTests({}), getDepartments()])
      .then(([testsRes, classesRes]) => {
        console.log('[Tests] API returned', testsRes.data.length, 'tests:', testsRes.data)
        setTests(testsRes.data)
        setDepartments(classesRes.data)
      })
      .catch(err => {
        console.error('[Tests] API error:', err.response ?? err)
        setError(err.response?.data?.detail ?? err.message ?? 'Failed to load tests.')
      })
      .finally(() => setLoading(false))
  }, [])

  const activeLabel =
    activeDepartment === 'all'  ? 'All Tests'    :
    activeDepartment === 'open' ? 'Open Access'  :
    departments.find(c => c.id === activeDepartment)?.name ?? 'Tests'

  const byClass =
    activeDepartment === 'all'  ? tests :
    activeDepartment === 'open' ? tests.filter(t => !t.departments?.length) :
    tests.filter(t => t.departments?.some(d => d.id === activeDepartment))

  const bySource =
    sourceFilter === 'all'   ? byClass :
    sourceFilter === 'class' ? byClass.filter(t => t.departments?.length) :
    byClass.filter(t => !t.departments?.length)

  const filtered  = bySource.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase().trim())
  )
  const pending   = filtered.filter(t => !t.completed)
  const completed = filtered.filter(t => t.completed)

  const sortedPending = [...pending].sort((a, b) => {
    if (!a.due_date && !b.due_date) return 0
    if (!a.due_date) return 1
    if (!b.due_date) return -1
    return new Date(a.due_date) - new Date(b.due_date)
  })

  const overall = getClassStats(tests, 'all')

  const avg     = avgGrade(tests)

  return (
    <div className="tests-page">
      <div className="tests-layout">
        <NavBar />

        <div className="tests-body">
          {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
          <TestsSidebar
            tests={tests}
            departments={departments}
            activeDepartment={activeDepartment}
            onDepartmentChange={setActiveDepartment}
            overall={overall}
            avg={avg}
            className={sidebarOpen ? 'sidebar--open' : ''}
          />

          <main className="tests-main">
            <button className="sidebar-toggle-btn" onClick={() => setSidebarOpen(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
              Filters
            </button>
            <div className="tests-head">
              <h2 className="tests-title">{activeLabel}</h2>
              <span className="tests-count">
                {loading ? '…' : `${filtered.length} tests`}
              </span>
            </div>

            <TestsToolbar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sourceFilter={sourceFilter}
              onSourceFilter={setSourceFilter}
            />

            {loading ? (
              <p className="tests-empty">Loading…</p>
            ) : error ? (
              <p className="tests-empty tests-error">{error}</p>
            ) : (
              <TestsContent
                sortedPending={sortedPending}
                completed={completed}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
