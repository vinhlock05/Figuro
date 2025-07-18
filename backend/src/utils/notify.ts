import { Resend } from 'resend'

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'yourname@resend.dev'

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null

export async function sendResetPasswordEmail(email: string, token: string) {
    if (!resend) {
        console.log(`[EMAIL] Send password reset to ${email}: http://your-frontend/reset-password?token=${token}`)
        return
    }
    await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: 'Reset your password',
        html: `<p>Click <a href="http://your-frontend/reset-password?token=${token}">here</a> to reset your password.</p>`
    })
}

export async function sendVerificationEmail(email: string, token: string) {
    if (!resend) {
        console.log(`[EMAIL] Send verification to ${email}: http://your-frontend/verify-email?token=${token}`)
        return
    }
    await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: 'Verify your email',
        html: `<p>Click <a href="http://your-frontend/verify-email?token=${token}">here</a> to verify your email.</p>`
    })
} 