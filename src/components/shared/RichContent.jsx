import { useEffect, useRef } from 'react'
import { resolveMediaUrl } from '../../utils/resolveMediaSrc'

/**
 * Renders trusted, author-produced rich-text HTML (from RichTextEditor) and
 * resolves any embedded media (data-media-id — see VideoExtension.js /
 * ImageExtension.js) to a fresh signed URL after mount. Use this in place of
 * a raw dangerouslySetInnerHTML wherever such content is displayed, so
 * embedded videos/images never go stale.
 */
export default function RichContent({ html, className, as: Tag = 'div' }) {
  const ref = useRef(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return
    let cancelled = false
    const els = root.querySelectorAll('[data-media-id]')
    els.forEach(el => {
      const id = el.getAttribute('data-media-id')
      if (!id) return
      resolveMediaUrl(id)
        .then(url => { if (!cancelled) el.src = url })
        .catch(() => { if (!cancelled) el.classList.add('rte-media-broken') })
    })
    return () => { cancelled = true }
  }, [html])

  return <Tag ref={ref} className={className} dangerouslySetInnerHTML={{ __html: html || '' }} />
}
