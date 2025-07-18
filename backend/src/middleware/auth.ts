import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
    user?: any
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' })
    }
    const token = authHeader.replace('Bearer ', '')
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!)
        req.user = decoded
        next()
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' })
    }
} 