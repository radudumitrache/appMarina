import { useState, useEffect, useMemo } from 'react'
import NavBar           from '../../components/admin/NavBar'
import MediaSidebar     from '../../components/shared/media/MediaSidebar'
import MediaToolbar     from '../../components/shared/media/MediaToolbar'
import FileRow          from '../../components/shared/media/FileRow'
import RenameModal      from '../../components/shared/media/RenameModal'
import UploadModal      from '../../components/shared/media/UploadModal'
import { getMediaFiles, renameMediaFile, deleteMediaFile } from '../../api/media'
import { getClasses }   from '../../api/classes'
import '../css/admin/Media.css'

export default function AdminMedia() {
  const [files, setFiles]         = useState([])
  const [classes, setClasses]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [activeFolder, setActiveFolder] = useState('all')
  const [renameTarget, setRenameTarget] = useState(null)
  const [showUpload, setShowUpload]     = useState(false)

  useEffect(() => {
    Promise.all([getMediaFiles(), getClasses()])
      .then(([filesRes, classRes]) => {
        setFiles(filesRes.data)
        setClasses(classRes.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Build sidebar — admin has full write access everywhere
  const folders = useMemo(() => {
    const countFor = (pred) => files.filter(pred).length
    return [
      { id: 'all',    label: 'All Files', count: files.length },
      { id: 'public', label: 'Public',    count: countFor(f => f.folder === 'public' || f.folder === 'vr_scenes') },
      ...classes.map(c => ({
        id:          `class-${c.id}`,
        label:       c.name,
        count:       countFor(f => f.classroom === c.id),
        classroomId: c.id,
        folder:      'class',
      })),
    ]
  }, [files, classes])

  // Admin can upload to public and any class folder
  const uploadableFolders = useMemo(() => [
    { id: 'public', label: 'Public', folder: 'public' },
    ...classes.map(c => ({
      id:          `class-${c.id}`,
      label:       c.name,
      folder:      'class',
      classroomId: c.id,
    })),
  ], [classes])

  const filtered = useMemo(() => {
    let list = files
    if (activeFolder === 'public') {
      list = list.filter(f => f.folder === 'public' || f.folder === 'vr_scenes')
    } else if (activeFolder.startsWith('class-')) {
      const cid = parseInt(activeFolder.replace('class-', ''), 10)
      list = list.filter(f => f.classroom === cid)
    }
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(f => f.name.toLowerCase().includes(q))
    }
    return list
  }, [files, activeFolder, search])

  // Groups used when activeFolder === 'all'
  const groups = useMemo(() => {
    if (activeFolder !== 'all') return null
    const publicFiles = filtered.filter(f => f.folder === 'public' || f.folder === 'vr_scenes')
    const classGroups = classes
      .map(c => ({ id: `class-${c.id}`, label: c.name, files: filtered.filter(f => f.classroom === c.id) }))
      .filter(g => g.files.length > 0)
    return [
      ...(publicFiles.length ? [{ id: 'public', label: 'Public', files: publicFiles }] : []),
      ...classGroups,
    ]
  }, [filtered, activeFolder, classes])

  const handleRename = async (id, name) => {
    const { data } = await renameMediaFile(id, name)
    setFiles(prev => prev.map(f => f.id === id ? data : f))
    setRenameTarget(null)
  }

  const handleDelete = async (file) => {
    const snapshot = files
    setFiles(prev => prev.filter(f => f.id !== file.id))
    try { await deleteMediaFile(file.id) }
    catch { setFiles(snapshot) }
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
          />

          <div className="media-table-wrap">
            {loading ? (
              <p className="media-empty">Loading…</p>
            ) : filtered.length === 0 ? (
              <p className="media-empty">No files found.</p>
            ) : groups?.length ? (
              groups.map(group => (
                <div key={group.id} className="media-folder-group">
                  <div className="media-folder-group-header">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                    </svg>
                    <span className="media-folder-group-label">{group.label}</span>
                    <span className="media-folder-group-count">{group.files.length}</span>
                  </div>
                  <table className="media-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Location</th>
                        <th>Size</th>
                        <th>Uploaded by</th>
                        <th>Date</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.files.map((file, i) => (
                        <FileRow
                          key={file.id}
                          file={file}
                          index={i}
                          canWrite={true}
                          onRename={setRenameTarget}
                          onDelete={handleDelete}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              ))
            ) : (
              <table className="media-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Location</th>
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
                      canWrite={true}
                      onRename={setRenameTarget}
                      onDelete={handleDelete}
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
          onClose={() => setShowUpload(false)}
          onUploaded={(file) => { setFiles(prev => [file, ...prev]); setShowUpload(false) }}
        />
      )}
    </div>
  )
}
