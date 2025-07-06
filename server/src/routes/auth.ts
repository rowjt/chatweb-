import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Joi from 'joi'
import { prisma } from '../config/database'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { authRateLimiter } from '../middleware/rateLimiter'
import { asyncHandler } from '../middleware/errorHandler'

const router = Router()

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  username: Joi.string().alphanum().min(3).max(20).required(),
  password: Joi.string().min(6).required(),
  displayName: Joi.string().min(1).max(50).required(),
})

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
})

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
})

// Helper function to generate JWT token
const generateToken = (userId: string) => {
  const secret = process.env.JWT_SECRET || 'secret'
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d'
  return jwt.sign({ userId }, secret, { expiresIn } as jwt.SignOptions)
}

// Register
router.post('/register', authRateLimiter, asyncHandler(async (req, res) => {
  const { error, value } = registerSchema.validate(req.body)
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details?.[0]?.message || error.message
    })
  }

  const { email, username, password, displayName } = value

  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        { username }
      ]
    }
  })

  if (existingUser) {
    return res.status(409).json({
      success: false,
      error: existingUser.email === email ? 'Email already registered' : 'Username already taken'
    })
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12)

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      username,
      password: hashedPassword,
      displayName,
    },
    select: {
      id: true,
      email: true,
      username: true,
      displayName: true,
      avatar: true,
      bio: true,
      isOnline: true,
      lastSeen: true,
      isAdmin: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
    }
  })

  // Generate token
  const token = generateToken(user.id)

  res.status(201).json({
    success: true,
    data: {
      user,
      token
    }
  })
}))

// Login
router.post('/login', authRateLimiter, asyncHandler(async (req, res) => {
  const { error, value } = loginSchema.validate(req.body)
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details?.[0]?.message || error.message
    })
  }

  const { email, password } = value

  // Find user
  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    })
  }

  // Check password
  const isValidPassword = await bcrypt.compare(password, user.password)
  if (!isValidPassword) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    })
  }

  // Update user online status
  await prisma.user.update({
    where: { id: user.id },
    data: {
      isOnline: true,
      lastSeen: new Date()
    }
  })

  // Generate token
  const token = generateToken(user.id)

  // Return user without password
  const { password: _, ...userWithoutPassword } = user

  res.json({
    success: true,
    data: {
      user: userWithoutPassword,
      token
    }
  })
}))

// Logout
router.post('/logout', authMiddleware, asyncHandler(async (req: AuthRequest, res) => {
  // Update user offline status
  await prisma.user.update({
    where: { id: req.user!.id },
    data: {
      isOnline: false,
      lastSeen: new Date()
    }
  })

  res.json({
    success: true,
    message: 'Logged out successfully'
  })
}))

// Get current user
router.get('/me', authMiddleware, asyncHandler(async (req: AuthRequest, res) => {
  res.json({
    success: true,
    data: req.user
  })
}))

// Change password
router.post('/change-password', authMiddleware, asyncHandler(async (req: AuthRequest, res) => {
  const { error, value } = changePasswordSchema.validate(req.body)
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details?.[0]?.message || error.message
    })
  }

  const { currentPassword, newPassword } = value

  // Get user with password
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id }
  })

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    })
  }

  // Check current password
  const isValidPassword = await bcrypt.compare(currentPassword, user.password)
  if (!isValidPassword) {
    return res.status(401).json({
      success: false,
      error: 'Current password is incorrect'
    })
  }

  // Hash new password
  const hashedNewPassword = await bcrypt.hash(newPassword, 12)

  // Update password
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedNewPassword
    }
  })

  res.json({
    success: true,
    message: 'Password changed successfully'
  })
}))

// Refresh token (optional - for token refresh functionality)
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      error: 'Refresh token required'
    })
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { userId: string }
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatar: true,
        bio: true,
        isOnline: true,
        lastSeen: true,
        isAdmin: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token'
      })
    }

    const newToken = generateToken(user.id)

    res.json({
      success: true,
      data: {
        user,
        token: newToken
      }
    })
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid refresh token'
    })
  }
}))

export default router
