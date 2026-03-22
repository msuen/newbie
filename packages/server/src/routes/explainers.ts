import { Router } from 'express'
import { v4 as uuid } from 'uuid'
import db from '../db/schema.js'
import { generateExplainer } from '../services/claude.js'
import type { Explainer } from '../types/index.js'

const router = Router()

// Get cached explainer by item ID
router.get('/:itemId', (req, res) => {
  const row = db.prepare('SELECT * FROM explainers WHERE item_id = ?').get(req.params.itemId) as any
  if (!row) {
    res.status(404).json({ error: 'Explainer not found' })
    return
  }

  const explainer: Explainer = {
    id: row.id,
    itemId: row.item_id,
    summary: row.summary,
    significance: row.significance,
    criticQuotes: JSON.parse(row.critic_quotes_json),
    listenFor: JSON.parse(row.listen_for_json),
  }
  res.json(explainer)
})

// Generate explainer on demand
router.post('/generate', async (req, res) => {
  const { itemId, title, artist, year } = req.body
  if (!itemId) {
    res.status(400).json({ error: 'itemId is required' })
    return
  }

  // Check if already generated
  const existing = db.prepare('SELECT * FROM explainers WHERE item_id = ?').get(itemId) as any
  if (existing) {
    const explainer: Explainer = {
      id: existing.id,
      itemId: existing.item_id,
      summary: existing.summary,
      significance: existing.significance,
      criticQuotes: JSON.parse(existing.critic_quotes_json),
      listenFor: JSON.parse(existing.listen_for_json),
    }
    res.json(explainer)
    return
  }

  try {
    const generated = await generateExplainer(title || 'Unknown', artist || 'Unknown', year || null)
    const id = uuid()

    db.prepare(
      `INSERT INTO explainers (id, item_id, summary, significance, critic_quotes_json, listen_for_json)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(id, itemId, generated.summary, generated.significance, JSON.stringify(generated.criticQuotes), JSON.stringify(generated.listenFor))

    const explainer: Explainer = {
      id,
      itemId,
      ...generated,
    }
    res.json(explainer)
  } catch (err) {
    console.error('Failed to generate explainer:', err)
    res.status(500).json({ error: 'Failed to generate explainer' })
  }
})

export default router
