import { useState } from 'react'
import NavBar from '../../components/student/NavBar'
import TestsSidebar from '../../components/student/tests/TestsSidebar'
import TestsToolbar from '../../components/student/tests/TestsToolbar'
import TestsContent from '../../components/student/tests/TestsContent'
import '../css/student/Tests.css'

const CLASS_LABELS = {
  nav:    'Maritime Nav 101',
  safety: 'Safety & Emergency',
  eng:    'Engineering Ops',
  comms:  'Communications',
}

const INITIAL_TESTS = [
  { id: 1,  title: 'Bridge Navigation Fundamentals', author: 'Capt. Rodriguez', classId: 'nav',    dueDate: '2026-04-01', completed: false, grade: null },
  { id: 2,  title: 'Emergency Protocol Assessment',  author: 'Instr. Chen',     classId: 'safety', dueDate: '2026-04-12', completed: false, grade: null },
  { id: 3,  title: 'Radar & ARPA Systems Exam',      author: 'Prof. Whitmore',  classId: null,     dueDate: null,         completed: false, grade: null },
  { id: 4,  title: 'Engine Room Operations Quiz',    author: 'Eng. Vasquez',    classId: 'eng',    dueDate: '2026-04-20', completed: false, grade: null },
  { id: 5,  title: 'GMDSS Radio Procedures',         author: 'Instr. Chen',     classId: 'comms',  dueDate: '2026-03-27', completed: false, grade: null },
  { id: 6,  title: 'Helm Control Basics Test',       author: 'Capt. Rodriguez', classId: 'nav',    dueDate: null,         completed: true,  grade: 92   },
  { id: 7,  title: 'Fire Safety Assessment',         author: 'Instr. Chen',     classId: 'safety', dueDate: null,         completed: true,  grade: 78   },
  { id: 8,  title: 'Chart Reading Fundamentals',     author: 'Prof. Whitmore',  classId: null,     dueDate: null,         completed: true,  grade: 85   },
  { id: 9,  title: 'Load Calculation Quiz',          author: 'Prof. Whitmore',  classId: null,     dueDate: null,         completed: true,  grade: 61   },
  { id: 10, title: 'Man Overboard Drill Test',       author: 'Instr. Chen',     classId: 'safety', dueDate: null,         completed: true,  grade: 45   },
]

function getClassStats(tests, classId) {
  const subset =
    classId === 'all'  ? tests :
    classId === 'open' ? tests.filter(t => t.classId === null) :
    tests.filter(t => t.classId === classId)
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

const CLASSES_LABELS_MAP = {
  all:    'All Tests',
  nav:    'Maritime Nav 101',
  safety: 'Safety & Emergency',
  eng:    'Engineering Ops',
  comms:  'Communications',
  open:   'Open Access',
}

export default function Tests() {
  const [tests,        setTests]        = useState(INITIAL_TESTS)
  const [activeClass,  setActiveClass]  = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [searchQuery,  setSearchQuery]  = useState('')

  const byClass =
    activeClass === 'all'  ? tests :
    activeClass === 'open' ? tests.filter(t => t.classId === null) :
    tests.filter(t => t.classId === activeClass)

  const bySource =
    sourceFilter === 'all'   ? byClass :
    sourceFilter === 'class' ? byClass.filter(t => t.classId !== null) :
    byClass.filter(t => t.classId === null)

  const filtered  = bySource.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase().trim()))
  const pending   = filtered.filter(t => !t.completed)
  const completed = filtered.filter(t => t.completed)

  const sortedPending = [...pending].sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0
    if (!a.dueDate) return 1
    if (!b.dueDate) return -1
    return new Date(a.dueDate) - new Date(b.dueDate)
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
            activeClass={activeClass}
            onClassChange={setActiveClass}
            overall={overall}
            avg={avg}
          />

          <main className="tests-main">
            <div className="tests-head">
              <h2 className="tests-title">{CLASSES_LABELS_MAP[activeClass]}</h2>
              <span className="tests-count">{filtered.length} tests</span>
            </div>

            <TestsToolbar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sourceFilter={sourceFilter}
              onSourceFilter={setSourceFilter}
            />

            <TestsContent
              sortedPending={sortedPending}
              completed={completed}
              classLabels={CLASS_LABELS}
            />
          </main>
        </div>
      </div>
    </div>
  )
}
