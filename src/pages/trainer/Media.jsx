import { useState, useEffect, useMemo } from 'react'
import NavBar           from '../../components/trainer/NavBar'
import MediaSidebar     from '../../components/shared/media/MediaSidebar'
import MediaToolbar     from '../../components/shared/media/MediaToolbar'
import FileRow          from '../../components/shared/media/FileRow'
import RenameModal      from '../../components/shared/media/RenameModal'
import UploadModal      from '../../components/shared/media/UploadModal'
import { getMediaFiles, deleteMediaFile, patchMediaFile } from '../../api/media'
import { getDepartments }   from '../../api/departments'
import '../css/trainer/Media.css'

export default function trainerMedia() {
  const [files, setFiles]             = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [activeFolder, setActiveFolder] = useState('all')
  const [renameTarget, setRenameTarget] = useState(null)
  const [showUpload, setShowUpload]     = useState(false)
  const [sidebarOpen, setSidebarOpen]   = useState(false)

  useEffect(() => {
    Promise.all([getMediaFiles(), getDepartments()])
      .then(([filesRes, classRes]) => {
        setFiles(filesRes.data.filter(f => f.folder !== 'public'))
        setDepartments(classRes.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const folders = useMemo(() => {
    const countFor = (pred) => files.filter(pred).length
    return [
      { id: 'all', label: 'All Files', count: files.length },
      ...departments.map(c => ({
        id:          `class-${c.id}`,
        label:       c.name,
        count:       countFor(f => f.department === c.id),
        departmentId: c.id,
        folder:      'class',
      })),
    ]
  }, [files, departments])

  // Folders the trainer can upload to (their own classes only)
  const uploadableFolders = useMemo(
    () => folders.filter(f => f.departmentId),
    [folders]
  )

  const filtered = useMemo(() => {
    let list = files
    if (activeFolder.startsWith('class-')) {
      const cid = parseInt(activeFolder.replace('class-', ''), 10)
      list = list.filter(f => f.department === cid)
    }
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(f => f.name.toLowerCase().includes(q))
    }
    return list
  }, [files, activeFolder, search])

  const ownClassIds = useMemo(() => new Set(departments.map(c => c.id)), [departments])
  const canWrite = (file) => file.folder !== 'public' && ownClassIds.has(file.department)

  const handleRename = async (id, name, isVrScene) => {
    const { data } = await patchMediaFile(id, { name, is_vr_scene: isVrScene })
    setFiles(prev => prev.map(f => f.id === id ? data : f))
    setRenameTarget(null)
  }

  const handleDelete = async (file) => {
    const snapshot = files
    setFiles(prev => prev.filter(f => f.id !== file.id))
    try { await deleteMediaFile(file.id) }
    catch { setFiles(snapshot) }
  }

  const handleToggleVrScene = async (file) => {
    const { data } = await patchMediaFile(file.id, { is_vr_scene: !file.is_vr_scene })
    setFiles(prev => prev.map(f => f.id === file.id ? data : f))
  }

  const activeLabel = folders.find(f => f.id === activeFolder)?.label ?? 'Files'
  const canUpload   = uploadableFolders.length > 0

  return (
    <div className="media-page">
      <NavBar />
      <div className="media-layout">
        {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
        <MediaSidebar
          folders={folders}
          activeId={activeFolder}
          onSelect={(id) => { setActiveFolder(id); setSidebarOpen(false) }}
          className={sidebarOpen ? 'sidebar--open' : ''}
        />

        <main className="media-main">
          <button className="sidebar-toggle-btn" onClick={() => setSidebarOpen(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
            Location
          </button>
          <MediaToolbar
            title={activeLabel}
            count={filtered.length}
            search={search}
            onSearch={setSearch}
            onUpload={() => setShowUpload(true)}
            canUpload={canUpload}
          />

          <div className="media-table-wrap">
            {loading ? (
              <p className="media-empty">Loading…</p>
            ) : filtered.length === 0 ? (
              <p className="media-empty">No files found.</p>
            ) : (
              <table className="media-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Location</th>
                    <th>Type</th>
                    <th>Size</th>
                    <th>Uploaded by</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((file, i) => (
                    <FileRow
                      key={file.id}
                      file={file}
                      index={i}
                      canWrite={canWrite(file)}
                      onRename={setRenameTarget}
                      onDelete={handleDelete}
                      onToggleVrScene={canWrite(file) ? handleToggleVrScene : undefined}
                    />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>

      {renameTarget && (
        <RenameModal
          file={renameTarget}
          files={files}
          onClose={() => setRenameTarget(null)}
          onSave={handleRename}
        />
      )}

      {showUpload && (
        <UploadModal
          uploadableFolders={uploadableFolders}
          existingFiles={files}
          onClose={() => setShowUpload(false)}
          onUploaded={(file) => { setFiles(prev => [file, ...prev]); setShowUpload(false) }}
        />
      )}
    </div>
  )
}
