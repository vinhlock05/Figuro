import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'
import { sendResetPasswordEmail, sendVerificationEmail } from '../utils/notify'
import crypto from 'crypto'

export const registerUser = async (name: string, email: string, password: string, phone?: string) => {
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) throw new Error('User already exists')
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
        data: {
            name,
            email,
            passwordHash: hashedPassword,
            phone,
            role: 'customer'
        }
    })
    return user
}

export const loginUser = async (email: string, password: string) => {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) throw new Error('Invalid credentials')
    const isValidPassword = await bcrypt.compare(password, user.passwordHash)
    if (!isValidPassword) throw new Error('Invalid credentials')
    return user
}

export const generateToken = (user: any, expiresIn?: string) => {
    const exp = expiresIn || process.env.JWT_EXPIRES_IN || '2h'
    const options: jwt.SignOptions = { expiresIn: exp as any }
    return jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET!,
        options
    )
}

export const getUserProfile = async (userId: number) => {
    return prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            emailVerified: true,
            createdAt: true
        }
    })
}

export const requestPasswordReset = async (email: string) => {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) throw new Error('User not found')
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    await prisma.user.update({ where: { email }, data: { resetToken: token, resetTokenExpires: expires } })
    await sendResetPasswordEmail(email, token)
    return true
}

export const resetPassword = async (token: string, newPassword: string) => {
    const user = await prisma.user.findFirst({ where: { resetToken: token, resetTokenExpires: { gt: new Date() } } })
    if (!user) throw new Error('Invalid or expired token')
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: hashedPassword, resetToken: null, resetTokenExpires: null } })
    return true
}

export const sendVerification = async (user: any) => {
    const token = crypto.randomBytes(32).toString('hex')
    await prisma.user.update({ where: { id: user.id }, data: { verificationToken: token } })
    await sendVerificationEmail(user.email, token)
}

export const verifyEmail = async (token: string) => {
    const user = await prisma.user.findFirst({ where: { verificationToken: token } })
    if (!user) throw new Error('Invalid verification token')
    await prisma.user.update({ where: { id: user.id }, data: { emailVerified: true, verificationToken: null } })
    return true
} 