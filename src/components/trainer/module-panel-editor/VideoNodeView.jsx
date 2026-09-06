import { useEffect, useState } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import { resolveMediaUrl } from '../../../utils/resolveMediaSrc'

export default function VideoNodeView({ node }) {
  const { mediaId, src: staticSrc, controls } = node.attrs
  const [resolvedSrc, setResolvedSrc] = useState(mediaId ? null : staticSrc)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!mediaId) return
    let cancelled = false
    setFailed(false)
    resolveMediaUrl(mediaId)
      .then(url => { if (!cancelled) setResolvedSrc(url) })
      .catch(() => { if (!cancelled) setFailed(true) })
    return () => { cancelled = true }
  }, [mediaId])

  return (
    <NodeViewWrapper as="div" data-video-node-view style={{ maxWidth: '100%' }}>
      {failed ? (
        <div className="rte-media-placeholder">Video unavailable</div>
      ) : resolvedSrc ? (
        <video src={resolvedSrc} controls={controls} style={{ maxWidth: '100%' }} />
      ) : (
        <div className="rte-media-placeholder">Loading video…</div>
      )}
    </NodeViewWrapper>
  )
}
