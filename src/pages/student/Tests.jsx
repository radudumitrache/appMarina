import { useState, useEffect } from 'react'
import NavBar       from '../../components/student/NavBar'
import TestsSidebar from '../../components/student/tests/TestsSidebar'
import TestsToolbar from '../../components/student/tests/TestsToolbar'
import TestsContent from '../../components/student/tests/TestsContent'
import { getTests }   from '../../api/tests'
import { getClasses } from '../../api/classes'
import '../css/student/Tests.css'

function getClassStats(tests, classId) {
  const subset =
    classId === 'all'  ? tests :
    classId === 'open' ? tests.filter(t => !t.class_id) :
    tests.filter(t => t.class_id === classId)
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
  const [tests,        setTests]        = useState([])
  const [classes,      setClasses]      = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState(null)
  const [activeClass,  setActiveClass]  = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [searchQuery,  setSearchQuery]  = useState('')

  useEffect(() => {
    Promise.all([getTests({}), getClasses()])
      .then(([testsRes, classesRes]) => {
        console.log('[Tests] API returned', testsRes.data.length, 'tests:', testsRes.data)
        setTests(testsRes.data)
        setClasses(classesRes.data)
      })
      .catch(err => {
        console.error('[Tests] API error:', err.response ?? err)
        setError(err.response?.data?.detail ?? err.message ?? 'Failed to load tests.')
      })
      .finally(() => setLoading(false))
  }, [])

  const activeLabel =
    activeClass === 'all'  ? 'All Tests'    :
    activeClass === 'open' ? 'Open Access'  :
    classes.find(c => c.code === activeClass)?.name ?? 'Tests'

  const byClass =
    activeClass === 'all'  ? tests :
    activeClass === 'open' ? tests.filter(t => !t.class_id) :
    tests.filter(t => t.class_id === activeClass)

  const bySource =
    sourceFilter === 'all'   ? byClass :
    sourceFilter === 'class' ? byClass.filter(t => t.class_id) :
    byClass.filter(t => !t.class_id)

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
          <TestsSidebar
            tests={tests}
            classes={classes}
            activeClass={activeClass}
            onClassChange={setActiveClass}
            overall={overall}
            avg={avg}
          />

          <main className="tests-main">
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
