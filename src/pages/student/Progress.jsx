import { useNavigate } from 'react-router-dom'
import NavBar from '../../components/student/NavBar'
import ModuleProgress from '../../components/student/progress/ModuleProgress'
import TestResults from '../../components/student/progress/TestResults'
import ActivityFeed from '../../components/student/progress/ActivityFeed'
import '../css/student/Progress.css'

const STAT_CARDS = [
  { label: 'Lessons Complete', value: '5',   suffix: '/12', sub: '42% of curriculum'  },
  { label: 'Avg Test Grade',   value: '72',  suffix: '%',   sub: '5 tests taken'       },
  { label: 'Hours Trained',    value: '5.9', suffix: 'h',   sub: 'across all modules'  },
  { label: 'Active Streak',    value: '3',   suffix: 'd',   sub: 'days in a row'       },
]

const MODULES = [
  { id: 'nav',   label: 'Bridge Navigation',   total: 4, done: 2, hours: 2.5 },
  { id: 'emg',   label: 'Emergency Protocols', total: 3, done: 1, hours: 0.8 },
  { id: 'eng',   label: 'Engine Room',         total: 2, done: 2, hours: 2.4 },
  { id: 'cargo', label: 'Cargo Management',    total: 2, done: 0, hours: 0   },
  { id: 'comm',  label: 'Communications',      total: 1, done: 0, hours: 0.2 },
]

const TEST_RESULTS = [
  { id: 1, title: 'Helm Control Basics Test',   author: 'Capt. Rodriguez', date: '2026-03-20', grade: 92 },
  { id: 2, title: 'Chart Reading Fundamentals', author: 'Prof. Whitmore',  date: '2026-03-15', grade: 85 },
  { id: 3, title: 'Fire Safety Assessment',     author: 'Instr. Chen',     date: '2026-03-10', grade: 78 },
  { id: 4, title: 'Load Calculation Quiz',      author: 'Prof. Whitmore',  date: '2026-02-28', grade: 61 },
  { id: 5, title: 'Man Overboard Drill Test',   author: 'Instr. Chen',     date: '2026-02-20', grade: 45 },
]

const ACTIVITY = [
  { id: 1, type: 'lesson', text: 'Completed Fuel Management Systems',    sub: 'Engine Room · 65 min',          date: 'Mar 28' },
  { id: 2, type: 'test',   text: 'Scored 92% on Helm Control Basics',   sub: 'By Capt. Rodriguez',             date: 'Mar 20' },
  { id: 3, type: 'lesson', text: 'Completed Main Engine Operations',     sub: 'Engine Room · 80 min',          date: 'Mar 18' },
  { id: 4, type: 'test',   text: 'Scored 85% on Chart Reading',          sub: 'By Prof. Whitmore',             date: 'Mar 15' },
  { id: 5, type: 'lesson', text: 'Completed Fire Safety Protocols',      sub: 'Emergency Protocols · 50 min',  date: 'Mar 12' },
  { id: 6, type: 'test',   text: 'Scored 78% on Fire Safety Assessment', sub: 'By Instr. Chen',                date: 'Mar 10' },
]

export default function Progress() {
  const navigate = useNavigate()

  const totalDone  = MODULES.reduce((s, m) => s + m.done,  0)
  const totalAll   = MODULES.reduce((s, m) => s + m.total, 0)
  const overallPct = totalAll > 0 ? Math.round((totalDone / totalAll) * 100) : 0

  return (
    <div className="progress-page">
      <NavBar />

      <header className="progress-header">
        <div className="progress-breadcrumb">
          <button className="breadcrumb-link" onClick={() => navigate('/student/dashboard')}>
            Dashboard
          </button>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
          <span className="breadcrumb-current">My Progress</span>
        </div>
        <h1 className="progress-page-title">My Progress</h1>
      </header>

      <div className="progress-content">

        <div className="progress-stats">
          {STAT_CARDS.map((card, i) => (
            <div
              className="stat-card"
              key={card.label}
              style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
            >
              <span className="stat-label">{card.label}</span>
              <div className="stat-value-row">
                <span className="stat-value">{card.value}</span>
                <span className="stat-suffix">{card.suffix}</span>
              </div>
              <span className="stat-sub">{card.sub}</span>
            </div>
          ))}
        </div>

        <div className="progress-grid">
          <ModuleProgress modules={MODULES} overallPct={overallPct} />
          <TestResults results={TEST_RESULTS} onViewAll={() => navigate('/student/tests')} />
        </div>

        <ActivityFeed items={ACTIVITY} />

      </div>
    </div>
  )
}
