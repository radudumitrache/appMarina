import { useState, useEffect } from 'react'
import DiplomasTab from '../class-detail/DiplomasTab'
import { getCourseDiplomas, getClassStudents, getClassCourseProgress } from '../../../api/departments'
import { getCourses } from '../../../api/lessons'

export default function CourseDiplomasSection({ courseId, departmentId, composing, onComposeDone }) {
  const [diplomas,           setDiplomas]           = useState([])
  const [students,           setStudents]           = useState([])
  const [courses,            setCourses]            = useState([])
  const [completedStudentIds, setCompletedStudentIds] = useState(new Set())
  const [loading,            setLoading]            = useState(true)

  useEffect(() => {
    if (!courseId) return
    setLoading(true)
    const reqs = [getCourseDiplomas(courseId)]
    if (departmentId) {
      reqs.push(getClassStudents(departmentId))
      reqs.push(getClassCourseProgress(departmentId, courseId))
    }
    Promise.all(reqs).then(([dipRes, stuRes, progRes]) => {
      setDiplomas(dipRes.data)
      if (stuRes) {
        setStudents(stuRes.data.map(e => ({
          id:    e.student,
          name:  e.student_name,
          email: e.student_email,
        })))
      }
      if (progRes) {
        const { lessons, students: progStudents } = progRes.data
        const totalLessons = lessons.length
        const finished = new Set(
          progStudents
            .filter(s => s.completed.length === totalLessons && totalLessons > 0)
            .map(s => s.id)
        )
        setCompletedStudentIds(finished)
      }
    }).catch(() => {}).finally(() => setLoading(false))
  }, [courseId, departmentId])

  useEffect(() => {
    if (!departmentId) return
    getCourses().then(res => {
      setCourses(
        res.data
          .filter(c => c.department_id === departmentId)
          .map(c => ({ id: c.id, title: c.title }))
      )
    }).catch(() => {})
  }, [departmentId])

  if (!departmentId) {
    return (
      <div className="cb-diplomas-no-class">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="6"/>
          <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
        </svg>
        Assign this course to a class before creating diplomas.
      </div>
    )
  }

  if (loading) {
    return <div className="cb-diplomas-loading">Loading diplomas…</div>
  }

  return (
    <DiplomasTab
      courseId={courseId}
      classId={departmentId}
      diplomas={diplomas}
      students={students}
      courses={courses}
      completedStudentIds={completedStudentIds}
      composing={composing}
      onComposeDone={onComposeDone}
      onCreated={d  => setDiplomas(prev => [d, ...prev])}
      onUpdated={d  => setDiplomas(prev => prev.map(x => x.id === d.id ? d : x))}
      onRemoved={id => setDiplomas(prev => prev.filter(x => x.id !== id))}
    />
  )
}
