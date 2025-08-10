import { prisma } from '../lib/prisma'
import { Prisma } from '@prisma/client'
import { sendOrderConfirmationEmail } from '../utils/notify'

export const placeOrder = async (userId: number, shippingAddress: string, paymentMethod: string) => {
    // Get user's cart
    const cart = await prisma.cart.findUnique({
        where: { userId },
        include: { items: true }
    })
    if (!cart || !cart.items.length) throw new Error('Cart is empty')

    // Calculate total price
    const totalPrice = cart.items.reduce((sum: number, item: typeof cart.items[0]) => sum + Number(item.price) * item.quantity, 0)

    // Create order
    const order = await prisma.order.create({
        data: {
            userId,
            status: 'pending',
            totalPrice,
            shippingAddress,
            paymentMethod,
            items: {
                create: cart.items.map((item: typeof cart.items[0]) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    customizations: item.customizations,
                    price: item.price
                })) as any
            },
            statusHistory: {
                create: { status: 'pending' }
            }
        },
        include: {
            items: {
                include: { product: true }
            },
            statusHistory: true,
            user: true
        }
    })

    // Clear cart
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })

    // Send order confirmation email
    if (order.user?.email) {
        try {
            await sendOrderConfirmationEmail(order.user.email, order)
        } catch (error) {
            console.error('Failed to send order confirmation email:', error)
            // Don't throw error to avoid breaking the order placement
        }
    }

    return order
}

export const getUserOrders = async (userId: number) => {
    const orders = await prisma.order.findMany({
        where: { userId },
        include: {
            items: { include: { product: true } },
            statusHistory: true,
            payments: { orderBy: { createdAt: 'desc' }, take: 1 }
        },
        orderBy: { createdAt: 'desc' }
    })

    // Attach derived paymentStatus from latest payment (default to 'pending')
    return orders.map((o: any) => ({
        ...o,
        paymentStatus: o.payments && o.payments.length > 0 ? o.payments[0].status : 'pending'
    }))
}

export const getOrderDetails = async (userId: number, orderId: number) => {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            items: { include: { product: true } },
            statusHistory: true,
            payments: { orderBy: { createdAt: 'desc' }, take: 1 }
        }
    })
    if (!order || order.userId !== userId) throw new Error('Order not found')
    return {
        ...order,
        paymentStatus: order.payments && order.payments.length > 0 ? order.payments[0].status : 'pending'
    }
} 