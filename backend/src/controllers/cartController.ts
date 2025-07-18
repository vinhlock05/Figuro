import { Request, Response } from 'express'
import * as cartService from '../services/cartService'
import { AuthRequest } from '../middleware/auth'
import { sendResponse, sendError } from '../utils/response'

export const getCart = async (req: AuthRequest, res: Response) => {
    try {
        const cart = await cartService.getCart(req.user.userId)
        return sendResponse(res, 200, 'Cart fetched', { cart })
    } catch (error: any) {
        return sendError(res, 500, error.message || 'Internal server error')
    }
}

export const addItem = async (req: AuthRequest, res: Response) => {
    try {
        const { productId, quantity, customizations } = req.body
        if (!productId || !quantity) {
            return sendError(res, 400, 'productId and quantity are required')
        }
        const item = await cartService.addItem(req.user.userId, productId, quantity, customizations)
        return sendResponse(res, 201, 'Item added to cart', { item })
    } catch (error: any) {
        return sendError(res, 400, error.message || 'Failed to add item')
    }
}

export const updateItem = async (req: AuthRequest, res: Response) => {
    try {
        const { cartItemId, quantity, customizations } = req.body
        if (!cartItemId || !quantity) {
            return sendError(res, 400, 'cartItemId and quantity are required')
        }
        const item = await cartService.updateItem(req.user.userId, cartItemId, quantity, customizations)
        return sendResponse(res, 200, 'Cart item updated', { item })
    } catch (error: any) {
        return sendError(res, 400, error.message || 'Failed to update item')
    }
}

export const removeItem = async (req: AuthRequest, res: Response) => {
    try {
        const { cartItemId } = req.body
        if (!cartItemId) {
            return sendError(res, 400, 'cartItemId is required')
        }
        await cartService.removeItem(req.user.userId, cartItemId)
        return sendResponse(res, 200, 'Item removed from cart')
    } catch (error: any) {
        return sendError(res, 400, error.message || 'Failed to remove item')
    }
}

export const clearCart = async (req: AuthRequest, res: Response) => {
    try {
        await cartService.clearCart(req.user.userId)
        return sendResponse(res, 200, 'Cart cleared')
    } catch (error: any) {
        return sendError(res, 400, error.message || 'Failed to clear cart')
    }
} 