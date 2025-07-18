import { Response, NextFunction } from 'express'
import { AuthRequest } from './auth'
import { sendError } from '../utils/response'

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== 'admin') {
        return sendError(res, 403, 'Admin access required')
    }
    next()
} 