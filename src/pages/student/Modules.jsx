import { useState, useEffect } from 'react'
import NavBar from '../../components/student/NavBar'
import ModulesSwitcher from '../../components/student/modules/ModulesSwitcher'
import ModulesSkeleton from '../../components/student/modules/ModulesSkeleton'
import ClassCoursesSection from '../../components/student/modules/ClassCoursesSection'
import PublicModulesSection from '../../components/student/modules/PublicModulesSection'
import { getModules, getCourses, completeModule, uncompleteModule } from '../../api/modules'
import { getDepartments } from '../../api/departments'
import '../css/student/Modules.css'

function mapModule(l) {
  return {
    id:         l.id,
    title:      l.title,
    duration:   l.duration_minutes ? `${l.duration_minutes} min` : '—',
    locked:     l.locked      ?? false,
    complete:   l.completed   ?? false,
    author:     l.author_name ?? '',
    visibility: l.visibility  ?? 'public',
    difficulty: l.difficulty  ?? 'intermediate',
  }
}

export default function Modules() {
  const [mode, setMode]                   = useState('courses')
  const [departments, setDepartments]     = useState([])
  const [courses, setCourses]             = useState([])
  const [publicModules, setPublicModules] = useState([])
  const [loading, setLoading]             = useState(true)

  useEffect(() => {
    Promise.all([
      getDepartments(),
      getCourses(),
      getModules({ visibility: 'public' }),
    ]).then(([clsRes, crsRes, modRes]) => {
      setDepartments(clsRes.data ?? [])
      setCourses(crsRes.data ?? [])
      setPublicModules((modRes.data ?? []).map(mapModule))
    }).catch(() => {}).finally(() => setLoading(false))
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

  function handlePublicToggle(id) {
    const mod = publicModules.find(l => l.id === id)
    if (!mod || mod.locked) return
    const wasComplete = mod.complete
    setPublicModules(prev => prev.map(l => l.id === id ? { ...l, complete: !l.complete } : l))
    const apiCall = wasComplete ? uncompleteModule : completeModule
    apiCall(id).catch(() => {
      setPublicModules(prev => prev.map(l => l.id === id ? { ...l, complete: wasComplete } : l))
    })
  }

  const courseGroups = departments
    .map(cls => ({ cls, items: courses.filter(c => c.department_id === cls.id) }))
    .filter(g => g.items.length > 0)

  return (
    <div className="modules-page">
      <div className="modules-layout">
        <NavBar />

        <main className="modules-main">
          <ModulesSwitcher mode={mode} onChange={setMode} />

          {loading ? (
            <ModulesSkeleton />
          ) : (
            <>
              {mode === 'courses' && (
                <ClassCoursesSection
                  classes={departments}
                  courseGroups={courseGroups}
                  onModuleToggle={handleModuleToggle}
                />
              )}
              {mode === 'public' && (
                <PublicModulesSection
                  modules={publicModules}
                  onToggleComplete={handlePublicToggle}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}
