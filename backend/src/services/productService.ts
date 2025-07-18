import { prisma } from '../lib/prisma'

export const listProducts = async (query: any) => {
    const { page = 1, limit = 10, category, search, minPrice, maxPrice, customizable } = query
    const skip = (Number(page) - 1) * Number(limit)
    const take = Number(limit)
    const where: any = {}
    if (category) {
        where.category = { name: { contains: String(category), mode: 'insensitive' } }
    }
    if (search) {
        where.OR = [
            { name: { contains: String(search), mode: 'insensitive' } },
            { description: { contains: String(search), mode: 'insensitive' } }
        ]
    }
    if (minPrice || maxPrice) {
        where.price = {}
        if (minPrice) where.price.gte = Number(minPrice)
        if (maxPrice) where.price.lte = Number(maxPrice)
    }
    if (customizable !== undefined) {
        where.isCustomizable = customizable === 'true'
    }
    const products = await prisma.product.findMany({
        where,
        include: { category: true, customizationOptions: true },
        skip,
        take,
        orderBy: { createdAt: 'desc' }
    })
    const total = await prisma.product.count({ where })
    return { products, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } }
}

export const getProductBySlug = async (slug: string) => {
    return prisma.product.findUnique({
        where: { slug },
        include: {
            category: true,
            customizationOptions: { orderBy: [{ optionType: 'asc' }, { optionValue: 'asc' }] }
        }
    })
}

export const getAllCategories = async () => {
    return prisma.category.findMany({
        include: { _count: { select: { products: true } } }
    })
}

export const getProductsByCategory = async (categorySlug: string, page = 1, limit = 10) => {
    const skip = (Number(page) - 1) * Number(limit)
    const take = Number(limit)
    const category = await prisma.category.findFirst({
        where: { name: { contains: categorySlug, mode: 'insensitive' } }
    })
    if (!category) return null
    const products = await prisma.product.findMany({
        where: { categoryId: category.id },
        include: { category: true, customizationOptions: true },
        skip,
        take,
        orderBy: { createdAt: 'desc' }
    })
    const total = await prisma.product.count({ where: { categoryId: category.id } })
    return { category, products, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } }
} 