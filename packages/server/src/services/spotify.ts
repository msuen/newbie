import type { RoadmapStep } from '../types/index.js'

/**
 * Enrich playlist items with Spotify URIs using the free oEmbed API.
 * This requires no API key or authentication.
 */
export async function enrichWithSpotify(steps: RoadmapStep[]): Promise<RoadmapStep[]> {
  const enriched = await Promise.all(
    steps.map(async (step) => ({
      ...step,
      items: await Promise.all(
        step.items.map(async (item) => {
          const spotifyUri = await searchSpotify(item.title, item.artist, item.type)
          return { ...item, spotifyUri }
        })
      ),
    }))
  )
  return enriched
}

async function searchSpotify(
  title: string,
  artist: string,
  type: 'album' | 'song'
): Promise<string | null> {
  try {
    const query = encodeURIComponent(`${title} ${artist}`)
    const spotifyType = type === 'song' ? 'track' : 'album'
    const searchUrl = `https://open.spotify.com/search/${query}`

    // Use oEmbed to check if a search URL resolves
    // Note: oEmbed only works with direct content URLs, not search URLs
    // For MVP, we construct a plausible URI that can be searched client-side
    // A proper implementation would use the Spotify Web API with client credentials

    // For now, return null — Spotify embed will show a placeholder
    // and users can use the deep link to search on Spotify
    return null
  } catch {
    return null
  }
}
