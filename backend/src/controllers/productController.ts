import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { sendResponse, sendError } from '../utils/response'

export const list = async (req: Request, res: Response) => {
    try {
        const {
            page = 1,
            limit = 20,
            search,
            categoryId,
            category,
            minPrice,
            maxPrice,
            inStock,
            customizable,
            sort
        } = req.query

        const skip = (Number(page) - 1) * Number(limit)

        // Build where clause
        const where: any = {}

        if (search) {
            where.OR = [
                { name: { contains: search as string, mode: 'insensitive' } },
                { description: { contains: search as string, mode: 'insensitive' } }
            ]
        }

        if (categoryId) {
            where.categoryId = Number(categoryId)
        }

        if (category) {
            where.category = { name: { contains: category as string, mode: 'insensitive' } }
        }

        if (minPrice || maxPrice) {
            where.price = {}
            if (minPrice) where.price.gte = Number(minPrice)
            if (maxPrice) where.price.lte = Number(maxPrice)
        }

        if (inStock === 'true') {
            where.stock = { gt: 0 }
        }

        if (customizable === 'true') {
            where.isCustomizable = true
        }

        // Build orderBy clause
        let orderBy: any = { createdAt: 'desc' }

        if (sort) {
            switch (sort) {
                case 'price-low':
                    orderBy = { price: 'asc' }
                    break
                case 'price-high':
                    orderBy = { price: 'desc' }
                    break
                case 'newest':
                    orderBy = { createdAt: 'desc' }
                    break
                case 'popularity':
                    // You can implement popularity logic here
                    orderBy = { createdAt: 'desc' }
                    break
                default:
                    orderBy = { createdAt: 'desc' }
            }
        }

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                include: {
                    category: true,
                    customizationOptions: {
                        orderBy: { optionType: 'asc' }
                    }
                },
                skip,
                take: Number(limit),
                orderBy
            }),
            prisma.product.count({ where })
        ])

        return sendResponse(res, 200, 'Products retrieved successfully', {
            products,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        })
    } catch (error: any) {
        return sendError(res, 500, error.message || 'Failed to retrieve products')
    }
}

export const getBySlug = async (req: Request, res: Response) => {
    try {
        const { slug } = req.params

        const product = await prisma.product.findUnique({
            where: { slug },
            include: {
                category: true,
                customizationOptions: {
                    orderBy: { optionType: 'asc' }
                }
            }
        })

        if (!product) {
            return sendError(res, 404, 'Product not found')
        }

        return sendResponse(res, 200, 'Product retrieved successfully', { product })
    } catch (error: any) {
        return sendError(res, 500, error.message || 'Failed to retrieve product')
    }
}

export const getAllCategories = async (req: Request, res: Response) => {
    try {
        const categories = await prisma.category.findMany({
            include: {
                _count: {
                    select: { products: true }
                }
            }
        })

        return sendResponse(res, 200, 'Categories retrieved successfully', { categories })
    } catch (error: any) {
        return sendError(res, 500, error.message || 'Failed to retrieve categories')
    }
}

export const getByCategory = async (req: Request, res: Response) => {
    try {
        const { categoryId } = req.params
        const { page = 1, limit = 20 } = req.query
        const skip = (Number(page) - 1) * Number(limit)

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where: {
                    categoryId: Number(categoryId)
                },
                include: {
                    category: true,
                    customizationOptions: {
                        orderBy: { optionType: 'asc' }
                    }
                },
                skip,
                take: Number(limit),
                orderBy: { createdAt: 'desc' }
            }),
            prisma.product.count({
                where: {
                    categoryId: Number(categoryId)
                }
            })
        ])

        return sendResponse(res, 200, 'Category products retrieved successfully', {
            products,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        })
    } catch (error: any) {
        return sendError(res, 500, error.message || 'Failed to retrieve category products')
    }
}

