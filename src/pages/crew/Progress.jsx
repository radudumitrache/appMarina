import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar             from '../../components/crew/NavBar'
import ProgressHeader     from '../../components/crew/progress/ProgressHeader'
import ProgressSkeleton   from '../../components/crew/progress/ProgressSkeleton'
import ProgressStatCards  from '../../components/crew/progress/ProgressStatCards'
import CoursesProgress    from '../../components/crew/progress/CoursesProgress'
import TestResults        from '../../components/crew/progress/TestResults'
import ActivityFeed       from '../../components/crew/progress/ActivityFeed'
import DiplomasSection    from '../../components/crew/progress/DiplomasSection'
import { getProgress, getCourseProgress, getTestResults, getActivity } from '../../api/progress'
import { getMyDiplomas } from '../../api/departments'
import { getMe }         from '../../api/users'
import '../css/crew/Progress.css'

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function Progress() {
  const navigate = useNavigate()

  const [summary,     setSummary]     = useState(null)
  const [courses,     setCourses]     = useState([])
  const [testResults, setTestResults] = useState([])
  const [activity,    setActivity]    = useState([])
  const [diplomas,    setDiplomas]    = useState([])
  const [studentName, setStudentName] = useState('')
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    Promise.allSettled([
      getProgress(),
      getCourseProgress(),
      getTestResults(),
      getActivity(),
      getMyDiplomas(),
      getMe(),
    ]).then(([progResult, coursesResult, testsResult, actResult, dipResult, meResult]) => {
      if (progResult.status === 'fulfilled') setSummary(progResult.value.data)
      if (coursesResult.status === 'fulfilled') setCourses(coursesResult.value.data ?? [])
      if (testsResult.status === 'fulfilled') {
        setTestResults(testsResult.value.data.map(s => ({
          id:      s.id,
          testId:  s.test,
          title:   s.test_title,
          author:  s.test_author_name,
          date:    s.submitted_at,
          grade:   s.grade != null ? Math.round(s.grade) : null,
          pending: s.grade == null,
        })))
      }
      if (actResult.status === 'fulfilled') {
        setActivity(actResult.value.data.map(log => ({
          id:    log.id,
          type:  log.type,
          text:  log.description,
          sub:   log.sub_info,
          refId: log.ref_id,
          date:  fmtDate(log.created_at),
        })))
      }
      if (dipResult.status === 'fulfilled') setDiplomas(dipResult.value.data ?? [])
      if (meResult.status === 'fulfilled') {
        const me = meResult.value.data
        setStudentName(`${me.first_name ?? ''} ${me.last_name ?? ''}`.trim())
      }
    }).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="progress-page">
        <NavBar />
        <ProgressHeader onBack={() => navigate('/crew/dashboard')} />
        <ProgressSkeleton />
      </div>
    )
  }

  const coursesDone  = summary?.courses_done  ?? 0
  const coursesTotal = summary?.courses_total ?? 0

  const statCards = [
    {
      label:  'Courses Complete',
      value:  String(coursesDone),
      suffix: `/${coursesTotal}`,
      sub:    `${coursesTotal > 0 ? Math.round((coursesDone / coursesTotal) * 100) : 0}% of curriculum`,
    },
    {
      label:  'Avg Test Grade',
      value:  String(summary?.avg_grade ?? 0),
      suffix: '%',
      sub:    `${summary?.tests_taken ?? 0} test${(summary?.tests_taken ?? 0) !== 1 ? 's' : ''} taken`,
    },
    {
      label:  'Hours Trained',
      value:  String(summary?.hours_trained ?? 0),
      suffix: 'h',
      sub:    'across all modules',
    },
    {
      label:  'Active Streak',
      value:  String(summary?.active_streak_days ?? 0),
      suffix: 'd',
      sub:    'days in a row',
    },
  ]

  return (
    <div className="progress-page">
      <NavBar />
      <ProgressHeader onBack={() => navigate('/crew/dashboard')} />

      <div className="progress-content">
        <div className="progress-screen">
          <ProgressStatCards cards={statCards} />

          <div className="progress-grid">
            <CoursesProgress courses={courses} />
            <TestResults
              results={testResults}
              onViewAll={() => navigate('/crew/tests')}
              onSelect={t => navigate(`/crew/tests/${t.testId}/review?sub=${t.id}`)}
            />
          </div>
        </div>

        <div className="progress-screen progress-screen--activity">
          <ActivityFeed
            items={activity}
            onSelect={item => {
              if (item.type === 'module') navigate('/crew/modules')
              else if (item.type === 'test' && item.refId) navigate(`/crew/submissions/${item.refId}/review`)
            }}
          />
        </div>

        {diplomas.length > 0 && (
          <div className="progress-screen">
            <DiplomasSection diplomas={diplomas} studentName={studentName} />
          </div>
        )}
      </div>
    </div>
  )
}
