import { prisma } from '../lib/prisma'

export const getCart = async (userId: number) => {
    let cart = await prisma.cart.findUnique({
        where: { userId },
        include: {
            items: {
                include: {
                    product: { include: { customizationOptions: true, category: true } }
                }
            }
        }
    })
    if (!cart) {
        await prisma.cart.create({ data: { userId } })
        cart = await prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: { include: { customizationOptions: true, category: true } }
                    }
                }
            }
        })
    }
    return cart
}

export const addItem = async (userId: number, productId: number, quantity: number, customizations?: any) => {
    let cart = await prisma.cart.findUnique({ where: { userId } })
    if (!cart) {
        cart = await prisma.cart.create({ data: { userId } })
    }
    return prisma.cartItem.create({
        data: {
            cartId: cart.id,
            productId,
            quantity,
            customizations,
            price: 0 // You may want to calculate price with customizations
        }
    })
}

export const updateItem = async (userId: number, cartItemId: number, quantity: number, customizations?: any) => {
    const cart = await prisma.cart.findUnique({ where: { userId } })
    if (!cart) throw new Error('Cart not found')
    const item = await prisma.cartItem.findUnique({ where: { id: cartItemId } })
    if (!item || item.cartId !== cart.id) throw new Error('Item not found in your cart')
    return prisma.cartItem.update({
        where: { id: cartItemId },
        data: { quantity, customizations }
    })
}

export const removeItem = async (userId: number, cartItemId: number) => {
    const cart = await prisma.cart.findUnique({ where: { userId } })
    if (!cart) throw new Error('Cart not found')
    const item = await prisma.cartItem.findUnique({ where: { id: cartItemId } })
    if (!item || item.cartId !== cart.id) throw new Error('Item not found in your cart')
    return prisma.cartItem.delete({ where: { id: cartItemId } })
}

export const clearCart = async (userId: number) => {
    const cart = await prisma.cart.findUnique({ where: { userId } })
    if (!cart) throw new Error('Cart not found')
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })
    return { message: 'Cart cleared' }
} 