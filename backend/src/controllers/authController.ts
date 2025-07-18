import { Request, Response } from 'express'
import * as authService from '../services/authService'
import jwt from 'jsonwebtoken'
import { sendResponse, sendError } from '../utils/response'
import { AuthRequest } from '../middleware/auth'

export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password, phone } = req.body
        if (!name || !email || !password) {
            return sendError(res, 400, 'Name, email, and password are required')
        }
        const user = await authService.registerUser(name, email, password, phone)
        const token = authService.generateToken(user)
        return sendResponse(res, 201, 'User registered successfully', {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                emailVerified: user.emailVerified,
                createdAt: user.createdAt
            },
            token
        })
    } catch (error: any) {
        return sendError(res, 400, error.message || 'Registration failed')
    }
}

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password, rememberMe } = req.body
        if (!email || !password) {
            return sendError(res, 400, 'Email and password are required')
        }
        const user = await authService.loginUser(email, password)
        const token = authService.generateToken(
            user,
            rememberMe ? process.env.JWT_REMEMBER_ME_EXPIRES_IN : undefined
        )
        return sendResponse(res, 200, 'Login successful', {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                emailVerified: user.emailVerified,
                createdAt: user.createdAt
            },
            token
        })
    } catch (error: any) {
        return sendError(res, 401, error.message || 'Login failed')
    }
}

export const profile = async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '')
        if (!token) {
            return sendError(res, 401, 'No token provided')
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
        const user = await authService.getUserProfile(decoded.userId)
        if (!user) {
            return sendError(res, 404, 'User not found')
        }
        return sendResponse(res, 200, 'User profile fetched', { user })
    } catch (error: any) {
        return sendError(res, 401, error.message || 'Invalid token')
    }
}

export const requestPasswordReset = async (req: Request, res: Response) => {
    try {
        const { email } = req.body
        if (!email) return sendError(res, 400, 'Email is required')
        await authService.requestPasswordReset(email)
        return sendResponse(res, 200, 'Password reset email sent')
    } catch (error: any) {
        return sendError(res, 400, error.message || 'Failed to send reset email')
    }
}

export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { token, newPassword } = req.body
        if (!token || !newPassword) return sendError(res, 400, 'Token and new password are required')
        await authService.resetPassword(token, newPassword)
        return sendResponse(res, 200, 'Password has been reset')
    } catch (error: any) {
        return sendError(res, 400, error.message || 'Failed to reset password')
    }
}

export const sendVerification = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user
        if (!user) return sendError(res, 401, 'Unauthorized')
        await authService.sendVerification(user)
        return sendResponse(res, 200, 'Verification email sent')
    } catch (error: any) {
        return sendError(res, 400, error.message || 'Failed to send verification email')
    }
}

export const verifyEmail = async (req: Request, res: Response) => {
    try {
        const { token } = req.body
        if (!token) return sendError(res, 400, 'Token is required')
        await authService.verifyEmail(token)
        return sendResponse(res, 200, 'Email verified')
    } catch (error: any) {
        return sendError(res, 400, error.message || 'Failed to verify email')
    }
} 