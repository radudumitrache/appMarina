import { openMediaFile } from '../api/media'

/**
 * Resolves a stable media-file id (stored in rich-text content as
 * data-media-id) to a fresh, short-lived signed GCS URL. Always fetched live
 * — never cached across calls — since the returned URL is itself only valid
 * for 5 minutes (see MediaFileOpenView).
 */
export async function resolveMediaUrl(mediaId) {
  const { data } = await openMediaFile(mediaId)
  return data.url
}
