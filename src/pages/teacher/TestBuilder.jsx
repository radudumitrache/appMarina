import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import NavBar          from '../../components/teacher/NavBar'
import TestSidebar     from '../../components/teacher/test-builder/TestSidebar'
import TestEditorMain  from '../../components/teacher/test-builder/TestEditorMain'
import {
  getTests, createTest, updateTest, publishTest, getTest,
  createTestPanel, deleteTest,
} from '../../api/tests'
import { getClasses } from '../../api/classes'
import '../css/teacher/TestBuilder.css'

export default function TestBuilder() {
  const [searchParams] = useSearchParams()
  const [tests,      setTests]      = useState([])
  const [classes,    setClasses]    = useState([])
  const [selectedId, setSelectedId] = useState(() => {
    const p = searchParams.get('test')
    return p ? Number(p) : null
  })
  const [testDetail, setTestDetail] = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [saving,     setSaving]     = useState(false)

  const [expandedPanelId, setExpandedPanelId] = useState(null)
  const [addingPanel,     setAddingPanel]     = useState(false)
  const [newPanelType,    setNewPanelType]    = useState('exercise')
  const [newPanelTitle,   setNewPanelTitle]   = useState('')

  useEffect(() => {
    Promise.all([getTests({}), getClasses()])
      .then(([testsRes, classesRes]) => {
        setTests(testsRes.data)
        setClasses(classesRes.data)
      })
      .finally(() => setLoading(false))
  }, [])

  const loadDetail = useCallback((id) => {
    if (!id) return
    getTest(id).then(res => setTestDetail(res.data))
  }, [])

  useEffect(() => {
    setExpandedPanelId(null)
    loadDetail(selectedId)
  }, [selectedId, loadDetail])

  useEffect(() => {
    function onFocus() { if (selectedId) loadDetail(selectedId) }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [selectedId, loadDetail])

  function handleSelectTest(id) {
    setSelectedId(id)
    setAddingPanel(false)
    setNewPanelTitle('')
  }

  async function handleNewTest() {
    setSaving(true)
    try {
      const res = await createTest({ title: 'Untitled Test', time_limit_minutes: 30 })
      const t = res.data
      setTests(prev => [t, ...prev])
      setSelectedId(t.id)
    } finally {
      setSaving(false)
    }
  }

  async function handleTitleBlur(newTitle) {
    if (!testDetail || newTitle === testDetail.title) return
    setSaving(true)
    try {
      await updateTest(selectedId, { title: newTitle })
      setTestDetail(prev => ({ ...prev, title: newTitle }))
      setTests(prev => prev.map(t => t.id === selectedId ? { ...t, title: newTitle } : t))
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleStatus() {
    setSaving(true)
    try {
      const res = await publishTest(selectedId)
      const newStatus = res.data.status
      setTestDetail(prev => ({ ...prev, status: newStatus }))
      setTests(prev => prev.map(t => t.id === selectedId ? { ...t, status: newStatus } : t))
    } finally {
      setSaving(false)
    }
  }

  async function handleMetaUpdate(patch) {
    setTestDetail(prev => ({ ...prev, ...patch }))
    setSaving(true)
    try {
      const res = await updateTest(selectedId, patch)
      setTestDetail(prev => ({ ...prev, ...res.data }))
    } catch {
      loadDetail(selectedId)
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteTest(id) {
    await deleteTest(id)
    setTests(prev => prev.filter(t => t.id !== id))
    if (selectedId === id) {
      setSelectedId(null)
      setTestDetail(null)
    }
  }

  async function handleAddPanel() {
    if (!newPanelTitle.trim()) return
    setSaving(true)
    try {
      await createTestPanel(selectedId, {
        type:  newPanelType,
        title: newPanelTitle.trim(),
        order: testDetail.panels?.length ?? 0,
      })
      setAddingPanel(false)
      setNewPanelTitle('')
      loadDetail(selectedId)
    } finally {
      setSaving(false)
    }
  }

  const panels   = testDetail?.panels ?? []
  const hasClass = Boolean(testDetail?.classroom)

  return (
    <div className="tb-page">
      <div className="tb-layout">
        <NavBar />

        <div className="tb-body">
          <TestSidebar
            tests={tests}
            selectedId={selectedId}
            onSelect={handleSelectTest}
            onNew={handleNewTest}
            onDelete={handleDeleteTest}
            loading={loading}
          />

          {selectedId && testDetail ? (
            <TestEditorMain
              testDetail={testDetail}
              selectedId={selectedId}
              panels={panels}
              hasClass={hasClass}
              classes={classes}
              expandedPanelId={expandedPanelId}
              saving={saving}
              addingPanel={addingPanel}
              newPanelType={newPanelType}
              newPanelTitle={newPanelTitle}
              onTitleBlur={handleTitleBlur}
              onToggleStatus={handleToggleStatus}
              onMetaUpdate={handleMetaUpdate}
              onExpand={id => setExpandedPanelId(prev => prev === id ? null : id)}
              onReload={() => loadDetail(selectedId)}
              onStartAdd={() => setAddingPanel(true)}
              onCancelAdd={() => { setAddingPanel(false); setNewPanelTitle('') }}
              onTypeChange={setNewPanelType}
              onTitleChange={setNewPanelTitle}
              onAddPanel={handleAddPanel}
            />
          ) : selectedId && !testDetail ? (
            <main className="tb-main tb-main--empty">
              <span>Loading…</span>
            </main>
          ) : (
            <main className="tb-main tb-main--empty">
              <span>Select a test to edit</span>
            </main>
          )}
        </div>
      </div>
    </div>
  )
}
