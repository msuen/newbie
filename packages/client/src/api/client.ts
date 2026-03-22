import type { Roadmap, Explainer, UserProgress, User } from '@/types'

const BASE = '/api/v1'

function getLocalId(): string {
  let id = localStorage.getItem('newbie-local-id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('newbie-local-id', id)
  }
  return id
}

function headers(): Record<string, string> {
  const h: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Local-ID': getLocalId(),
  }
  const token = localStorage.getItem('newbie-token')
  if (token) {
    h['Authorization'] = `Bearer ${token}`
  }
  return h
}

async function request<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: headers(),
    ...opts,
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`API error ${res.status}: ${body}`)
  }
  return res.json()
}

// Roadmaps
export function generateRoadmap(query: string, queryType: 'artist' | 'genre'): Promise<Roadmap> {
  return request('/roadmaps/generate', {
    method: 'POST',
    body: JSON.stringify({ query, queryType }),
  })
}

export function getRoadmap(id: string): Promise<Roadmap> {
  return request(`/roadmaps/${id}`)
}

export function getSharedRoadmap(shareCode: string): Promise<Roadmap> {
  return request(`/roadmaps/shared/${shareCode}`)
}

export function shareRoadmap(id: string): Promise<{ shareCode: string; url: string }> {
  return request(`/roadmaps/${id}/share`, { method: 'POST' })
}

// Explainers
export function getExplainer(itemId: string): Promise<Explainer> {
  return request(`/explainers/${itemId}`)
}

export function generateExplainer(itemId: string, title: string, artist: string, year: number | null): Promise<Explainer> {
  return request('/explainers/generate', {
    method: 'POST',
    body: JSON.stringify({ itemId, title, artist, year }),
  })
}

// Progress
export function getProgress(): Promise<UserProgress[]> {
  return request('/progress')
}

export function updateProgress(roadmapId: string, completedStepIds: string[]): Promise<void> {
  return request(`/progress/${roadmapId}`, {
    method: 'PUT',
    body: JSON.stringify({ completedStepIds }),
  })
}

// Favorites
export function getFavorites(): Promise<Roadmap[]> {
  return request('/favorites')
}

export function addFavorite(roadmapId: string): Promise<void> {
  return request(`/favorites/${roadmapId}`, { method: 'POST' })
}

export function removeFavorite(roadmapId: string): Promise<void> {
  return request(`/favorites/${roadmapId}`, { method: 'DELETE' })
}

// Auth
export function register(email: string, password: string, displayName: string): Promise<{ token: string; user: User }> {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, displayName }),
  })
}

export function login(email: string, password: string): Promise<{ token: string; user: User }> {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function getMe(): Promise<User> {
  return request('/users/me')
}