// Customization endpoints
export const getCustomizationOptions = async (req: Request, res: Response) => {
    try {
        const { productId } = req.params

        const options = await prisma.customizationOption.findMany({
            where: { productId: Number(productId) },
            orderBy: [
                { optionType: 'asc' },
                { optionValue: 'asc' }
            ]
        })

        // Group options by type
        const groupedOptions = options.reduce((acc, option) => {
            if (!acc[option.optionType]) {
                acc[option.optionType] = []
            }
            acc[option.optionType].push(option)
            return acc
        }, {} as Record<string, any[]>)

        return sendResponse(res, 200, 'Customization options retrieved successfully', {
            options: groupedOptions
        })
    } catch (error: any) {
        return sendError(res, 500, error.message || 'Failed to retrieve customization options')
    }
}

export const calculateCustomizedPrice = async (req: Request, res: Response) => {
    try {
        const { productId } = req.params
        const { customizations } = req.body

        if (!customizations || !Array.isArray(customizations)) {
            return sendError(res, 400, 'Customizations array is required')
        }

        // Get base product
        const product = await prisma.product.findUnique({
            where: { id: Number(productId) },
            include: {
                customizationOptions: true
            }
        })

        if (!product) {
            return sendError(res, 404, 'Product not found')
        }

        // Calculate price adjustments
        let totalPrice = Number(product.price)
        const appliedCustomizations: any[] = []

        for (const customization of customizations) {
            const option = product.customizationOptions.find(
                opt => opt.optionType === customization.type &&
                    opt.optionValue === customization.value
            )

            if (option) {
                totalPrice += Number(option.priceDelta)
                appliedCustomizations.push({
                    type: option.optionType,
                    value: option.optionValue,
                    priceDelta: Number(option.priceDelta)
                })
            }
        }

        return sendResponse(res, 200, 'Price calculated successfully', {
            basePrice: Number(product.price),
            totalPrice,
            customizations: appliedCustomizations,
            priceAdjustment: totalPrice - Number(product.price)
        })
    } catch (error: any) {
        return sendError(res, 500, error.message || 'Failed to calculate price')
    }
}

export const searchProducts = async (req: Request, res: Response) => {
    try {
        const { q, page = 1, limit = 20 } = req.query
        const skip = (Number(page) - 1) * Number(limit)

        if (!q) {
            return sendError(res, 400, 'Search query is required')
        }

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where: {
                    OR: [
                        { name: { contains: q as string, mode: 'insensitive' } },
                        { description: { contains: q as string, mode: 'insensitive' } },
                        { category: { name: { contains: q as string, mode: 'insensitive' } } }
                    ]
                },
                include: {
                    category: true,
                    customizationOptions: {
                        orderBy: { optionType: 'asc' }
                    }
                },
                skip,
                take: Number(limit),
                orderBy: { createdAt: 'desc' }
            }),
            prisma.product.count({
                where: {
                    OR: [
                        { name: { contains: q as string, mode: 'insensitive' } },
                        { description: { contains: q as string, mode: 'insensitive' } },
                        { category: { name: { contains: q as string, mode: 'insensitive' } } }
                    ]
                }
            })
        ])

        return sendResponse(res, 200, 'Search completed successfully', {
            products,
            query: q,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        })
    } catch (error: any) {
        return sendError(res, 500, error.message || 'Search failed')
    }
}

export const getProductSuggestions = async (req: Request, res: Response) => {
    try {
        const { q } = req.query

        if (!q || (q as string).length < 2) {
            return sendResponse(res, 200, 'Suggestions retrieved successfully', { suggestions: [] })
        }

        const suggestions = await prisma.product.findMany({
            where: {
                OR: [
                    { name: { contains: q as string, mode: 'insensitive' } },
                    { category: { name: { contains: q as string, mode: 'insensitive' } } }
                ]
            },
            select: {
                id: true,
                name: true,
                slug: true,
                category: {
                    select: { name: true }
                }
            },
            take: 10,
            orderBy: { name: 'asc' }
        })

        return sendResponse(res, 200, 'Suggestions retrieved successfully', { suggestions })
    } catch (error: any) {
        return sendError(res, 500, error.message || 'Failed to get suggestions')
    }
} 