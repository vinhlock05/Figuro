import { prisma } from '../lib/prisma'

// Utility function to calculate dynamic price with customizations
const calculateDynamicPrice = async (productId: number, quantity: number, customizations?: any) => {
    const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
            customizationOptions: true
        }
    })

    if (!product) {
        throw new Error('Product not found')
    }

    // Calculate base price
    let totalPrice = Number(product.price)

    // Calculate price adjustments from customizations
    if (customizations && Array.isArray(customizations)) {
        for (const customization of customizations) {
            const option = product.customizationOptions.find(
                opt => opt.optionType === customization.type &&
                    opt.optionValue === customization.value
            )

            if (option) {
                totalPrice += Number(option.priceDelta)
            }
        }
    }

    // Calculate total price for the quantity
    return totalPrice * quantity
}

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

    // Calculate dynamic price with customizations
    const finalPrice = await calculateDynamicPrice(productId, quantity, customizations)

    return prisma.cartItem.create({
        data: {
            cartId: cart.id,
            productId,
            quantity,
            customizations,
            price: finalPrice
        }
    })
}

export const updateItem = async (userId: number, cartItemId: number, quantity: number, customizations?: any) => {
    const cart = await prisma.cart.findUnique({ where: { userId } })
    if (!cart) throw new Error('Cart not found')
    const item = await prisma.cartItem.findUnique({ where: { id: cartItemId } })
    if (!item || item.cartId !== cart.id) throw new Error('Item not found in your cart')

    // Calculate dynamic price with customizations
    const finalPrice = await calculateDynamicPrice(item.productId, quantity, customizations)

    return prisma.cartItem.update({
        where: { id: cartItemId },
        data: {
            quantity,
            customizations,
            price: finalPrice
        }
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