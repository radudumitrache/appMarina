import TestEditorHeader from './TestEditorHeader'
import TestMetaRow      from './TestMetaRow'
import PanelSection     from './PanelSection'
import AddPanelForm     from './AddPanelForm'

export default function TestEditorMain({
  testDetail,
  selectedId,
  panels,
  hasClass,
  classes,
  organisations = [],
  expandedPanelId,
  saving,
  addingPanel,
  newPanelType,
  newPanelTitle,
  onTitleBlur,
  onToggleStatus,
  onMetaUpdate,
  onExpand,
  onReload,
  onStartAdd,
  onCancelAdd,
  onTypeChange,
  onTitleChange,
  onAddPanel,
  vrBasePath,
  allowPublic = false,
}) {
  const canAddPanels = allowPublic || hasClass

  return (
    <main className="tb-main" key={selectedId}>
      <TestEditorHeader
        selected={testDetail}
        onTitleBlur={onTitleBlur}
        onToggleStatus={onToggleStatus}
        saving={saving}
      />

      <TestMetaRow
        selected={testDetail}
        panelCount={panels.length}
        classes={classes}
        organisations={organisations}
        onUpdate={onMetaUpdate}
        allowPublic={allowPublic}
      />

      <div className="tb-divider" />

      <div className="tb-panels-list">
        {panels.length === 0 && !addingPanel && !canAddPanels && (
          <div className="tb-q-empty">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-3)' }}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>Select a department above before adding panels.</span>
          </div>
        )}

        {panels.length === 0 && !addingPanel && canAddPanels && (
          <div className="tb-q-empty">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-3)' }}>
              <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/>
            </svg>
            <span>No panels yet. Add one below.</span>
          </div>
        )}

        {panels.map((panel, i) => (
          <PanelSection
            key={panel.id}
            panel={panel}
            testId={selectedId}
            departmentId={testDetail.department ?? null}
            index={i}
            expanded={expandedPanelId === panel.id}
            onExpand={() => onExpand(panel.id)}
            onReload={onReload}
            vrBasePath={vrBasePath}
          />
        ))}
      </div>

      {canAddPanels && (
        <AddPanelForm
          addingPanel={addingPanel}
          newPanelType={newPanelType}
          newPanelTitle={newPanelTitle}
          saving={saving}
          onStart={onStartAdd}
          onCancel={onCancelAdd}
          onTypeChange={onTypeChange}
          onTitleChange={onTitleChange}
          onSubmit={onAddPanel}
        />
      )}
    </main>
  )
}
