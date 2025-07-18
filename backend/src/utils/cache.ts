import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

export async function setCache(key: string, value: any, ttlSeconds: number) {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds)
}

export async function getCache(key: string) {
    const data = await redis.get(key)
    if (!data) return undefined
    try {
        return JSON.parse(data)
    } catch {
        return data
    }
}

export async function clearCache(key?: string) {
    if (key) await redis.del(key)
    else await redis.flushall()
} 