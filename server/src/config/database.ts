import { PrismaClient } from '@prisma/client'

declare global {
  var __prisma: PrismaClient | undefined
}

// Resolve database connection URL
let databaseUrl = process.env.DATABASE_URL
if (!databaseUrl && process.env.DB_HOST && process.env.DB_PORT && process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_NAME) {
  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env
  const encodedPass = encodeURIComponent(DB_PASSWORD)
  databaseUrl = `postgresql://${DB_USER}:${encodedPass}@${DB_HOST}:${DB_PORT}/${DB_NAME}`
}

// Prevent multiple instances of Prisma Client in development
const prisma = globalThis.__prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: databaseUrl ? { db: { url: databaseUrl } } : undefined,
})

if (process.env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma
}

export { prisma }

export async function initializeDatabase() {
  try {
    // Test the connection
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    // Run any initialization logic here
    await createDefaultAdmin()
    
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    throw error
  }
}

async function createDefaultAdmin() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@chatapp.com'
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456'
    
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    })
    
    if (!existingAdmin) {
      const bcrypt = await import('bcryptjs')
      const hashedPassword = await bcrypt.hash(adminPassword, 12)
      
      await prisma.user.create({
        data: {
          email: adminEmail,
          username: 'admin',
          displayName: 'Administrator',
          password: hashedPassword,
          isAdmin: true,
          isVerified: true,
        }
      })
      
      console.log('✅ Default admin user created')
      console.log(`📧 Admin email: ${adminEmail}`)
      console.log(`🔑 Admin password: ${adminPassword}`)
    }
  } catch (error) {
    console.error('❌ Failed to create default admin:', error)
  }
}

export async function disconnectDatabase() {
  await prisma.$disconnect()
}
