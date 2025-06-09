import { Router } from 'express'
import { Request, Response } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'

const router = Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images, videos, audio, and documents
    const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|webm|mp3|wav|pdf|doc|docx|txt/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)

    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error('Invalid file type'))
    }
  }
})

// Upload single file
router.post('/single', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      })
    }

    const fileUrl = `/uploads/${req.file.filename}`
    
    res.json({
      success: true,
      data: {
        id: req.file.filename,
        filename: req.file.originalname,
        url: fileUrl,
        size: req.file.size,
        mimetype: req.file.mimetype,
        uploadedAt: new Date()
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to upload file'
    })
  }
})

// Upload multiple files
router.post('/multiple', upload.array('files', 10), async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[]
    
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      })
    }

    const uploadedFiles = files.map(file => ({
      id: file.filename,
      filename: file.originalname,
      url: `/uploads/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype,
      uploadedAt: new Date()
    }))

    res.json({
      success: true,
      data: uploadedFiles
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to upload files'
    })
  }
})

// Upload avatar
router.post('/avatar', upload.single('avatar'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No avatar uploaded'
      })
    }

    // Check if it's an image
    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({
        success: false,
        error: 'Avatar must be an image'
      })
    }

    const avatarUrl = `/uploads/${req.file.filename}`
    
    // TODO: Update user avatar in database
    
    res.json({
      success: true,
      data: {
        avatarUrl,
        uploadedAt: new Date()
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to upload avatar'
    })
  }
})

// Delete file
router.delete('/:filename', async (req: Request, res: Response) => {
  try {
    const { filename } = req.params
    const filePath = path.join(__dirname, '../../uploads', filename)
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      res.json({
        success: true,
        message: 'File deleted successfully'
      })
    } else {
      res.status(404).json({
        success: false,
        error: 'File not found'
      })
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete file'
    })
  }
})

export default router
