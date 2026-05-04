import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '../../components/teacher/NavBar'
import ClassesHeader from '../../components/teacher/classes/ClassesHeader'
import ClassesStats from '../../components/teacher/classes/ClassesStats'
import ClassesToolbar from '../../components/teacher/classes/ClassesToolbar'
import ClassCard from '../../components/teacher/classes/ClassCard'
import { CLASSES } from './classesMock'
import '../css/teacher/Classes.css'

export default function Classes() {
  const navigate = useNavigate()
  const [tab, setTab]       = useState('all')
  const [search, setSearch] = useState('')

  const filtered = CLASSES
    .filter(c => tab === 'all' || c.status === tab)
    .filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase().trim()) ||
      c.subject.toLowerCase().includes(search.toLowerCase().trim())
    )

  const totalStudents = CLASSES.reduce((sum, c) => sum + c.students, 0)
  const activeCount   = CLASSES.filter(c => c.status === 'active').length
  const avgProgress   = Math.round(
    CLASSES.reduce((sum, c) => sum + (c.lessonsDone / c.lessonsTotal) * 100, 0) / CLASSES.length
  )

  return (
    <div className="classes-page">
      <div className="classes-layout">
        <NavBar />

        <ClassesHeader />

        <div className="classes-content">
          <ClassesStats
            totalClasses={CLASSES.length}
            totalStudents={totalStudents}
            activeCount={activeCount}
            avgProgress={avgProgress}
          />

          <ClassesToolbar
            classes={CLASSES}
            tab={tab}
            onTabChange={setTab}
            search={search}
            onSearchChange={setSearch}
          />

          {filtered.length === 0 ? (
            <p className="classes-empty">No classes match your search.</p>
          ) : (
            <div className="classes-grid">
              {filtered.map((cls, i) => (
                <ClassCard
                  key={cls.id}
                  cls={cls}
                  index={i}
                  onView={() => navigate(`/teacher/classes/${cls.id}`)}
                  onManage={() => {}}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
