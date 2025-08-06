import { prisma } from '../lib/prisma'
import { sendOrderStatusUpdateEmail } from '../utils/notify'

interface OrderStatusUpdate {
    orderId: number
    newStatus: string
    description?: string
    adminId?: number
}

interface TrackingInfo {
    orderId: number
    currentStatus: string
    statusHistory: any[]
    estimatedDelivery?: Date
    trackingNumber?: string
    shippingProvider?: string
}

class OrderTrackingService {
    // Valid order statuses
    private static readonly VALID_STATUSES = [
        'pending',
        'confirmed',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
        'refunded'
    ]

    // Status flow validation
    private static readonly STATUS_FLOW: Record<string, string[]> = {
        'pending': ['confirmed', 'cancelled'],
        'confirmed': ['processing', 'cancelled'],
        'processing': ['shipped', 'cancelled'],
        'shipped': ['delivered', 'cancelled'],
        'delivered': ['refunded'],
        'cancelled': [],
        'refunded': []
    }

    // Update order status with validation
    static async updateOrderStatus(update: OrderStatusUpdate): Promise<boolean> {
        try {
            const { orderId, newStatus, description, adminId } = update

            // Validate status
            if (!this.VALID_STATUSES.includes(newStatus)) {
                throw new Error(`Invalid order status: ${newStatus}`)
            }

            // Get current order
            const order = await prisma.order.findUnique({
                where: { id: orderId },
                include: {
                    user: true,
                    statusHistory: {
                        orderBy: { updatedAt: 'desc' },
                        take: 1
                    }
                }
            })

            if (!order) {
                throw new Error('Order not found')
            }

            const currentStatus = order.statusHistory[0]?.status || order.status

            // Validate status transition
            if (!this.isValidStatusTransition(currentStatus, newStatus)) {
                throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`)
            }

            // Update order status
            await prisma.order.update({
                where: { id: orderId },
                data: { status: newStatus }
            })

            // Add to status history
            await prisma.orderStatusHistory.create({
                data: {
                    orderId,
                    status: newStatus
                }
            })

            // Send notification to user if userId exists
            if (order.userId) {
                await this.sendStatusUpdateNotification(order.userId, order, newStatus, description)
            }

            // Log admin action if provided
            if (adminId) {
                console.log(`[ADMIN] Order ${orderId} status updated to ${newStatus} by admin ${adminId}`)
            }

            return true
        } catch (error) {
            console.error('Order status update error:', error)
            return false
        }
    }

    // Validate status transition
    private static isValidStatusTransition(currentStatus: string, newStatus: string): boolean {
        const allowedTransitions = this.STATUS_FLOW[currentStatus] || []
        return allowedTransitions.includes(newStatus)
    }

    // Get order tracking information
    static async getOrderTracking(orderId: number): Promise<TrackingInfo | null> {
        try {
            const order = await prisma.order.findUnique({
                where: { id: orderId },
                include: {
                    statusHistory: { orderBy: { updatedAt: 'desc' } }
                }
            })

            if (!order) return null

            const currentStatus = order.statusHistory[0]?.status || order.status
            const estimatedDelivery = this.calculateEstimatedDelivery(order.createdAt, currentStatus)
            const trackingNumber = this.generateTrackingNumber(order.id)

            return {
                orderId: order.id,
                currentStatus,
                statusHistory: order.statusHistory,
                estimatedDelivery,
                trackingNumber,
                shippingProvider: 'Vietnam Post' // Default shipping provider
            }
        } catch (error) {
            console.error('Get order tracking error:', error)
            return null
        }
    }

    // Calculate estimated delivery date
    private static calculateEstimatedDelivery(orderDate: Date, currentStatus: string): Date | undefined {
        const deliveryTimes: Record<string, number> = {
            'pending': 7, // 7 days from order
            'confirmed': 6, // 6 days from order
            'processing': 4, // 4 days from order
            'shipped': 2, // 2 days from shipping
            'delivered': 0, // Already delivered
            'cancelled': 0, // No delivery
            'refunded': 0 // No delivery
        }

        const daysToAdd = deliveryTimes[currentStatus] || 0
        if (daysToAdd === 0) return undefined

        const estimatedDate = new Date(orderDate)
        estimatedDate.setDate(estimatedDate.getDate() + daysToAdd)
        return estimatedDate
    }

    // Generate tracking number
    private static generateTrackingNumber(orderId: number): string {
        const prefix = 'VN'
        const timestamp = Date.now().toString().slice(-8)
        const orderIdStr = orderId.toString().padStart(6, '0')

        return `${prefix}${timestamp}${orderIdStr}`
    }

    // Send status update notification
    private static async sendStatusUpdateNotification(
        userId: number,
        order: any,
        newStatus: string,
        description?: string
    ) {
        try {
            // Get user email
            const user = await prisma.user.findUnique({
                where: { id: userId }
            })

            if (user?.email) {
                // Send email notification
                await sendOrderStatusUpdateEmail(user.email, order, newStatus, description)
            }

            // TODO: Implement SMS notifications for important status updates
            // if (newStatus === 'shipped') {
            //     await sendOrderShippedSMS(userId, order)
            // } else if (newStatus === 'delivered') {
            //     await sendOrderDeliveredSMS(userId, order)
            // }
        } catch (error) {
            console.error('Status update notification error:', error)
        }
    }

    // Get order status history
    static async getOrderStatusHistory(orderId: number) {
        try {
            return await prisma.orderStatusHistory.findMany({
                where: { orderId },
                orderBy: { updatedAt: 'desc' }
            })
        } catch (error) {
            console.error('Get order status history error:', error)
            return []
        }
    }

    // Bulk update order statuses (for admin)
    static async bulkUpdateOrderStatuses(updates: OrderStatusUpdate[]): Promise<{ success: number, failed: number }> {
        let success = 0
        let failed = 0

        for (const update of updates) {
            const result = await this.updateOrderStatus(update)
            if (result) {
                success++
            } else {
                failed++
            }
        }

        return { success, failed }
    }

    // Get orders by status
    static async getOrdersByStatus(status: string, limit = 50, offset = 0) {
        try {
            return await prisma.order.findMany({
                where: { status },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                    statusHistory: {
                        orderBy: { updatedAt: 'desc' },
                        take: 1
                    }
                },
                orderBy: { updatedAt: 'desc' },
                take: limit,
                skip: offset
            })
        } catch (error) {
            console.error('Get orders by status error:', error)
            return []
        }
    }

    // Get order statistics
    static async getOrderStatistics() {
        try {
            const stats = await prisma.order.groupBy({
                by: ['status'],
                _count: {
                    id: true
                }
            })

            return stats.reduce((acc, stat) => {
                acc[stat.status] = stat._count.id
                return acc
            }, {} as Record<string, number>)
        } catch (error) {
            console.error('Get order statistics error:', error)
            return {}
        }
    }

    // Cancel order
    static async cancelOrder(orderId: number, reason?: string): Promise<boolean> {
        try {
            const order = await prisma.order.findUnique({
                where: { id: orderId },
                include: { user: true }
            })

            if (!order) {
                throw new Error('Order not found')
            }

            if (order.status === 'delivered' || order.status === 'cancelled') {
                throw new Error('Cannot cancel order in current status')
            }

            // Update order status to cancelled
            await this.updateOrderStatus({
                orderId,
                newStatus: 'cancelled',
                description: reason || 'Order cancelled by user'
            })

            // Send cancellation notification if userId exists
            if (order.userId) {
                // Email notification is handled in updateOrderStatus
                console.log(`[ORDER] Order ${orderId} cancelled with reason: ${reason}`)
            }

            return true
        } catch (error) {
            console.error('Cancel order error:', error)
            return false
        }
    }

    // Get tracking number for order
    static async getTrackingNumber(orderId: number): Promise<string | null> {
        try {
            const order = await prisma.order.findUnique({
                where: { id: orderId }
            })

            if (!order) {
                return null
            }

            return this.generateTrackingNumber(order.id)
        } catch (error) {
            console.error('Get tracking number error:', error)
            return null
        }
    }
}

export default OrderTrackingService 