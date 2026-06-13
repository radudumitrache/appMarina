import { Node, mergeAttributes } from '@tiptap/core'

const Video = Node.create({
  name: 'video',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      src:     { default: null },
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

  addCommands() {
    return {
      setVideo: (attrs) => ({ commands }) =>
        commands.insertContent({ type: this.name, attrs }),
    }
  },
})

export default Video
