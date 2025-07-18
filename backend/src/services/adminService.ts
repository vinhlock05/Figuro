import { prisma } from '../lib/prisma'

// Product Management
export const createProduct = async (data: any) => {
    return prisma.product.create({ data })
}
export const updateProduct = async (id: number, data: any) => {
    return prisma.product.update({ where: { id }, data })
}
export const deleteProduct = async (id: number) => {
    return prisma.product.delete({ where: { id } })
}
export const listProducts = async (query: any) => {
    return prisma.product.findMany({ where: query, include: { category: true, customizationOptions: true } })
}

// User Management
export const listUsers = async () => {
    return prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, createdAt: true } })
}
export const updateUserRole = async (id: number, role: string) => {
    return prisma.user.update({ where: { id }, data: { role } })
}
export const deleteUser = async (id: number) => {
    return prisma.user.delete({ where: { id } })
}

// Order Management
export const listOrders = async () => {
    return prisma.order.findMany({ include: { items: { include: { product: true } }, statusHistory: true, user: true } })
}
export const updateOrderStatus = async (orderId: number, status: string) => {
    // Add to status history and update order
    await prisma.orderStatusHistory.create({ data: { orderId, status } })
    return prisma.order.update({ where: { id: orderId }, data: { status } })
}
export const getOrderDetails = async (orderId: number) => {
    return prisma.order.findUnique({ where: { id: orderId }, include: { items: { include: { product: true } }, statusHistory: true, user: true } })
}

export const getDashboardStats = async () => {
    const [userCount, orderCount, totalRevenue, ordersByStatus] = await Promise.all([
        prisma.user.count(),
        prisma.order.count(),
        prisma.order.aggregate({ _sum: { totalPrice: true } }),
        prisma.order.groupBy({
            by: ['status'],
            _count: { status: true }
        })
    ])
    return {
        userCount,
        orderCount,
        totalRevenue: totalRevenue._sum.totalPrice || 0,
        ordersByStatus: ordersByStatus.map((o: { status: string, _count: { status: number } }) => ({ status: o.status, count: o._count.status }))
    }
} 