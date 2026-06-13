import { useState, useEffect } from 'react'
import NavBar       from '../../components/teacher/NavBar'
import TestsSidebar from '../../components/teacher/tests/TestsSidebar'
import TestsToolbar from '../../components/teacher/tests/TestsToolbar'
import TestsContent from '../../components/teacher/tests/TestsContent'
import { getTests }   from '../../api/tests'
import { getDepartments } from '../../api/departments'
import '../css/teacher/Tests.css'

function getOverallStats(tests) {
  return {
    total:     tests.length,
    published: tests.filter(t => t.status === 'published').length,
  }
}

export default function Tests() {
  const [tests,            setTests]            = useState([])
  const [departments,      setDepartments]      = useState([])
  const [loading,          setLoading]          = useState(true)
  const [error,            setError]            = useState(null)
  const [activeDepartment, setActiveDepartment] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery,  setSearchQuery]  = useState('')
  const [sidebarOpen,  setSidebarOpen]  = useState(false)

  useEffect(() => {
    Promise.all([getTests({}), getDepartments()])
      .then(([testsRes, classesRes]) => {
        setTests(testsRes.data)
        setDepartments(classesRes.data)
      })
      .catch(err => {
        setError(err.response?.data?.detail ?? err.message ?? 'Failed to load tests.')
      })
      .finally(() => setLoading(false))
  }, [])

  const activeLabel =
    activeDepartment === 'all'  ? 'All Tests'    :
    activeDepartment === 'open' ? 'Open Access'  :
    departments.find(c => c.id === activeDepartment)?.name ?? 'Tests'

  const byDepartment =
    activeDepartment === 'all'  ? tests :
    activeDepartment === 'open' ? tests.filter(t => !t.department_id) :
    tests.filter(t => t.department_id === activeDepartment)

  const byStatus =
    statusFilter === 'all' ? byDepartment : byDepartment.filter(t => t.status === statusFilter)

  const filtered = byStatus.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase().trim())
  )

  const published = filtered.filter(t => t.status === 'published')
  const drafts     = filtered.filter(t => t.status !== 'published')

  const overall = getOverallStats(tests)

  return (
    <div className="ttests-page">
      <div className="ttests-layout">
        <NavBar />

        <div className="ttests-body">
          {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
          <TestsSidebar
            tests={tests}
            departments={departments}
            activeDepartment={activeDepartment}
            onDepartmentChange={setActiveDepartment}
            overall={overall}
            className={sidebarOpen ? 'sidebar--open' : ''}
          />

          <main className="ttests-main">
            <button className="sidebar-toggle-btn" onClick={() => setSidebarOpen(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
              Filters
            </button>
            <div className="ttests-head">
              <h2 className="ttests-title">{activeLabel}</h2>
              <span className="ttests-count">
                {loading ? '…' : `${filtered.length} tests`}
              </span>
            </div>

            <TestsToolbar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusFilter={setStatusFilter}
            />

            {loading ? (
              <p className="ttests-empty">Loading…</p>
            ) : error ? (
              <p className="ttests-empty ttests-error">{error}</p>
            ) : (
              <TestsContent
                published={published}
                drafts={drafts}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
