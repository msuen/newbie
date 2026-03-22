import { Router } from 'express'
import db from '../db/schema.js'
import { optionalAuth, getUserId, type AuthRequest } from '../middleware/auth.js'
import type { Roadmap } from '../types/index.js'

const router = Router()

router.use(optionalAuth)

// List favorites
router.get('/', (req: AuthRequest, res) => {
  const userId = getUserId(req)
  const rows = db
    .prepare(
      `SELECT r.* FROM favorites f
       JOIN roadmaps r ON f.roadmap_id = r.id
       WHERE f.user_id = ?
       ORDER BY f.created_at DESC`
    )
    .all(userId) as any[]

  const roadmaps: Roadmap[] = rows.map((row) => ({
    id: row.id,
    query: row.query,
    queryType: row.query_type,
    title: row.title,
    description: row.description,
    steps: JSON.parse(row.steps_json),
    shareCode: row.share_code,
    createdAt: row.created_at,
  }))

  res.json(roadmaps)
})

// Add favorite
router.post('/:roadmapId', (req: AuthRequest, res) => {
  const userId = getUserId(req)
  try {
    db.prepare(
      `INSERT OR IGNORE INTO favorites (user_id, roadmap_id)
       VALUES (?, ?)`
    ).run(userId, req.params.roadmapId)
    res.json({ ok: true })
  } catch {
    res.status(400).json({ error: 'Failed to add favorite' })
  }
})

// Remove favorite
router.delete('/:roadmapId', (req: AuthRequest, res) => {
  const userId = getUserId(req)
  db.prepare('DELETE FROM favorites WHERE user_id = ? AND roadmap_id = ?').run(
    userId,
    req.params.roadmapId
  )
  res.json({ ok: true })
})

export default router
