import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production'

export interface AuthRequest extends Request {
  userId?: string
}

/**
 * Returns the user ID — either from JWT token or from X-Local-ID header.
 * This allows anonymous users to track progress without an account.
 */
export function getUserId(req: AuthRequest): string {
  if (req.userId) return req.userId
  const localId = req.headers['x-local-id'] as string
  if (localId) return `local:${localId}`
  return `local:anonymous`
}

/**
 * Optional auth middleware — sets req.userId if a valid token is present,
 * but does not reject unauthenticated requests.
 */
export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { userId: string }
      req.userId = payload.userId
    } catch {
      // Invalid token — continue without auth
    }
  }
  next()
}

/**
 * Required auth middleware — rejects unauthenticated requests.
 */
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' })
    return
  }
  const token = authHeader.slice(7)
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string }
    req.userId = payload.userId
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

export function signToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' })
}
