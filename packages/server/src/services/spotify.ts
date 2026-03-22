import type { RoadmapStep } from '../types/index.js'

/**
 * Enrich playlist items with validated Spotify URIs.
 * Items that already have a spotifyUri (from Claude generation) get validated.
 * Items without one get a search fallback via iTunes.
 */
export async function enrichWithSpotify(steps: RoadmapStep[]): Promise<RoadmapStep[]> {
  const enriched = await Promise.all(
    steps.map(async (step) => ({
      ...step,
      items: await Promise.all(
        step.items.map(async (item) => {
          if (item.spotifyUri) {
            // Validate the Claude-provided URI via oEmbed
            const valid = await validateSpotifyUri(item.spotifyUri)
            if (valid) return item
          }
          // Fallback: try to find via iTunes search
          const spotifyUri = await findViaItunes(item.title, item.artist, item.type)
          return { ...item, spotifyUri }
        })
      ),
    }))
  )
  return enriched
}

/**
 * Validate a Spotify URI by checking the oEmbed endpoint (free, no auth).
 */
async function validateSpotifyUri(uri: string): Promise<boolean> {
  try {
    // Convert URI to URL: spotify:track:ID -> https://open.spotify.com/track/ID
    const parts = uri.replace('spotify:', '').split(':')
    if (parts.length !== 2) return false
    const url = `https://open.spotify.com/${parts[0]}/${parts[1]}`
    const oembedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`

    const res = await fetch(oembedUrl, { signal: AbortSignal.timeout(3000) })
    return res.ok
  } catch {
    return false
  }
}

/**
 * Search iTunes (free, no auth) to find music metadata,
 * then attempt to find the corresponding Spotify content.
 */
async function findViaItunes(
  title: string,
  artist: string,
  type: 'album' | 'song'
): Promise<string | null> {
  try {
    const query = `${title} ${artist}`
    const itunesEntity = type === 'song' ? 'song' : 'album'
    const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=${itunesEntity}&limit=1`

    const res = await fetch(itunesUrl, { signal: AbortSignal.timeout(5000) })
    if (!res.ok) return null

    const data = (await res.json()) as {
      resultCount: number
      results: Array<{ trackName?: string; collectionName?: string; artistName?: string }>
    }
    if (data.resultCount === 0) return null

    // iTunes confirmed the item exists — return null for now
    // (we can't get Spotify IDs from iTunes)
    // The Claude-provided ID was already our best shot
    return null
  } catch {
    return null
  }
}
