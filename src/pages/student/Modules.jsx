import { useState, useEffect } from 'react'
import NavBar from '../../components/student/NavBar'
import ModulesSkeleton from '../../components/student/modules/ModulesSkeleton'
import ClassCoursesSection from '../../components/student/modules/ClassCoursesSection'
import { getCourses } from '../../api/modules'
import { getDepartments } from '../../api/departments'
import '../css/student/Modules.css'

export default function Modules() {
  const [departments, setDepartments] = useState([])
  const [courses, setCourses]         = useState([])
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    Promise.all([getDepartments(), getCourses()])
      .then(([clsRes, crsRes]) => {
        setDepartments(clsRes.data ?? [])
        setCourses(crsRes.data ?? [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function handleModuleToggle(courseId, moduleId, newCompleted) {
    setCourses(prev => prev.map(c => c.id !== courseId ? c : {
      ...c,
      modules: c.modules.map(cl => cl.module !== moduleId ? cl : {
        ...cl,
        module_detail: { ...cl.module_detail, completed: newCompleted },
      }),
    }))
  }

  const courseGroups = departments
    .map(cls => ({ cls, items: courses.filter(c => c.department_ids?.includes(cls.id)) }))
    .filter(g => g.items.length > 0)

  return (
    <div className="modules-page">
      <div className="modules-layout">
        <NavBar />

        <main className="modules-main">
          {loading ? (
            <ModulesSkeleton />
          ) : (
            <ClassCoursesSection
              classes={departments}
              courseGroups={courseGroups}
              onModuleToggle={handleModuleToggle}
            />
          )}
        </main>
      </div>
    </div>
  )
}
