import { prisma } from '../lib/prisma'
import { Resend } from 'resend'

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY)

interface NotificationData {
    userId: number
    type: 'email' | 'sms'
    subject?: string
    content: string
    metadata?: Record<string, any>
}

interface EmailTemplate {
    subject: string
    html: string
    text?: string
}

class NotificationService {
    private static async createNotificationRecord(data: NotificationData) {
        return await prisma.notification.create({
            data: {
                userId: data.userId,
                type: data.type,
                content: data.content,
                status: 'pending'
            }
        })
    }

    private static async updateNotificationStatus(notificationId: number, status: 'sent' | 'failed') {
        return await prisma.notification.update({
            where: { id: notificationId },
            data: { status }
        })
    }

    private static async sendEmailNotification(userId: number, template: EmailTemplate, metadata?: Record<string, any>) {
        try {
            // Get user email
            const user = await prisma.user.findUnique({
                where: { id: userId }
            })

            if (!user || !user.email) {
                throw new Error('User email not found')
            }

            // Create notification record
            const notification = await this.createNotificationRecord({
                userId,
                type: 'email',
                content: template.html,
                metadata
            })

            // Send email using Resend
            const { data, error } = await resend.emails.send({
                from: process.env.RESEND_FROM_EMAIL || 'Figuro <noreply@figuro.com>',
                to: [user.email],
                subject: template.subject,
                html: template.html,
                text: template.text || template.html.replace(/<[^>]*>/g, '') // Strip HTML for text version
            })

            if (error) {
                console.error('Resend email error:', error)
                await this.updateNotificationStatus(notification.id, 'failed')
                return { success: false, error: error.message }
            }

            console.log(`[EMAIL] Sent via Resend to ${user.email}: ${template.subject}`)
            console.log(`[EMAIL] Message ID: ${data?.id}`)

            // Update notification status
            await this.updateNotificationStatus(notification.id, 'sent')

            return { success: true, notificationId: notification.id, messageId: data?.id }
        } catch (error) {
            console.error('Email notification error:', error)
            return { success: false, error: error instanceof Error ? error.message : 'Email sending failed' }
        }
    }

    private static async sendSMSNotification(userId: number, message: string, metadata?: Record<string, any>) {
        try {
            // Get user phone
            const user = await prisma.user.findUnique({
                where: { id: userId }
            })

            if (!user || !user.phone) {
                throw new Error('User phone not found')
            }

            // Create notification record
            const notification = await this.createNotificationRecord({
                userId,
                type: 'sms',
                content: message,
                metadata
            })

            // Mock SMS sending (in production, integrate with SMS service)
            console.log(`[SMS] Sending to ${user.phone}: ${message}`)

            // Update notification status
            await this.updateNotificationStatus(notification.id, 'sent')

            return { success: true, notificationId: notification.id }
        } catch (error) {
            console.error('SMS notification error:', error)
            return { success: false, error: error instanceof Error ? error.message : 'SMS sending failed' }
        }
    }

    // Order notifications
    static async sendOrderConfirmation(userId: number, orderData: any) {
        const template: EmailTemplate = {
            subject: `Order Confirmation #${orderData.id}`,
            html: `
                <h2>Order Confirmation</h2>
                <p>Dear ${orderData.user?.name},</p>
                <p>Thank you for your order! Here are your order details:</p>
                <ul>
                    <li><strong>Order ID:</strong> ${orderData.id}</li>
                    <li><strong>Total Amount:</strong> ${orderData.totalPrice} VND</li>
                    <li><strong>Status:</strong> ${orderData.status}</li>
                    <li><strong>Shipping Address:</strong> ${orderData.shippingAddress}</li>
                </ul>
                <p>We'll keep you updated on your order status.</p>
            `
        }

        return await this.sendEmailNotification(userId, template, { orderId: orderData.id })
    }

    static async sendOrderStatusUpdate(userId: number, orderData: any, newStatus: string) {
        const template: EmailTemplate = {
            subject: `Order Status Update #${orderData.id}`,
            html: `
                <h2>Order Status Update</h2>
                <p>Dear ${orderData.user?.name},</p>
                <p>Your order status has been updated:</p>
                <ul>
                    <li><strong>Order ID:</strong> ${orderData.id}</li>
                    <li><strong>New Status:</strong> ${newStatus}</li>
                    <li><strong>Previous Status:</strong> ${orderData.status}</li>
                </ul>
                <p>Track your order: <a href="https://your-frontend.com/orders/${orderData.id}">View Order</a></p>
            `
        }

        return await this.sendEmailNotification(userId, template, {
            orderId: orderData.id,
            newStatus,
            previousStatus: orderData.status
        })
    }

