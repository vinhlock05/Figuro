import { PrismaClient } from '@prisma/client'

declare global {
    var __prisma: PrismaClient | undefined
}

export const prisma = globalThis.__prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
    globalThis.__prisma = prisma
}

// Graceful shutdown
process.on('beforeExit', async () => {
    await prisma.$disconnect()
})

process.on('SIGINT', async () => {
    await prisma.$disconnect()
    process.exit(0)
})

process.on('SIGTERM', async () => {
    await prisma.$disconnect()
    process.exit(0)
}) 