import { prisma } from '../lib/prisma'
import { Prisma } from '@prisma/client'

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
        include: { items: true, statusHistory: true }
    })

    // Clear cart
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })

    return order
}

export const getUserOrders = async (userId: number) => {
    return prisma.order.findMany({
        where: { userId },
        include: {
            items: { include: { product: true } },
            statusHistory: true
        },
        orderBy: { createdAt: 'desc' }
    })
}

export const getOrderDetails = async (userId: number, orderId: number) => {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            items: { include: { product: true } },
            statusHistory: true
        }
    })
    if (!order || order.userId !== userId) throw new Error('Order not found')
    return order
} 