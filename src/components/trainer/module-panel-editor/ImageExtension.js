import TiptapImage from '@tiptap/extension-image'
import { ReactNodeViewRenderer } from '@tiptap/react'
import ImageNodeView from './ImageNodeView'

// Extends the stock Image node with a stable mediaId reference, resolved to
// a fresh signed URL at render time — same rationale as VideoExtension.js.
const Image = TiptapImage.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      mediaId: {
        default: null,
        parseHTML:  element => element.getAttribute('data-media-id'),
        renderHTML: attrs => attrs.mediaId != null ? { 'data-media-id': attrs.mediaId } : {},
      },
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView)
  },
})

export default Image
