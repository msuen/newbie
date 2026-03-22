import { Router } from 'express'
import { v4 as uuid } from 'uuid'
import bcrypt from 'bcryptjs'
import db from '../db/schema.js'
import { signToken, requireAuth, type AuthRequest } from '../middleware/auth.js'

const router = Router()

// Register
router.post('/register', async (req, res) => {
  const { email, password, displayName } = req.body
  if (!email || !password || !displayName) {
    res.status(400).json({ error: 'email, password, and displayName are required' })
    return
  }
  if (password.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters' })
    return
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
  if (existing) {
    res.status(409).json({ error: 'Email already registered' })
    return
  }

  const id = uuid()
  const passwordHash = await bcrypt.hash(password, 12)

  db.prepare(
    'INSERT INTO users (id, email, password_hash, display_name) VALUES (?, ?, ?, ?)'
  ).run(id, email, passwordHash, displayName)

  // Migrate any local progress to the new account
  const localId = req.headers['x-local-id'] as string
  if (localId) {
    db.prepare('UPDATE user_progress SET user_id = ? WHERE user_id = ?').run(id, `local:${localId}`)
    db.prepare('UPDATE favorites SET user_id = ? WHERE user_id = ?').run(id, `local:${localId}`)
  }

  const token = signToken(id)
  res.json({ token, user: { id, email, displayName } })
})

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    res.status(400).json({ error: 'email and password are required' })
    return
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any
  if (!user) {
    res.status(401).json({ error: 'Invalid email or password' })
    return
  }

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) {
    res.status(401).json({ error: 'Invalid email or password' })
    return
  }

  // Migrate local progress on login too
  const localId = req.headers['x-local-id'] as string
  if (localId) {
    db.prepare(
      `UPDATE user_progress SET user_id = ? WHERE user_id = ? AND roadmap_id NOT IN (SELECT roadmap_id FROM user_progress WHERE user_id = ?)`
    ).run(user.id, `local:${localId}`, user.id)
    db.prepare(
      `UPDATE favorites SET user_id = ? WHERE user_id = ? AND roadmap_id NOT IN (SELECT roadmap_id FROM favorites WHERE user_id = ?)`
    ).run(user.id, `local:${localId}`, user.id)
  }

  const token = signToken(user.id)
  res.json({
    token,
    user: { id: user.id, email: user.email, displayName: user.display_name },
  })
})

// Get current user
router.get('/me', requireAuth, (req: AuthRequest, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId!) as any
  if (!user) {
    res.status(404).json({ error: 'User not found' })
    return
  }
  res.json({
    id: user.id,
    email: user.email,
    displayName: user.display_name,
  })
})

export default router
