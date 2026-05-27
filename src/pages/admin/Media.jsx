import { useState, useEffect, useMemo, useCallback } from 'react'
import NavBar           from '../../components/admin/NavBar'
import MediaSidebar     from '../../components/shared/media/MediaSidebar'
import MediaToolbar     from '../../components/shared/media/MediaToolbar'
import FileRow          from '../../components/shared/media/FileRow'
import RenameModal      from '../../components/shared/media/RenameModal'
import UploadModal      from '../../components/shared/media/UploadModal'
import { getMediaFiles, deleteMediaFile, patchMediaFile } from '../../api/media'
import { getDepartments }   from '../../api/departments'
import '../css/admin/Media.css'

const TABLE_HEAD = (
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
)

function FolderGroup({ group, collapsed, onToggle, onRename, onDelete, onToggleVrScene }) {
  return (
    <div className="media-folder-group">
      <div className="media-folder-group-header" onClick={onToggle}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
        </svg>
        <span className="media-folder-group-label">{group.label}</span>
        <span className="media-folder-group-count">{group.files.length}</span>
        <span className={`media-folder-group-chevron${collapsed ? '' : ' media-folder-group-chevron--open'}`}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </span>
      </div>

      <div className={`media-folder-group-body${collapsed ? ' media-folder-group-body--collapsed' : ''}`}>
        <table className="media-table">
          {TABLE_HEAD}
          <tbody>
            {group.files.map((file, i) => (
              <FileRow
                key={file.id}
                file={file}
                index={i}
                canWrite={true}
                onRename={onRename}
                onDelete={onDelete}
                onToggleVrScene={onToggleVrScene}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function AdminMedia() {
  const [files, setFiles]         = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [activeFolder, setActiveFolder] = useState('all')
  const [renameTarget, setRenameTarget] = useState(null)
  const [showUpload, setShowUpload]     = useState(false)

  // Filter state
  const [filterType,    setFilterType]    = useState('all')    // 'all' | 'image' | 'video'
  const [filterVrScene, setFilterVrScene] = useState(false)

  // Collapsed groups — keyed by group id; default all expanded
  const [collapsedGroups, setCollapsedGroups] = useState(new Set())

  const toggleGroup = useCallback((id) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  useEffect(() => {
    Promise.all([getMediaFiles(), getDepartments()])
      .then(([filesRes, classRes]) => {
        setFiles(filesRes.data)
        setDepartments(classRes.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Build sidebar — admin has full write access everywhere
  const folders = useMemo(() => {
    const countFor = (pred) => files.filter(pred).length
    return [
      { id: 'all',       label: 'All Files',  count: files.length },
      { id: 'public',    label: 'Public',     count: countFor(f => f.folder === 'public' || f.folder === 'vr_scenes') },
      { id: 'documents', label: 'Documents',  count: countFor(f => f.folder === 'documents') },
      ...departments.map(c => ({
        id:          `class-${c.id}`,
        label:       c.name,
        count:       countFor(f => f.department === c.id),
        departmentId: c.id,
        folder:      'class',
      })),
    ]
  }, [files, departments])

  const uploadableFolders = useMemo(() => [
    { id: 'public',    label: 'Public',    folder: 'public' },
    { id: 'documents', label: 'Documents', folder: 'documents' },
    ...departments.map(c => ({
      id:          `class-${c.id}`,
      label:       c.name,
      folder:      'class',
      departmentId: c.id,
    })),
  ], [departments])

  const filtered = useMemo(() => {
    let list = files
    // Folder filter
    if (activeFolder === 'public') {
      list = list.filter(f => f.folder === 'public' || f.folder === 'vr_scenes')
    } else if (activeFolder === 'documents') {
      list = list.filter(f => f.folder === 'documents')
    } else if (activeFolder.startsWith('class-')) {
      const cid = parseInt(activeFolder.replace('class-', ''), 10)
      list = list.filter(f => f.department === cid)
    }
    // Type filter
    if (filterType !== 'all') {
      list = list.filter(f => f.file_type === filterType)
    }
    // VR scene filter
    if (filterVrScene) {
      list = list.filter(f => f.is_vr_scene)
    }
    // Search
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(f => f.name.toLowerCase().includes(q))
    }
    return list
  }, [files, activeFolder, filterType, filterVrScene, search])

  // Groups used when activeFolder === 'all'
  const groups = useMemo(() => {
    if (activeFolder !== 'all') return null
    const publicFiles  = filtered.filter(f => f.folder === 'public' || f.folder === 'vr_scenes')
    const orphanDocs   = filtered.filter(f => f.folder === 'documents' && !f.department)
    const classGroups  = departments
      .map(c => ({ id: `class-${c.id}`, label: c.name, code: c.code, files: filtered.filter(f => f.department === c.id) }))
      .filter(g => g.files.length > 0)
    return [
      ...(publicFiles.length  ? [{ id: 'public',    label: 'Public',            files: publicFiles }]  : []),
      ...(orphanDocs.length   ? [{ id: 'documents',  label: 'Lesson Documents',  files: orphanDocs }]   : []),
      ...classGroups,
    ]
  }, [filtered, activeFolder, departments])

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

  return (
    <div className="media-page">
      <NavBar />
      <div className="media-layout">
        <MediaSidebar folders={folders} activeId={activeFolder} onSelect={setActiveFolder} />

        <main className="media-main">
          <MediaToolbar
            title={activeLabel}
            count={filtered.length}
            search={search}
            onSearch={setSearch}
            onUpload={() => setShowUpload(true)}
            canUpload={true}
            filterType={filterType}
            onFilterType={setFilterType}
            filterVrScene={filterVrScene}
            onFilterVrScene={setFilterVrScene}
          />

          <div className="media-table-wrap">
            {loading ? (
              <p className="media-empty">Loading…</p>
            ) : filtered.length === 0 ? (
              <p className="media-empty">No files match the current filters.</p>
            ) : groups ? (
              groups.length === 0 ? (
                <p className="media-empty">No files match the current filters.</p>
              ) : (
                groups.map(group => (
                  <FolderGroup
                    key={group.id}
                    group={group}
                    collapsed={collapsedGroups.has(group.id)}
                    onToggle={() => toggleGroup(group.id)}
                    onRename={setRenameTarget}
                    onDelete={handleDelete}
                    onToggleVrScene={handleToggleVrScene}
                  />
                ))
              )
            ) : (
              <table className="media-table">
                {TABLE_HEAD}
                <tbody>
                  {filtered.map((file, i) => (
                    <FileRow
                      key={file.id}
                      file={file}
                      index={i}
                      canWrite={true}
                      onRename={setRenameTarget}
                      onDelete={handleDelete}
                      onToggleVrScene={handleToggleVrScene}
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
