/**
 * VRSceneRenderer.js
 *
 * Static imports of all local VR panorama scenes from the vrScenes/ folder.
 * Vite processes these at build-time so they work correctly in both dev and prod.
 *
 * Use resolveSceneUrl(sceneUrl) to map any backend-stored scene_url
 * (e.g. "/vr-scenes/Bridge entrance.jpg" or a full URL) to the correct
 * Vite-bundled asset path.
 */

import bridge       from '../../../vrScenes/Bridge entrance.jpg'
import centerAOOW   from '../../../vrScenes/Center AOOW.jpg'
import centerBehind from '../../../vrScenes/Center behind.jpg'
import centerFwd    from '../../../vrScenes/Center forward.jpg'
import centerOOW    from '../../../vrScenes/Center OOW.jpg'
import safetyCenter from '../../../vrScenes/Safety center.jpg'
import starboard    from '../../../vrScenes/Starboard wing.jpg'

/** All available VR panorama scenes. */
export const VR_SCENES = [
  { label: 'Bridge Entrance',  filename: 'Bridge entrance.jpg',  src: bridge       },
  { label: 'Center AOOW',      filename: 'Center AOOW.jpg',      src: centerAOOW   },
  { label: 'Center Behind',    filename: 'Center behind.jpg',    src: centerBehind },
  { label: 'Center Forward',   filename: 'Center forward.jpg',   src: centerFwd    },
  { label: 'Center OOW',       filename: 'Center OOW.jpg',       src: centerOOW    },
  { label: 'Safety Center',    filename: 'Safety center.jpg',    src: safetyCenter },
  { label: 'Starboard Wing',   filename: 'Starboard wing.jpg',   src: starboard    },
]

/**
 * Build an absolute scene URL to send to the backend when creating/updating
 * VR panels. The backend URLField rejects relative paths, so we derive the
 * server origin from VITE_API_BASE_URL (e.g. http://localhost:8000/api →
 * http://localhost:8000) and prepend it to the /vr-scenes/ path.
 *
 * @param {string} filename  e.g. "Bridge entrance.jpg"
 * @returns {string}         e.g. "http://localhost:8000/vr-scenes/Bridge%20entrance.jpg"
 */
export function buildSceneUrl(filename) {
  const base = import.meta.env.VITE_API_BASE_URL ?? ''
  try {
    const origin = new URL(base).origin
    return `${origin}/vr-scenes/${encodeURIComponent(filename)}`
  } catch {
    return `/vr-scenes/${filename}`
  }
}

/**
 * Resolve a backend-stored scene URL to a local Vite asset.
 *
 * The backend stores paths like "/vr-scenes/Bridge entrance.jpg".
 * We extract the filename portion (after the last '/'), match it
 * case-insensitively against VR_SCENES, and return the bundled src.
 *
 * Falls back to the original URL if no match is found (e.g. a remote URL).
 *
 * @param {string|null|undefined} sceneUrl
 * @returns {string|null}
 */
export function resolveSceneUrl(sceneUrl) {
  if (!sceneUrl) return null
  const filename = decodeURIComponent(sceneUrl.split('/').pop())
  const scene = VR_SCENES.find(
    s => s.filename.toLowerCase() === filename.toLowerCase()
  )
  return scene ? scene.src : sceneUrl
}
