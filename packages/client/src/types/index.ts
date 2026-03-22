export interface Roadmap {
  id: string
  query: string
  queryType: 'artist' | 'genre'
  title: string
  description: string
  steps: RoadmapStep[]
  shareCode: string | null
  createdAt: string
}

export interface RoadmapStep {
  id: string
  order: number
  title: string
  description: string
  items: PlaylistItem[]
}

export interface PlaylistItem {
  id: string
  type: 'album' | 'song'
  title: string
  artist: string
  year: number | null
  spotifyUri: string | null
  appleMusicUrl: string | null
  whyListen: string
}

export interface Explainer {
  id: string
  itemId: string
  summary: string
  significance: string
  criticQuotes: CriticQuote[]
  listenFor: string[]
}

export interface CriticQuote {
  text: string
  source: string
  attribution: string
}

export interface User {
  id: string
  email: string
  displayName: string
}

export interface UserProgress {
  roadmapId: string
  completedStepIds: string[]
  lastAccessedAt: string
}