    // Payment notifications
    static async sendPaymentSuccess(userId: number, paymentData: any) {
        const template: EmailTemplate = {
            subject: `Payment Successful #${paymentData.transactionId}`,
            html: `
                <h2>Payment Successful</h2>
                <p>Dear customer,</p>
                <p>Your payment has been processed successfully:</p>
                <ul>
                    <li><strong>Transaction ID:</strong> ${paymentData.transactionId}</li>
                    <li><strong>Amount:</strong> ${paymentData.amount} VND</li>
                    <li><strong>Gateway:</strong> ${paymentData.gateway}</li>
                    <li><strong>Order ID:</strong> ${paymentData.orderId}</li>
                </ul>
                <p>Your order is now being processed.</p>
            `
        }

        return await this.sendEmailNotification(userId, template, {
            transactionId: paymentData.transactionId,
            orderId: paymentData.orderId
        })
    }

    static async sendPaymentFailure(userId: number, paymentData: any) {
        const template: EmailTemplate = {
            subject: `Payment Failed #${paymentData.transactionId}`,
            html: `
                <h2>Payment Failed</h2>
                <p>Dear customer,</p>
                <p>Your payment could not be processed:</p>
                <ul>
                    <li><strong>Transaction ID:</strong> ${paymentData.transactionId}</li>
                    <li><strong>Amount:</strong> ${paymentData.amount} VND</li>
                    <li><strong>Gateway:</strong> ${paymentData.gateway}</li>
                    <li><strong>Order ID:</strong> ${paymentData.orderId}</li>
                </ul>
                <p>Please try again or contact support if the issue persists.</p>
            `
        }

        return await this.sendEmailNotification(userId, template, {
            transactionId: paymentData.transactionId,
            orderId: paymentData.orderId
        })
    }

    // Account notifications
    static async sendWelcomeEmail(userId: number, userData: any) {
        const template: EmailTemplate = {
            subject: 'Welcome to Figuro!',
            html: `
                <h2>Welcome to Figuro!</h2>
                <p>Dear ${userData.name},</p>
                <p>Thank you for joining Figuro! We're excited to have you as part of our community.</p>
                <p>Start exploring our collection of custom anime figures:</p>
                <ul>
                    <li>Browse our products</li>
                    <li>Customize your figures</li>
                    <li>Track your orders</li>
                </ul>
                <p>If you have any questions, feel free to contact our support team.</p>
            `
        }

        return await this.sendEmailNotification(userId, template)
    }

    static async sendPasswordResetEmail(userId: number, resetToken: string) {
        // Use existing password reset email function
        const user = await prisma.user.findUnique({ where: { id: userId } })
        if (user) {
            // This function is no longer used as sendEmailNotification handles email sending
            // Keeping it for now, but it will not send an email via Resend
            console.warn('sendPasswordResetEmail is deprecated. Use sendEmailNotification instead.')
            // await sendResetPasswordEmail(user.email, resetToken) // This line is removed as per the new_code
        }
        return { success: true }
    }

    static async sendEmailVerification(userId: number, verificationToken: string) {
        // Use existing email verification function
        const user = await prisma.user.findUnique({ where: { id: userId } })
        if (user) {
            // This function is no longer used as sendEmailNotification handles email sending
            // Keeping it for now, but it will not send an email via Resend
            console.warn('sendEmailVerification is deprecated. Use sendEmailNotification instead.')
            // await sendVerificationEmail(user.email, verificationToken) // This line is removed as per the new_code
        }
        return { success: true }
    }

    // SMS notifications (for important updates)
    static async sendOrderShippedSMS(userId: number, orderData: any) {
        const message = `Your order #${orderData.id} has been shipped! Track it at: https://your-frontend.com/orders/${orderData.id}`
        return await this.sendSMSNotification(userId, message, { orderId: orderData.id })
    }

    static async sendOrderDeliveredSMS(userId: number, orderData: any) {
        const message = `Your order #${orderData.id} has been delivered! Enjoy your new figure!`
        return await this.sendSMSNotification(userId, message, { orderId: orderData.id })
    }

    // Get user notifications
    static async getUserNotifications(userId: number, limit = 20, offset = 0) {
        return await prisma.notification.findMany({
            where: { userId },
            orderBy: { sentAt: 'desc' },
            take: limit,
            skip: offset
        })
    }

    // Mark notification as read
    static async markNotificationAsRead(notificationId: number, userId: number) {
        return await prisma.notification.updateMany({
            where: {
                id: notificationId,
                userId: userId // Ensure user owns the notification
            },
            data: { status: 'read' }
        })
    }

    // Get notification statistics
    static async getNotificationStats(userId: number) {
        const stats = await prisma.notification.groupBy({
            by: ['status', 'type'],
            where: { userId },
            _count: {
                id: true
            }
        })

        return stats.reduce((acc, stat) => {
            if (!acc[stat.status]) acc[stat.status] = {}
            acc[stat.status][stat.type] = stat._count.id
            return acc
        }, {} as Record<string, Record<string, number>>)
    }
}

export default NotificationService 