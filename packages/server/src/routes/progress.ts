import { Router } from 'express'
import db from '../db/schema.js'
import { optionalAuth, getUserId, type AuthRequest } from '../middleware/auth.js'

const router = Router()

router.use(optionalAuth)

// Get all progress for current user
router.get('/', (req: AuthRequest, res) => {
  const userId = getUserId(req)
  const rows = db
    .prepare('SELECT * FROM user_progress WHERE user_id = ?')
    .all(userId) as any[]

  const progress = rows.map((row) => ({
    roadmapId: row.roadmap_id,
    completedStepIds: JSON.parse(row.completed_step_ids_json),
    lastAccessedAt: row.last_accessed_at,
  }))

  res.json(progress)
})

// Update progress for a roadmap
router.put('/:roadmapId', (req: AuthRequest, res) => {
  const userId = getUserId(req)
  const { roadmapId } = req.params
  const { completedStepIds } = req.body

  if (!Array.isArray(completedStepIds)) {
    res.status(400).json({ error: 'completedStepIds must be an array' })
    return
  }

  db.prepare(
    `INSERT INTO user_progress (user_id, roadmap_id, completed_step_ids_json, last_accessed_at)
     VALUES (?, ?, ?, datetime('now'))
     ON CONFLICT(user_id, roadmap_id)
     DO UPDATE SET completed_step_ids_json = ?, last_accessed_at = datetime('now')`
  ).run(userId, roadmapId, JSON.stringify(completedStepIds), JSON.stringify(completedStepIds))

  res.json({ ok: true })
})

export default router
