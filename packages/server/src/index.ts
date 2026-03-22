import express from 'express'
import cors from 'cors'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import roadmapsRouter from './routes/roadmaps.js'
import explainersRouter from './routes/explainers.js'
import progressRouter from './routes/progress.js'
import favoritesRouter from './routes/favorites.js'
import authRouter from './routes/auth.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
const PORT = parseInt(process.env.PORT || '3001', 10)

app.use(cors())
app.use(express.json())

// API routes
app.use('/api/v1/roadmaps', roadmapsRouter)
app.use('/api/v1/explainers', explainersRouter)
app.use('/api/v1/progress', progressRouter)
app.use('/api/v1/favorites', favoritesRouter)
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/users', authRouter)

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

// In production, serve the built Vue client
const clientDist = path.join(__dirname, '..', '..', 'client', 'dist')
app.use(express.static(clientDist))
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'))
})

app.listen(PORT, () => {
  console.log(`Newbie server running on http://localhost:${PORT}`)
})
