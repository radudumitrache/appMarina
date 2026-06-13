import { useState, useEffect } from 'react'
import DiplomasTab from '../class-detail/DiplomasTab'
import { getCourseDiplomas, getClassStudents, getClassCourseProgress } from '../../../api/departments'
import { getCourses } from '../../../api/modules'

export default function CourseDiplomasSection({ courseId, departmentIds = [], composing, onComposeDone }) {
  const [diplomas,           setDiplomas]           = useState([])
  const [students,           setStudents]           = useState([])
  const [courses,            setCourses]            = useState([])
  const [completedStudentIds, setCompletedStudentIds] = useState(new Set())
  const [loading,            setLoading]            = useState(true)

  useEffect(() => {
    if (!courseId) return
    setLoading(true)
    const reqs = [getCourseDiplomas(courseId)]
    if (departmentIds.length) {
      reqs.push(Promise.all(departmentIds.map(id => getClassStudents(id))))
      reqs.push(Promise.all(departmentIds.map(id => getClassCourseProgress(id, courseId))))
    }
    Promise.all(reqs).then(([dipRes, stuResList, progResList]) => {
      setDiplomas(dipRes.data)
      if (stuResList) {
        const merged = new Map()
        for (const stuRes of stuResList) {
          for (const e of stuRes.data) {
            merged.set(e.student, { id: e.student, name: e.student_name, email: e.student_email })
          }
        }
        setStudents(Array.from(merged.values()))
      }
      if (progResList) {
        const finished = new Set()
        for (const progRes of progResList) {
          const { modules, students: progStudents } = progRes.data
          const totalModules = modules.length
          for (const s of progStudents) {
            if (totalModules > 0 && s.completed.length === totalModules) finished.add(s.id)
          }
        }
        setCompletedStudentIds(finished)
      }
    }).catch(() => {}).finally(() => setLoading(false))
  }, [courseId, departmentIds.join(',')])

  useEffect(() => {
    if (!departmentIds.length) return
    getCourses().then(res => {
      setCourses(
        res.data
          .filter(c => c.department_ids?.some(id => departmentIds.includes(id)))
          .map(c => ({ id: c.id, title: c.title }))
      )
    }).catch(() => {})
  }, [departmentIds.join(',')])

  if (!departmentIds.length) {
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
    return <div className="cb-diplomas-loading">Loading diplomasâ€¦</div>
  }

  return (
    <DiplomasTab
      courseId={courseId}
      classId={departmentIds[0] ?? null}
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
