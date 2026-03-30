import { useNavigate } from 'react-router-dom'
import NavBar from '../../components/student/NavBar'
import '../css/student/MyClass.css'

// ── Data ──────────────────────────────────────────────────────────────────────

const CLASS_INFO = {
  name:     'Maritime Navigation 101',
  code:     'MN-101',
  teacher:  'Capt. Rodriguez',
  semester: 'Spring 2026',
  enrolled: 14,
  start:    '2026-02-03',
  end:      '2026-05-30',
}

const STAT_CARDS = [
  { label: 'Classmates',       value: '13',  sub: 'in your class'         },
  { label: 'Lessons Assigned', value: '6',   sub: '5 of 12 complete'      },
  { label: 'Tests Assigned',   value: '3',   sub: '1 completed'           },
  { label: 'Class Avg Grade',  value: '74',  suffix: '%', sub: 'across all tests' },
]

// MY_RANK: student's own record (shown highlighted)
const ME = { id: 0, name: 'You', avatar: 'Y', lessonsComplete: 5, totalLessons: 12, avgGrade: 72, isMe: true }

const CLASSMATES = [
  { id: 1,  name: 'Amara Osei',      avatar: 'AO', lessonsComplete: 10, totalLessons: 12, avgGrade: 94 },
  { id: 2,  name: 'Lena Hartmann',   avatar: 'LH', lessonsComplete: 9,  totalLessons: 12, avgGrade: 88 },
  { id: 3,  name: 'Jin-ho Park',     avatar: 'JP', lessonsComplete: 8,  totalLessons: 12, avgGrade: 83 },
  { id: 4,  name: 'Sofia Mendes',    avatar: 'SM', lessonsComplete: 7,  totalLessons: 12, avgGrade: 79 },
  { id: 5,  name: 'Tariq Al-Rashid', avatar: 'TA', lessonsComplete: 7,  totalLessons: 12, avgGrade: 77 },
  { id: 6,  name: 'Chloe Dubois',    avatar: 'CD', lessonsComplete: 6,  totalLessons: 12, avgGrade: 75 },
  ME,
  { id: 7,  name: 'Kwame Asante',    avatar: 'KA', lessonsComplete: 5,  totalLessons: 12, avgGrade: 68 },
  { id: 8,  name: 'Priya Nair',      avatar: 'PN', lessonsComplete: 4,  totalLessons: 12, avgGrade: 65 },
  { id: 9,  name: 'Marco Esposito',  avatar: 'ME', lessonsComplete: 4,  totalLessons: 12, avgGrade: 61 },
  { id: 10, name: 'Hana Yoshida',    avatar: 'HY', lessonsComplete: 3,  totalLessons: 12, avgGrade: 58 },
  { id: 11, name: 'Dmitri Volkov',   avatar: 'DV', lessonsComplete: 2,  totalLessons: 12, avgGrade: 52 },
  { id: 12, name: 'Fatima El-Amin',  avatar: 'FE', lessonsComplete: 1,  totalLessons: 12, avgGrade: 44 },
  { id: 13, name: 'Sam Okafor',      avatar: 'SO', lessonsComplete: 0,  totalLessons: 12, avgGrade: null },
]

// Sorted by lessons complete then avg grade — ME keeps its position in the sorted list
const SORTED_CLASSMATES = [...CLASSMATES].sort((a, b) => {
  if (b.lessonsComplete !== a.lessonsComplete) return b.lessonsComplete - a.lessonsComplete
  const ag = a.avgGrade ?? -1
  const bg = b.avgGrade ?? -1
  return bg - ag
})

const UPCOMING = [
  { id: 1, type: 'test',   title: 'Bridge Navigation Fundamentals', due: '2026-04-01', urgent: true  },
  { id: 2, type: 'lesson', title: 'Radar & ARPA Systems',           due: '2026-04-08', urgent: false },
  { id: 3, type: 'test',   title: 'Emergency Protocol Assessment',  due: '2026-04-12', urgent: false },
  { id: 4, type: 'lesson', title: 'Man Overboard Response',         due: '2026-04-18', urgent: false },
]

