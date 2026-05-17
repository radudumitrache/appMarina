import { useState, useEffect, useMemo } from 'react'
import NavBar           from '../../components/teacher/NavBar'
import MediaSidebar     from '../../components/shared/media/MediaSidebar'
import MediaToolbar     from '../../components/shared/media/MediaToolbar'
import FileRow          from '../../components/shared/media/FileRow'
import RenameModal      from '../../components/shared/media/RenameModal'
import UploadModal      from '../../components/shared/media/UploadModal'
import { getMediaFiles, deleteMediaFile, patchMediaFile } from '../../api/media'
import { getClasses }   from '../../api/classes'
import '../css/teacher/Media.css'

export default function TeacherMedia() {
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
        setFiles(filesRes.data.filter(f => f.folder !== 'public'))
        setClasses(classRes.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const folders = useMemo(() => {
    const countFor = (pred) => files.filter(pred).length
    return [
      { id: 'all', label: 'All Files', count: files.length },
      ...classes.map(c => ({
        id:          `class-${c.id}`,
        label:       c.name,
        count:       countFor(f => f.classroom === c.id),
        classroomId: c.id,
        folder:      'class',
      })),
    ]
  }, [files, classes])

  // Folders the teacher can upload to (their own classes only)
  const uploadableFolders = useMemo(
    () => folders.filter(f => f.classroomId),
    [folders]
  )

  const filtered = useMemo(() => {
    let list = files
    if (activeFolder.startsWith('class-')) {
      const cid = parseInt(activeFolder.replace('class-', ''), 10)
      list = list.filter(f => f.classroom === cid)
    }
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(f => f.name.toLowerCase().includes(q))
    }
    return list
  }, [files, activeFolder, search])

  const ownClassIds = useMemo(() => new Set(classes.map(c => c.id)), [classes])
  const canWrite = (file) => file.folder !== 'public' && ownClassIds.has(file.classroom)

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
        <MediaSidebar folders={folders} activeId={activeFolder} onSelect={setActiveFolder} />

        <main className="media-main">
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
