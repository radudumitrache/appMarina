import { useState } from 'react'
import { useParams } from 'react-router-dom'
import NavBar from '../../components/teacher/NavBar'
import ClassHeader from '../../components/teacher/class-detail/ClassHeader'
import ClassStats from '../../components/teacher/class-detail/ClassStats'
import ClassTabBar from '../../components/teacher/class-detail/ClassTabBar'
import StudentList from '../../components/teacher/class-detail/StudentList'
import ModulesCoursesTab from '../../components/teacher/class-detail/ModulesCoursesTab'
import AnnouncementsTab from '../../components/teacher/class-detail/AnnouncementsTab'
import ClassFormModal from '../../components/teacher/classes/ClassFormModal'
import DeleteConfirmModal from '../../components/admin/classes/DeleteConfirmModal'
import ClassDetailSkeleton from '../../components/teacher/class-detail/ClassDetailSkeleton'
import { useClassData } from '../../components/teacher/class-detail/useClassData'
import { useClassEdit } from '../../components/teacher/class-detail/useClassEdit'
import '../css/teacher/ClassDetail.css'

export default function DepartmentDetail() {
  const { id } = useParams()
  const [tab,    setTab]    = useState('students')
  const [search, setSearch] = useState('')

  const {
    cls, setCls,
    students, modules, announcements,
    loading,
    handleModuleUpdate,
    handleAnnouncementAdded,
    handleAnnouncementUpdated,
    handleAnnouncementRemoved,
  } = useClassData(id)

  const {
    showEditModal,
    editForm, editErrors, editSaving,
    openEdit, handleEditChange, handleEditSave, closeEditModal,
    deleteTarget, setDeleteTarget, handleDelete,
  } = useClassEdit(id, cls, setCls)

  if (loading) return <ClassDetailSkeleton />

  if (!cls) {
    return (
      <div className="cd-page">
        <div className="cd-layout">
          <NavBar />
          <div className="cd-not-found">Department not found.</div>
        </div>
      </div>
    )
  }

  const totalStudents   = students.length
  const activeStudents  = students.filter(s => s.status === 'active').length
  const coursesTotal    = students.length > 0 ? (students[0].coursesTotal ?? 0) : (cls.course_count ?? 0)
  const coursesDone     = students.length > 0
    ? Math.min(...students.map(s => s.coursesDone ?? 0))
    : 0
  const avgProgress     = totalStudents > 0
    ? Math.round(
        students.reduce((sum, s) => {
          const total = s.courseLessonsTotal || 0
          const done  = s.courseLessonsDone  || 0
          return sum + (total > 0 ? done / total : 0)
        }, 0) / totalStudents * 100
      )
    : 0

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase().trim()) ||
    s.email.toLowerCase().includes(search.toLowerCase().trim())
  )

  function handleTabChange(next) { setTab(next); setSearch('') }

  return (
    <>
      <div className="cd-page">
        <div className="cd-layout">
          <NavBar />
          <ClassHeader
            name={cls.name} code={cls.code} status={cls.status}
            onEdit={openEdit}
            onDelete={() => setDeleteTarget(cls)}
          />

          <div className="cd-content">
            <ClassStats
              totalStudents={totalStudents}
              activeStudents={activeStudents}
              avgProgress={avgProgress}
              coursesDone={coursesDone}
              coursesTotal={coursesTotal}
              subject={cls.subject}
            />

            <ClassTabBar
              tab={tab}
              onTabChange={handleTabChange}
              search={search}
              onSearchChange={setSearch}
            />

            <div className="cd-tab-content">
              {tab === 'students' && (
                <StudentList students={filteredStudents} />
              )}
              {tab === 'modules' && (
                <ModulesCoursesTab
                  departmentId={id}
                  classModules={modules}
                  onModuleUpdate={handleModuleUpdate}
                />
              )}
              {tab === 'announcements' && (
                <AnnouncementsTab
                  departmentId={id}
                  announcements={announcements}
                  onAdd={handleAnnouncementAdded}
                  onUpdate={handleAnnouncementUpdated}
                  onRemove={handleAnnouncementRemoved}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {showEditModal && (
        <ClassFormModal
          mode="edit"
          form={editForm}
          errors={editErrors}
          saving={editSaving}
          onChange={handleEditChange}
          onClose={closeEditModal}
          onSave={handleEditSave}
        />
      )}
      {deleteTarget && (
        <DeleteConfirmModal
          target={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </>
  )
}
