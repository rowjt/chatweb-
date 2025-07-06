import { Request, Response, NextFunction } from 'express'
import crypto from 'crypto'
import { prisma } from '../config/database'

export async function apiKeyMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const key = req.headers['x-api-key']

    if (!key || typeof key !== 'string') {
      return res.status(401).json({ success: false, error: 'API key required' })
    }

    const hashed = crypto.createHash('sha256').update(key).digest('hex')

    const existing = await prisma.apiKey.findFirst({
      where: { hashedKey: hashed, revoked: false },
    })

    if (!existing) {
      return res.status(403).json({ success: false, error: 'Invalid API key' })
    }

    next()
  } catch (error) {
    console.error('API key middleware error:', error)
    res.status(500).json({ success: false, error: 'API key verification failed' })
  }
}
