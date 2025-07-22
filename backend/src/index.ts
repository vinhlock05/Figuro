import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { prisma } from './lib/prisma'
import { registerRoutes } from './routes'
import { responseLogger, errorLogger } from './middleware/logger'
import { rateLimit } from './middleware/rateLimit'
import helmet from 'helmet'
import compression from 'compression'

dotenv.config()
const app = express()

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:61964', 'http://127.0.0.1:5173'],
    credentials: true
}))
app.use(express.json())
app.use(helmet())
app.use(compression())

// Rate limiting - apply globally for security
app.use(rateLimit)

app.use(responseLogger)

// Register all routes
registerRoutes(app)

// Health check
app.get('/', (req, res) => {
    res.json({
        message: 'Figuro Backend is running',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            products: '/api/products',
            cart: '/api/cart',
            order: '/api/order',
            payment: '/api/payment',
            notifications: '/api/notifications',
            orderTracking: '/api/order-tracking',
            admin: '/api/admin',
            health: '/health'
        }
    })
})

app.get('/health', async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`
        res.json({
            status: 'ok',
            database: 'connected',
            timestamp: new Date().toISOString()
        })
    } catch (error) {
        res.status(500).json({
            status: 'error',
            database: 'disconnected',
            error: error instanceof Error ? error.message : 'Unknown error'
        })
    }
})

// Error handling middleware (must be last)
app.use(errorLogger)

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled error:', err)
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
    console.log(`📊 Health check: http://localhost:${PORT}/health`)
    console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`)
    console.log(`🛍️ Product endpoints: http://localhost:${PORT}/api/products`)
    console.log(`🛒 Cart endpoints: http://localhost:${PORT}/api/cart`)
    console.log(`📦 Order endpoints: http://localhost:${PORT}/api/order`)
    console.log(`💳 Payment endpoints: http://localhost:${PORT}/api/payment`)
    console.log(`🔔 Notification endpoints: http://localhost:${PORT}/api/notifications`)
    console.log(`📋 Order tracking: http://localhost:${PORT}/api/order-tracking`)
    console.log(`👑 Admin endpoints: http://localhost:${PORT}/api/admin`)
    console.log(`🛡️ Rate limiting enabled for security`)
})
