import { useState } from 'react'
import { useParams } from 'react-router-dom'
import NavBar from '../../components/trainer/NavBar'
import ClassHeader from '../../components/trainer/class-detail/ClassHeader'
import ClassStats from '../../components/trainer/class-detail/ClassStats'
import ClassTabBar from '../../components/trainer/class-detail/ClassTabBar'
import CrewList from '../../components/trainer/class-detail/CrewList'
import ModulesCoursesTab from '../../components/trainer/class-detail/ModulesCoursesTab'
import AnnouncementsTab from '../../components/trainer/class-detail/AnnouncementsTab'
import ClassFormModal from '../../components/trainer/classes/ClassFormModal'
import DeleteConfirmModal from '../../components/admin/classes/DeleteConfirmModal'
import ClassDetailSkeleton from '../../components/trainer/class-detail/ClassDetailSkeleton'
import { useClassData } from '../../components/trainer/class-detail/useClassData'
import { useClassEdit } from '../../components/trainer/class-detail/useClassEdit'
import '../css/trainer/ClassDetail.css'

export default function DepartmentDetail() {
  const { id } = useParams()
  const [tab,    setTab]    = useState('crew')
  const [search, setSearch] = useState('')

  const {
    cls, setCls,
    crew, modules, announcements,
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

  const totalCrew    = crew.length
  const activeCrew   = crew.filter(s => s.status === 'active').length
  const coursesTotal = crew.length > 0 ? (crew[0].coursesTotal ?? 0) : (cls.course_count ?? 0)
  const coursesDone  = crew.length > 0
    ? Math.min(...crew.map(s => s.coursesDone ?? 0))
    : 0
  const avgProgress  = totalCrew > 0
    ? Math.round(
        crew.reduce((sum, s) => {
          const total = s.courseLessonsTotal || 0
          const done  = s.courseLessonsDone  || 0
          return sum + (total > 0 ? done / total : 0)
        }, 0) / totalCrew * 100
      )
    : 0

  const filteredCrew = crew.filter(s =>
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
              totalCrew={totalCrew}
              activeCrew={activeCrew}
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
              {tab === 'crew' && (
                <CrewList crew={filteredCrew} />
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
