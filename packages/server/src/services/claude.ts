import Anthropic from '@anthropic-ai/sdk'
import { v4 as uuid } from 'uuid'
import type { RoadmapStep, Explainer, CriticQuote } from '../types/index.js'

const client = new Anthropic()

const ROADMAP_SYSTEM_PROMPT = `You are a music historian and educator creating discovery roadmaps for beginners. Your roadmaps guide someone from zero knowledge to deep appreciation of an artist or genre. Each roadmap has 4-6 chronological steps. Each step has 3-5 essential albums or songs. Your tone is enthusiastic but not condescending — like a knowledgeable friend sharing their passion.

Rules:
- Always start with the most accessible, foundational works
- Progress chronologically or by complexity
- Include a mix of famous and lesser-known essential works
- Each item needs a 1-2 sentence "whyListen" hook
- Be specific about album names, artist names, and years
- For genres, cover key eras and subgenres
- For artists, cover their career evolution
- For each item, provide the Spotify ID if you know it (the alphanumeric ID from the Spotify URL, e.g. "4aawyAB9vmqN3uQ7FjRGTy" from open.spotify.com/album/4aawyAB9vmqN3uQ7FjRGTy). Only provide IDs you are confident about — leave null if unsure.`

interface GeneratedRoadmap {
  title: string
  description: string
  steps: {
    title: string
    description: string
    items: {
      type: 'album' | 'song'
      title: string
      artist: string
      year: number | null
      whyListen: string
      spotifyId: string | null
    }[]
  }[]
}

export async function generateRoadmap(
  query: string,
  queryType: 'artist' | 'genre'
): Promise<{ title: string; description: string; steps: RoadmapStep[] }> {
  const userPrompt =
    queryType === 'artist'
      ? `Create a music discovery roadmap for the artist "${query}". Guide a complete beginner through their essential works chronologically.`
      : `Create a music discovery roadmap for the genre "${query}". Guide a complete beginner from the genre's origins through its key eras and subgenres.`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: ROADMAP_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
    tools: [
      {
        name: 'create_roadmap',
        description: 'Create a structured music discovery roadmap',
        input_schema: {
          type: 'object' as const,
          properties: {
            title: { type: 'string', description: 'Title for the roadmap' },
            description: {
              type: 'string',
              description: 'Brief description of what this roadmap covers',
            },
            steps: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  items: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        type: { type: 'string', enum: ['album', 'song'] },
                        title: { type: 'string' },
                        artist: { type: 'string' },
                        year: { type: 'number' },
                        whyListen: { type: 'string' },
                        spotifyId: { type: 'string', description: 'Spotify content ID (22-char alphanumeric, e.g. 4aawyAB9vmqN3uQ7FjRGTy). Null if unknown.' },
                      },
                      required: ['type', 'title', 'artist', 'whyListen'],
                    },
                  },
                },
                required: ['title', 'description', 'items'],
              },
            },
          },
          required: ['title', 'description', 'steps'],
        },
      },
    ],
    tool_choice: { type: 'tool', name: 'create_roadmap' },
  })

  // Extract the tool use response
  const toolUse = response.content.find((block) => block.type === 'tool_use')
  if (!toolUse || toolUse.type !== 'tool_use') {
    throw new Error('Claude did not return a structured roadmap')
  }

  const generated = toolUse.input as GeneratedRoadmap

  // Assign UUIDs to all entities
  const steps: RoadmapStep[] = generated.steps.map((step, i) => ({
    id: uuid(),
    order: i + 1,
    title: step.title,
    description: step.description,
    items: step.items.map((item) => ({
      id: uuid(),
      type: item.type,
      title: item.title,
      artist: item.artist,
      year: item.year ?? null,
      spotifyUri: item.spotifyId ? `spotify:${item.type === 'song' ? 'track' : 'album'}:${item.spotifyId}` : null,
      appleMusicUrl: null,
      whyListen: item.whyListen,
    })),
  }))

  return {
    title: generated.title,
    description: generated.description,
    steps,
  }
}

interface GeneratedExplainer {
  summary: string
  significance: string
  criticQuotes: { text: string; source: string; attribution: string }[]
  listenFor: string[]
}

export async function generateExplainer(
  title: string,
  artist: string,
  year: number | null
): Promise<Omit<Explainer, 'id' | 'itemId'>> {
  const yearStr = year ? ` (${year})` : ''
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: `Write a beginner-friendly explainer about "${title}" by ${artist}${yearStr}.

Include:
- A 2-3 paragraph summary accessible to someone new to this genre
- Why it matters historically
- 2-3 real critic quotes (attribute accurately — use source publication name and reviewer name)
- 3-4 "listen for" tips (specific musical elements to notice)`,
      },
    ],
    tools: [
      {
        name: 'create_explainer',
        description: 'Create a structured explainer for a music item',
        input_schema: {
          type: 'object' as const,
          properties: {
            summary: { type: 'string' },
            significance: { type: 'string' },
            criticQuotes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  text: { type: 'string' },
                  source: { type: 'string' },
                  attribution: { type: 'string' },
                },
                required: ['text', 'source', 'attribution'],
              },
            },
            listenFor: { type: 'array', items: { type: 'string' } },
          },
          required: ['summary', 'significance', 'criticQuotes', 'listenFor'],
        },
      },
    ],
    tool_choice: { type: 'tool', name: 'create_explainer' },
  })

  const toolUse = response.content.find((block) => block.type === 'tool_use')
  if (!toolUse || toolUse.type !== 'tool_use') {
    throw new Error('Claude did not return a structured explainer')
  }

  const generated = toolUse.input as GeneratedExplainer
  return {
    summary: generated.summary,
    significance: generated.significance,
    criticQuotes: generated.criticQuotes,
    listenFor: generated.listenFor,
  }
}
