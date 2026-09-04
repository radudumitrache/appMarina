import { useEffect, useState } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import { resolveMediaUrl } from '../../../utils/resolveMediaSrc'

export default function ImageNodeView({ node }) {
  const { mediaId, src: staticSrc, alt } = node.attrs
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
    <NodeViewWrapper as="span" data-image-node-view style={{ display: 'inline-block', maxWidth: '100%' }}>
      {failed ? (
        <span className="rte-media-placeholder">Image unavailable</span>
      ) : resolvedSrc ? (
        <img src={resolvedSrc} alt={alt || ''} style={{ maxWidth: '100%' }} />
      ) : (
        <span className="rte-media-placeholder">Loading image…</span>
      )}
    </NodeViewWrapper>
  )
}
