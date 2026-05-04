import { useNavigate } from 'react-router-dom'
import NavBar from '../../components/student/NavBar'
import MyClassHeader from '../../components/student/my-class/MyClassHeader'
import ClassRoster from '../../components/student/my-class/ClassRoster'
import UpcomingDeadlines from '../../components/student/my-class/UpcomingDeadlines'
import Announcements from '../../components/student/my-class/Announcements'
import '../css/student/MyClass.css'

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

const SORTED_CLASSMATES = [...CLASSMATES].sort((a, b) => {
  if (b.lessonsComplete !== a.lessonsComplete) return b.lessonsComplete - a.lessonsComplete
  return (b.avgGrade ?? -1) - (a.avgGrade ?? -1)
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
    author: 'Capt. Rodriguez',
    date:   '2026-03-27',
    title:  'Reminder: Navigation exam next week',
    body:   'Please make sure you have completed Lessons 1–4 before sitting the Bridge Navigation Fundamentals exam on April 1. Review the ARPA module in particular.',
    pinned: true,
  },
  {
    id: 2,
    author: 'Capt. Rodriguez',
    date:   '2026-03-20',
    title:  'Study resources added',
    body:   'I have uploaded supplementary chart-reading exercises to the class library. These are optional but highly recommended before the test.',
    pinned: false,
  },
  {
    id: 3,
    author: 'Capt. Rodriguez',
    date:   '2026-03-10',
    title:  'Welcome to Maritime Navigation 101',
    body:   'Welcome everyone. This semester we will cover bridge navigation, emergency protocols, and basic communications. Attendance and timely test completion are both required for certification.',
    pinned: false,
  },
]

export default function MyClass() {
  const navigate = useNavigate()
  const myRank   = SORTED_CLASSMATES.findIndex(c => c.isMe) + 1

  return (
    <div className="myclass-page">
      <NavBar />

      <MyClassHeader
        classInfo={CLASS_INFO}
        onBack={() => navigate('/student/dashboard')}
      />

      <div className="myclass-content">

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

        <div className="myclass-grid">
          <ClassRoster classmates={SORTED_CLASSMATES} myRank={myRank} />

          <div className="myclass-right-col">
            <UpcomingDeadlines items={UPCOMING} />
            <Announcements items={ANNOUNCEMENTS} />
          </div>
        </div>

      </div>
    </div>
  )
}
