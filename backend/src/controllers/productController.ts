import { Request, Response } from 'express'
import * as productService from '../services/productService'
import { sendResponse, sendError } from '../utils/response'
import { getCache, setCache } from '../utils/cache'

const PRODUCT_LIST_CACHE_KEY = 'products:list'
const CATEGORY_LIST_CACHE_KEY = 'categories:list'
const CACHE_TTL = 60 // 60 seconds

export const list = async (req: Request, res: Response) => {
    try {
        const cacheKey = PRODUCT_LIST_CACHE_KEY + JSON.stringify(req.query)
        const cached = await getCache(cacheKey)
        if (cached) {
            return sendResponse(res, 200, 'Products fetched (cache)', cached)
        }
        const result = await productService.listProducts(req.query)
        await setCache(cacheKey, result, CACHE_TTL)
        return sendResponse(res, 200, 'Products fetched', result)
    } catch (error) {
        return sendError(res, 500, 'Internal server error')
    }
}

export const getBySlug = async (req: Request, res: Response) => {
    try {
        const { slug } = req.params
        const product = await productService.getProductBySlug(slug)
        if (!product) return sendError(res, 404, 'Product not found')
        return sendResponse(res, 200, 'Product fetched', { product })
    } catch (error) {
        return sendError(res, 500, 'Internal server error')
    }
}

export const getAllCategories = async (req: Request, res: Response) => {
    try {
        const cached = await getCache(CATEGORY_LIST_CACHE_KEY)
        if (cached) {
            return sendResponse(res, 200, 'Categories fetched (cache)', { categories: cached })
        }
        const categories = await productService.getAllCategories()
        await setCache(CATEGORY_LIST_CACHE_KEY, categories, CACHE_TTL)
        return sendResponse(res, 200, 'Categories fetched', { categories })
    } catch (error) {
        return sendError(res, 500, 'Internal server error')
    }
}

export const getByCategory = async (req: Request, res: Response) => {
    try {
        const { categorySlug } = req.params
        const { page = 1, limit = 10 } = req.query
        const result = await productService.getProductsByCategory(categorySlug, Number(page), Number(limit))
        if (!result) return sendError(res, 404, 'Category not found')
        return sendResponse(res, 200, 'Category products fetched', result)
    } catch (error) {
        return sendError(res, 500, 'Internal server error')
    }
} 