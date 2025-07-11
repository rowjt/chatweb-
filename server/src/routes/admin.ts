import { Router } from 'express'
import { Request, Response } from 'express'
import crypto from 'crypto'
import { prisma } from '../config/database'
import { adminMiddleware, AuthRequest } from '../middleware/auth'

const router = Router()

// Middleware to check admin permissions
const requireAdmin = adminMiddleware

// Get system statistics
router.get('/stats', requireAdmin, async (req: Request, res: Response) => {
  try {
    // TODO: Implement real statistics
    res.json({
      success: true,
      data: {
        totalUsers: 1234,
        activeUsers: 567,
        totalChats: 890,
        totalMessages: 12345,
        storageUsed: 2.5, // GB
        serverUptime: 99.9 // %
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get statistics'
    })
  }
})

// Get all users (admin only)
router.get('/users', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, search } = req.query
    // TODO: Implement user listing with pagination and search
    res.json({
      success: true,
      data: {
        users: [],
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: 0,
          totalPages: 0
        }
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get users'
    })
  }
})

// Get user details (admin only)
router.get('/users/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    // TODO: Implement get user details
    res.json({
      success: true,
      data: {
        id,
        email: 'user@example.com',
        displayName: 'User',
        isActive: true,
        createdAt: new Date(),
        lastLogin: new Date()
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get user details'
    })
  }
})

// Update user (admin only)
router.put('/users/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    // TODO: Implement user update
    res.json({
      success: true,
      data: {
        id,
        ...req.body,
        updatedAt: new Date()
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update user'
    })
  }
})

// Deactivate user (admin only)
router.post('/users/:id/deactivate', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    // TODO: Implement user deactivation
    res.json({
      success: true,
      message: 'User deactivated successfully'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to deactivate user'
    })
  }
})

// Activate user (admin only)
router.post('/users/:id/activate', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    // TODO: Implement user activation
    res.json({
      success: true,
      message: 'User activated successfully'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to activate user'
    })
  }
})

// Get all chats (admin only)
router.get('/chats', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query
    // TODO: Implement chat listing
    res.json({
      success: true,
      data: {
        chats: [],
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: 0,
          totalPages: 0
        }
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get chats'
    })
  }
})

// Delete chat (admin only)
router.delete('/chats/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    // TODO: Implement chat deletion
    res.json({
      success: true,
      message: 'Chat deleted successfully'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete chat'
    })
  }
})

// Get system logs (admin only)
router.get('/logs', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50, level } = req.query
    // TODO: Implement log retrieval
    res.json({
      success: true,
      data: {
        logs: [],
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: 0,
          totalPages: 0
        }
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get logs'
    })
  }
})

// Create a new API key
router.post('/api-keys', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const key = crypto.randomBytes(32).toString('hex')
    const hashed = crypto.createHash('sha256').update(key).digest('hex')

    await prisma.apiKey.create({
      data: {
        hashedKey: hashed,
        ownerId: req.user?.id,
      },
    })

    res.status(201).json({ success: true, data: { apiKey: key } })
  } catch (error) {
    console.error('Failed to create API key:', error)
    res.status(500).json({ success: false, error: 'Failed to create API key' })
  }
})

// List API keys
router.get('/api-keys', requireAdmin, async (req: Request, res: Response) => {
  try {
    const keys = await prisma.apiKey.findMany({
      where: { ownerId: (req as AuthRequest).user?.id },
      select: { id: true, createdAt: true, revoked: true },
    })
    res.json({ success: true, data: keys })
  } catch (error) {
    console.error('Failed to list API keys:', error)
    res.status(500).json({ success: false, error: 'Failed to list API keys' })
  }
})

// Revoke API key
router.delete('/api-keys/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    if (!id) {
      return res.status(400).json({ success: false, error: 'ID required' })
    }
    await prisma.apiKey.update({ where: { id }, data: { revoked: true } })
    res.json({ success: true })
  } catch (error) {
    console.error('Failed to revoke API key:', error)
    res.status(500).json({ success: false, error: 'Failed to revoke API key' })
  }
})

export default router