const ANNOUNCEMENTS = [
  {
    id: 1,
    author:  'Capt. Rodriguez',
    date:    '2026-03-27',
    title:   'Reminder: Navigation exam next week',
    body:    'Please make sure you have completed Lessons 1–4 before sitting the Bridge Navigation Fundamentals exam on April 1. Review the ARPA module in particular.',
    pinned:  true,
  },
  {
    id: 2,
    author:  'Capt. Rodriguez',
    date:    '2026-03-20',
    title:   'Study resources added',
    body:    'I have uploaded supplementary chart-reading exercises to the class library. These are optional but highly recommended before the test.',
    pinned:  false,
  },
  {
    id: 3,
    author:  'Capt. Rodriguez',
    date:    '2026-03-10',
    title:   'Welcome to Maritime Navigation 101',
    body:    'Welcome everyone. This semester we will cover bridge navigation, emergency protocols, and basic communications. Attendance and timely test completion are both required for certification.',
    pinned:  false,
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function daysUntil(iso) {
  const diff = (new Date(iso) - new Date()) / (1000 * 60 * 60 * 24)
  return Math.ceil(diff)
}

function formatDue(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatAnnDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function gradeColor(g) {
  if (g == null)  return 'var(--text-3)'
  if (g >= 90) return 'var(--success)'
  if (g >= 70) return 'var(--accent)'
  if (g >= 50) return 'var(--gold)'
  return 'var(--error)'
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function MyClass() {
  const navigate = useNavigate()

  const myRank = SORTED_CLASSMATES.findIndex(c => c.isMe) + 1

  return (
    <div className="myclass-page">
      <NavBar />

      {/* Page header */}
      <header className="myclass-header">
        <div className="myclass-header-left">
          <div className="myclass-breadcrumb">
            <button className="breadcrumb-link" onClick={() => navigate('/student/dashboard')}>
              Dashboard
            </button>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
            <span className="breadcrumb-current">My Class</span>
          </div>
          <div className="myclass-header-title-row">
            <h1 className="myclass-page-title">{CLASS_INFO.name}</h1>
            <span className="myclass-code">{CLASS_INFO.code}</span>
          </div>
        </div>
        <div className="myclass-header-right">
          <span className="myclass-teacher-label">Instructor</span>
          <span className="myclass-teacher-name">{CLASS_INFO.teacher}</span>
          <span className="myclass-semester">{CLASS_INFO.semester}</span>
        </div>
      </header>

      {/* Scrollable content */}
      <div className="myclass-content">

        {/* Stat cards */}
        <div className="myclass-stats">
          {STAT_CARDS.map((card, i) => (
            <div
              className="stat-card"
              key={card.label}
              style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
            >
              <span className="stat-label">{card.label}</span>
              <div className="stat-value-row">
                <span className="stat-value">{card.value}</span>
                {card.suffix && <span className="stat-suffix">{card.suffix}</span>}
              </div>
              <span className="stat-sub">{card.sub}</span>
            </div>
          ))}
        </div>

        {/* Two-column grid */}
        <div className="myclass-grid">

          {/* LEFT: Class roster / leaderboard */}
          <section className="myclass-section">
            <div className="section-head">
              <span className="section-title">Class Roster</span>
              <span className="section-meta">
                Your rank&nbsp;
                <span className="section-meta-num">{myRank}</span>
                &nbsp;of&nbsp;
                <span className="section-meta-num">{SORTED_CLASSMATES.length}</span>
              </span>
            </div>

            <div className="roster-list">
              {SORTED_CLASSMATES.map((student, i) => {
                const pct = student.totalLessons > 0
                  ? (student.lessonsComplete / student.totalLessons) * 100
                  : 0
                const rank = i + 1
                return (
                  <div
                    key={student.id}
                    className={`roster-row ${student.isMe ? 'roster-row--me' : ''}`}
                    style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
                  >
                    <span className="roster-rank">{rank}</span>
                    <div className="roster-avatar">{student.avatar}</div>
                    <div className="roster-body">
                      <div className="roster-name-row">
                        <span className="roster-name">
                          {student.name}
                          {student.isMe && <span className="roster-you-tag">you</span>}
                        </span>
                        <span
                          className="roster-grade"
                          style={{ color: gradeColor(student.avgGrade) }}
                        >
                          {student.avgGrade != null ? `${student.avgGrade}%` : '—'}
                        </span>
                      </div>
                      <div className="roster-bar-track">
                        <div
                          className={`roster-bar-fill ${pct === 100 ? 'roster-bar-fill--complete' : 'roster-bar-fill--progress'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <span className="roster-fraction">
                      {student.lessonsComplete}/{student.totalLessons}
                    </span>
                  </div>
                )
              })}
            </div>
          </section>

          {/* RIGHT: Upcoming deadlines + announcements */}
          <div className="myclass-right-col">

            {/* Upcoming deadlines */}
            <section className="myclass-section">
              <div className="section-head">
                <span className="section-title">Upcoming Deadlines</span>
              </div>
              <div className="deadlines-list">
                {UPCOMING.map((item, i) => {
                  const days = daysUntil(item.due)
                  const overdue = days < 0
                  const soon    = days >= 0 && days <= 3
                  return (
                    <div
                      key={item.id}
                      className="deadline-row"
                      style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
                    >
                      <div className={`deadline-type-icon deadline-type-icon--${item.type}`}>
                        {item.type === 'test' ? (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 11 12 14 22 4"/>
                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                          </svg>
                        ) : (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                          </svg>
                        )}
                      </div>
                      <div className="deadline-body">
                        <span className="deadline-title">{item.title}</span>
                        <span className={`deadline-due ${overdue ? 'deadline-due--overdue' : soon ? 'deadline-due--soon' : ''}`}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8"  y1="2" x2="8"  y2="6"/>
                            <line x1="3"  y1="10" x2="21" y2="10"/>
                          </svg>
                          {overdue
                            ? `Overdue · ${formatDue(item.due)}`
                            : soon
                            ? `Due soon · ${formatDue(item.due)}`
                            : `Due ${formatDue(item.due)}`}
                        </span>
                      </div>
                      <span className="deadline-type-tag">
                        {item.type === 'test' ? 'Test' : 'Lesson'}
                      </span>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Announcements */}
            <section className="myclass-section">
              <div className="section-head">
                <span className="section-title">Announcements</span>
              </div>
              <div className="announcements-list">
                {ANNOUNCEMENTS.map((ann, i) => (
                  <div
                    key={ann.id}
                    className={`announcement-row ${ann.pinned ? 'announcement-row--pinned' : ''}`}
                    style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
                  >
                    <div className="announcement-head">
                      <span className="announcement-title">{ann.title}</span>
                      {ann.pinned && (
                        <span className="announcement-pin">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="17" x2="12" y2="22"/>
                            <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/>
                          </svg>
                          Pinned
                        </span>
                      )}
                    </div>
                    <p className="announcement-body">{ann.body}</p>
                    <div className="announcement-footer">
                      <span className="announcement-author">{ann.author}</span>
                      <span className="announcement-date">{formatAnnDate(ann.date)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>
        </div>

      </div>
    </div>
  )
}
