import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar             from '../../components/student/NavBar'
import ProgressHeader     from '../../components/student/progress/ProgressHeader'
import ProgressSkeleton   from '../../components/student/progress/ProgressSkeleton'
import ProgressStatCards  from '../../components/student/progress/ProgressStatCards'
import ModulesProgress    from '../../components/student/progress/ModulesProgress'
import TestResults        from '../../components/student/progress/TestResults'
import ActivityFeed       from '../../components/student/progress/ActivityFeed'
import DiplomasSection    from '../../components/student/progress/DiplomasSection'
import { getProgress, getModuleProgress, getTestResults, getActivity } from '../../api/progress'
import { getMyDiplomas } from '../../api/departments'
import { getMe }         from '../../api/users'
import '../css/student/Progress.css'

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function Progress() {
  const navigate = useNavigate()

  const [summary,     setSummary]     = useState(null)
  const [modules,     setModules]     = useState([])
  const [testResults, setTestResults] = useState([])
  const [activity,    setActivity]    = useState([])
  const [diplomas,    setDiplomas]    = useState([])
  const [studentName, setStudentName] = useState('')
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    Promise.all([getProgress(), getModuleProgress(), getTestResults(), getActivity(), getMyDiplomas(), getMe()])
      .then(([progRes, modulesRes, testsRes, actRes, dipRes, meRes]) => {
        setSummary(progRes.data)
        setModules(modulesRes.data ?? [])
        setTestResults(testsRes.data.map(s => ({
          id:      s.id,
          testId:  s.test,
          title:   s.test_title,
          author:  s.test_author_name,
          date:    s.submitted_at,
          grade:   s.grade != null ? Math.round(s.grade) : null,
          pending: s.grade == null,
        })))
        setActivity(actRes.data.map(log => ({
          id:    log.id,
          type:  log.type,
          text:  log.description,
          sub:   log.sub_info,
          refId: log.ref_id,
          date:  fmtDate(log.created_at),
        })))
        setDiplomas(dipRes.data ?? [])
        const me = meRes.data
        setStudentName(`${me.first_name ?? ''} ${me.last_name ?? ''}`.trim())
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading || !summary) {
    return (
      <div className="progress-page">
        <NavBar />
        <ProgressHeader onBack={() => navigate('/student/dashboard')} />
        <ProgressSkeleton />
      </div>
    )
  }

  const statCards = [
    {
      label:  'Lessons Complete',
      value:  String(summary.modules_complete),
      suffix: `/${summary.modules_total}`,
      sub:    `${summary.modules_total > 0 ? Math.round((summary.modules_complete / summary.modules_total) * 100) : 0}% of curriculum`,
    },
    {
      label:  'Avg Test Grade',
      value:  String(summary.avg_grade),
      suffix: '%',
      sub:    `${summary.tests_taken} test${summary.tests_taken !== 1 ? 's' : ''} taken`,
    },
    {
      label:  'Hours Trained',
      value:  String(summary.hours_trained),
      suffix: 'h',
      sub:    'across all modules',
    },
    {
      label:  'Active Streak',
      value:  String(summary.active_streak_days),
      suffix: 'd',
      sub:    'days in a row',
    },
  ]

  return (
    <div className="progress-page">
      <NavBar />
      <ProgressHeader onBack={() => navigate('/student/dashboard')} />

      <div className="progress-content">
        <div className="progress-screen">
          <ProgressStatCards cards={statCards} />

          <div className="progress-grid">
            <ModulesProgress modules={modules} />
            <TestResults
              results={testResults}
              onViewAll={() => navigate('/student/tests')}
              onSelect={t => navigate(`/student/tests/${t.testId}/review?sub=${t.id}`)}
            />
          </div>
        </div>

        <div className="progress-screen progress-screen--activity">
          <ActivityFeed
            items={activity}
            onSelect={item => {
              if (item.type === 'module') navigate('/student/modules')
              else if (item.type === 'test' && item.refId) navigate(`/student/submissions/${item.refId}/review`)
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
