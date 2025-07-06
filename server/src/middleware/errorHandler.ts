import { Request, Response, NextFunction } from 'express'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

export interface AppError extends Error {
  statusCode?: number
  code?: string
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error)

  // Default error
  let statusCode = error.statusCode || 500
  let message = error.message || 'Internal server error'
  let code = error.code || 'INTERNAL_ERROR'

  // Prisma errors
  if (error instanceof PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        statusCode = 409
        message = 'Resource already exists'
        code = 'DUPLICATE_ERROR'
        break
      case 'P2025':
        statusCode = 404
        message = 'Resource not found'
        code = 'NOT_FOUND'
        break
      case 'P2003':
        statusCode = 400
        message = 'Invalid reference'
        code = 'INVALID_REFERENCE'
        break
      default:
        statusCode = 400
        message = 'Database error'
        code = 'DATABASE_ERROR'
    }
  }

  // Validation errors
  if (error.name === 'ValidationError') {
    statusCode = 400
    code = 'VALIDATION_ERROR'
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    statusCode = 401
    message = 'Invalid token'
    code = 'INVALID_TOKEN'
  }

  if (error.name === 'TokenExpiredError') {
    statusCode = 401
    message = 'Token expired'
    code = 'TOKEN_EXPIRED'
  }

  // Multer errors (file upload)
  if (error.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413
    message = 'File too large'
    code = 'FILE_TOO_LARGE'
  }

  if (error.code === 'LIMIT_FILE_COUNT') {
    statusCode = 413
    message = 'Too many files'
    code = 'TOO_MANY_FILES'
  }

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Internal server error'
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    code,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  })
}

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    code: 'NOT_FOUND'
  })
}

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
