import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import VideoNodeView from './VideoNodeView'

const Video = Node.create({
  name: 'video',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      // Stable reference — resolved to a fresh signed URL at render time so
      // embedded videos never go stale. `src` is kept only as a fallback for
      // content saved before this existed (or not yet backfilled).
      mediaId: {
        default: null,
        parseHTML:  element => element.getAttribute('data-media-id'),
        renderHTML: attrs => attrs.mediaId != null ? { 'data-media-id': attrs.mediaId } : {},
      },
      src: {
        default: null,
        parseHTML:  element => element.getAttribute('src'),
        renderHTML: attrs => attrs.src ? { src: attrs.src } : {},
      },
      controls: { default: true },
      style:   { default: 'max-width:100%;' },
    }
  },

  parseHTML() {
    return [{ tag: 'video' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['video', mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    return ReactNodeViewRenderer(VideoNodeView)
  },

  addCommands() {
    return {
      setVideo: (attrs) => ({ commands }) =>
        commands.insertContent({ type: this.name, attrs }),
    }
  },
})

export default Video
