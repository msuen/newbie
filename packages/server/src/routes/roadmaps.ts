import { Router } from 'express'
import { v4 as uuid } from 'uuid'
import { nanoid } from 'nanoid'
import db from '../db/schema.js'
import { generateRoadmap } from '../services/claude.js'
import { enrichWithSpotify } from '../services/spotify.js'
import { optionalAuth, getUserId, type AuthRequest } from '../middleware/auth.js'
import type { Roadmap } from '../types/index.js'

const router = Router()

router.use(optionalAuth)

// Generate a new roadmap
router.post('/generate', async (req: AuthRequest, res) => {
  const { query, queryType } = req.body
  if (!query || !queryType) {
    res.status(400).json({ error: 'query and queryType are required' })
    return
  }

  // Check cache first (same query within last 7 days)
  const cached = db
    .prepare(
      `SELECT * FROM roadmaps
       WHERE query = ? AND query_type = ?
       AND created_at > datetime('now', '-7 days')
       ORDER BY created_at DESC LIMIT 1`
    )
    .get(query.toLowerCase(), queryType) as any

  if (cached) {
    const roadmap: Roadmap = {
      id: cached.id,
      query: cached.query,
      queryType: cached.query_type,
      title: cached.title,
      description: cached.description,
      steps: JSON.parse(cached.steps_json),
      shareCode: cached.share_code,
      createdAt: cached.created_at,
    }
    res.json(roadmap)
    return
  }

  try {
    const generated = await generateRoadmap(query, queryType)
    const enrichedSteps = await enrichWithSpotify(generated.steps)
    const id = uuid()

    db.prepare(
      `INSERT INTO roadmaps (id, query, query_type, title, description, steps_json)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(id, query.toLowerCase(), queryType, generated.title, generated.description, JSON.stringify(enrichedSteps))

    const roadmap: Roadmap = {
      id,
      query: query.toLowerCase(),
      queryType,
      title: generated.title,
      description: generated.description,
      steps: enrichedSteps,
      shareCode: null,
      createdAt: new Date().toISOString(),
    }

    res.json(roadmap)
  } catch (err) {
    console.error('Failed to generate roadmap:', err)
    res.status(500).json({ error: 'Failed to generate roadmap' })
  }
})

// Get roadmap by ID
router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM roadmaps WHERE id = ?').get(req.params.id) as any
  if (!row) {
    res.status(404).json({ error: 'Roadmap not found' })
    return
  }

  const roadmap: Roadmap = {
    id: row.id,
    query: row.query,
    queryType: row.query_type,
    title: row.title,
    description: row.description,
    steps: JSON.parse(row.steps_json),
    shareCode: row.share_code,
    createdAt: row.created_at,
  }
  res.json(roadmap)
})

// Get roadmap by share code
router.get('/shared/:shareCode', (req, res) => {
  const row = db.prepare('SELECT * FROM roadmaps WHERE share_code = ?').get(req.params.shareCode) as any
  if (!row) {
    res.status(404).json({ error: 'Shared roadmap not found' })
    return
  }

  const roadmap: Roadmap = {
    id: row.id,
    query: row.query,
    queryType: row.query_type,
    title: row.title,
    description: row.description,
    steps: JSON.parse(row.steps_json),
    shareCode: row.share_code,
    createdAt: row.created_at,
  }
  res.json(roadmap)
})

// Generate a share code for a roadmap
router.post('/:id/share', (req, res) => {
  const row = db.prepare('SELECT * FROM roadmaps WHERE id = ?').get(req.params.id) as any
  if (!row) {
    res.status(404).json({ error: 'Roadmap not found' })
    return
  }

  if (row.share_code) {
    res.json({ shareCode: row.share_code, url: `/s/${row.share_code}` })
    return
  }

  const shareCode = nanoid(6)
  db.prepare('UPDATE roadmaps SET share_code = ? WHERE id = ?').run(shareCode, req.params.id)
  res.json({ shareCode, url: `/s/${shareCode}` })
})

export default router
