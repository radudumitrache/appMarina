import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import EditorHeader        from './EditorHeader'
import ModuleList          from './ModuleList'
import ModuleBank          from './ModuleBank'
import CourseDiplomasSection from './CourseDiplomasSection'

export default function CourseEditor({
  selected, selectedModules, loadingDetail, saving,
  bankOpen, setBankOpen,
  bankFiltered, bankSearch, setBankSearch, moduleBankCount,
  classes = [],
  onTitleChange, onDescChange, onClassroomChange, onToggleStatus, onDeleteCourse,
  onRemoveModule, onMoveModule, onAddModule, onCreateModule,
  onAddTest, onCreateTest, allTests = [],
  panelsBasePath = '/trainer/modules',
  builderPath    = '/trainer/builder',
}) {
  const navigate = useNavigate()
  const [section,          setSection]          = useState('modules')
  const [composingDiploma, setComposingDiploma] = useState(false)

  function handleSectionChange(s) {
    setSection(s)
    setComposingDiploma(false)
  }

  return (
    <main className="cb-main" key={selected.id}>

      <EditorHeader
        selected={selected}
        classes={classes}
        onTitleChange={onTitleChange}
        onDescChange={onDescChange}
        onClassroomChange={onClassroomChange}
        onToggleStatus={onToggleStatus}
        onDeleteCourse={onDeleteCourse}
      />

      {!selected.department_ids?.length && (
        <div className="cb-warn-banner">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          Assign this course to a department to enable image and video uploads in modules.
        </div>
      )}

      <div className="cb-divider" />

      {/* â”€â”€ Section tab bar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="cb-section-tabs">
        <div className="cb-section-tab-pills">
          <button
            className={`cb-section-pill${section === 'modules' ? ' cb-section-pill--active' : ''}`}
            onClick={() => handleSectionChange('modules')}
          >
            Modules
            {selectedModules?.length > 0 && (
              <span className="cb-section-pill-count">{selectedModules.length}</span>
            )}
          </button>
          <button
            className={`cb-section-pill${section === 'diplomas' ? ' cb-section-pill--active' : ''}`}
            onClick={() => handleSectionChange('diplomas')}
          >
            Diplomas
          </button>
        </div>

        {section === 'modules' && (
          <button className="cb-add-module-btn" onClick={() => setBankOpen(true)}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Items
          </button>
        )}

        {section === 'diplomas' && selected.department_ids?.length > 0 && (
          <button className="cb-add-module-btn" onClick={() => setComposingDiploma(true)}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Diploma
          </button>
        )}
      </div>

      {/* â”€â”€ Sections â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {section === 'modules' && (
        <ModuleList
          selectedModules={selectedModules}

          loadingDetail={loadingDetail}
          onRemove={onRemoveModule}
          onMove={onMoveModule}
          onNavigatePanels={id => navigate(`${panelsBasePath}/${id}/panels`, { state: { backPath: builderPath, departmentId: selected.department_ids?.[0] ?? null } })}
          onViewModule={module => navigate(`${panelsBasePath}/${module.moduleId ?? module.id}`, { state: { module } })}
        />
      )}

      {section === 'diplomas' && (
        <CourseDiplomasSection
          courseId={selected.id}
          departmentIds={selected.department_ids ?? []}
          composing={composingDiploma}
          onComposeDone={() => setComposingDiploma(false)}
        />
      )}

      {bankOpen && (
        <ModuleBank
          bankOpen={bankOpen}
          setBankOpen={setBankOpen}
          moduleBankCount={moduleBankCount}
          bankFiltered={bankFiltered}
          bankSearch={bankSearch}
          setBankSearch={setBankSearch}
          selectedModules={selectedModules}

          saving={saving}
          onAdd={onAddModule}
          onCreateModule={onCreateModule}
          onAddTest={onAddTest}
          onCreateTest={onCreateTest}
          allTests={allTests}
        />
      )}

    </main>
  )
}
