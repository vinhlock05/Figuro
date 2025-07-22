import { Resend } from 'resend'

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'yourname@resend.dev'

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null

export async function sendResetPasswordEmail(email: string, token: string) {

    if (!resend) {
        console.log(`[EMAIL] ⚠️  No Resend API key configured. Email not sent.`)
        console.log(`[EMAIL] 💡 To enable real email sending, add RESEND_API_KEY to your .env file`)
        return
    }

    try {
        await resend.emails.send({
            from: FROM_EMAIL,
            to: email,
            subject: 'Reset your password - Figuro',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4F46E5;">Reset Your Password</h2>
                    <p>You requested to reset your password. Click the button below to proceed:</p>
                    <a href="http://localhost:5173?action=reset&token=${token}" 
                       style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                        Reset Password
                    </a>
                    <p style="margin-top: 20px; color: #6B7280; font-size: 14px;">
                        If you didn't request this, you can safely ignore this email.
                    </p>
                </div>
            `
        })
        console.log(`[EMAIL] ✅ Password reset email sent successfully to ${email}`)
    } catch (error) {
        console.error(`[EMAIL] ❌ Failed to send password reset email:`, error)
    }
}

export async function sendVerificationEmail(email: string, otp: string) {
    console.log(`[EMAIL] ✅ Email Verification Request`)
    console.log(`[EMAIL] 📧 To: ${email}`)
    console.log(`[EMAIL] 🔢 OTP Code: ${otp}`)

    if (!resend) {
        console.log(`[EMAIL] ⚠️  No Resend API key configured. Email not sent.`)
        console.log(`[EMAIL] 💡 To enable real email sending, add RESEND_API_KEY to your .env file`)
        console.log(`[EMAIL] 🧪 For testing, use OTP code: ${otp}`)
        return
    }

    try {
        await resend.emails.send({
            from: FROM_EMAIL,
            to: email,
            subject: 'Your verification code - Figuro',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4F46E5;">Your Verification Code</h2>
                    <p>Please use the following code to verify your email address:</p>
                    <div style="background-color: #F3F4F6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                        <h1 style="color: #4F46E5; font-size: 32px; font-weight: bold; letter-spacing: 4px; margin: 0;">
                            ${otp}
                        </h1>
                    </div>
                    <p style="color: #6B7280; font-size: 14px;">
                        This code will expire in 10 minutes.
                    </p>
                </div>
            `
        })
        console.log(`[EMAIL] ✅ Verification OTP sent successfully to ${email}`)
    } catch (error) {
        console.error(`[EMAIL] ❌ Failed to send verification OTP:`, error)
    }
} 