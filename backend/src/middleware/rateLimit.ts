import { Request, Response, NextFunction } from 'express'
import { AuthRequest } from './auth'
import Redis from 'ioredis'
import { sendError } from '../utils/response'

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

interface RateLimitConfig {
    windowMs: number // Time window in milliseconds
    maxRequests: number // Maximum requests per window
    keyGenerator?: (req: AuthRequest) => string // Custom key generator
    message?: string // Custom error message
}

// Rate limit configurations for different endpoints
const rateLimitConfigs: Record<string, RateLimitConfig> = {
    // Auth endpoints - stricter limits to prevent brute force
    '/api/auth/login': {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 10, // 5 attempts per 15 minutes
        message: 'Too many login attempts. Please try again in 15 minutes.'
    },
    '/api/auth/register': {
        windowMs: 60 * 60 * 1000, // 1 hour
        maxRequests: 10, // 3 registrations per hour
        message: 'Too many registration attempts. Please try again in 1 hour.'
    },
    '/api/auth/request-reset': {
        windowMs: 60 * 60 * 1000, // 1 hour
        maxRequests: 10, // 3 password reset requests per hour
        message: 'Too many password reset requests. Please try again in 1 hour.'
    },
    // Admin endpoints - very strict limits
    '/api/admin': {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 50, // 30 requests per minute
        message: 'Admin rate limit exceeded. Please slow down.'
    },
    // Default limits for other endpoints
    'default': {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 100, // 100 requests per minute
        message: 'Rate limit exceeded. Please try again later.'
    }
}

// Generate rate limit key based on IP and user
const generateKey = (req: AuthRequest, config: RateLimitConfig): string => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown'
    const userId = req.user?.userId || 'guest'
    const endpoint = req.originalUrl.split('?')[0] // Remove query params

    // Different limits for different user types
    if (req.user?.role === 'admin') {
        return `rate_limit:admin:${ip}:${userId}:${endpoint}`
    }

    return `rate_limit:${ip}:${userId}:${endpoint}`
}

// Get rate limit configuration for the request
const getRateLimitConfig = (req: AuthRequest): RateLimitConfig => {
    const endpoint = req.originalUrl.split('?')[0]

    // Check for exact endpoint match first
    if (rateLimitConfigs[endpoint]) {
        return rateLimitConfigs[endpoint]
    }

    // Check for admin endpoints
    if (endpoint.startsWith('/api/admin')) {
        return rateLimitConfigs['/api/admin']
    }

    // Return default configuration
    return rateLimitConfigs['default']
}

export const rateLimit = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const config = getRateLimitConfig(req)
        const key = generateKey(req, config)

        // Get current request count
        const currentCount = await redis.get(key)
        const count = currentCount ? parseInt(currentCount) : 0

        // Check if limit exceeded
        if (count >= config.maxRequests) {
            const resetTime = await redis.ttl(key)
            const retryAfter = Math.ceil(resetTime / 60) // Convert to minutes

            res.setHeader('X-RateLimit-Limit', config.maxRequests.toString())
            res.setHeader('X-RateLimit-Remaining', '0')
            res.setHeader('X-RateLimit-Reset', new Date(Date.now() + resetTime * 1000).toISOString())
            res.setHeader('Retry-After', retryAfter.toString())

            return sendError(res, 429, config.message || 'Rate limit exceeded', {
                retryAfter: retryAfter,
                limit: config.maxRequests,
                windowMs: config.windowMs
            })
        }

        // Increment request count
        await redis.multi()
            .incr(key)
            .expire(key, Math.ceil(config.windowMs / 1000))
            .exec()

        // Set rate limit headers
        res.setHeader('X-RateLimit-Limit', config.maxRequests.toString())
        res.setHeader('X-RateLimit-Remaining', (config.maxRequests - count - 1).toString())
        res.setHeader('X-RateLimit-Reset', new Date(Date.now() + config.windowMs).toISOString())

        next()
    } catch (error) {
        console.error('Rate limiting error:', error)
        // If Redis is down, allow the request to proceed
        next()
    }
}

// Specific rate limiters for different endpoint types
export const authRateLimit = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const endpoint = req.originalUrl.split('?')[0]
    const config = rateLimitConfigs[endpoint] || rateLimitConfigs['default']

    try {
        const ip = req.ip || req.connection.remoteAddress || 'unknown'
        const key = `rate_limit:auth:${ip}:${endpoint}`

        const currentCount = await redis.get(key)
        const count = currentCount ? parseInt(currentCount) : 0

        if (count >= config.maxRequests) {
            const resetTime = await redis.ttl(key)
            const retryAfter = Math.ceil(resetTime / 60)

            return sendError(res, 429, config.message || 'Authentication rate limit exceeded', {
                retryAfter: retryAfter,
                limit: config.maxRequests
            })
        }

        await redis.multi()
            .incr(key)
            .expire(key, Math.ceil(config.windowMs / 1000))
            .exec()

        next()
    } catch (error) {
        console.error('Auth rate limiting error:', error)
        next()
    }
}

export const adminRateLimit = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const config = rateLimitConfigs['/api/admin']

    try {
        const ip = req.ip || req.connection.remoteAddress || 'unknown'
        const userId = req.user?.userId || 'unknown'
        const key = `rate_limit:admin:${ip}:${userId}`

        const currentCount = await redis.get(key)
        const count = currentCount ? parseInt(currentCount) : 0

        if (count >= config.maxRequests) {
            const resetTime = await redis.ttl(key)
            const retryAfter = Math.ceil(resetTime / 60)

            return sendError(res, 429, config.message || 'Admin rate limit exceeded', {
                retryAfter: retryAfter,
                limit: config.maxRequests
            })
        }

        await redis.multi()
            .incr(key)
            .expire(key, Math.ceil(config.windowMs / 1000))
            .exec()

        next()
    } catch (error) {
        console.error('Admin rate limiting error:', error)
        next()
    }
} 