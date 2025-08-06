import { Request, Response } from 'express';
import {
    getWishlist as getWishlistService,
    addToWishlist as addToWishlistService,
    removeFromWishlist as removeFromWishlistService,
    isInWishlist as isInWishlistService
} from '../services/wishlistService';
import { sendResponse, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

export const getWishlist = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.userId;
        const wishlist = await getWishlistService(userId);
        return sendResponse(res, 200, 'Wishlist retrieved successfully', wishlist);
    } catch (error: any) {
        return sendError(res, 500, error.message || 'Failed to retrieve wishlist');
    }
};

export const addToWishlist = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.userId;
        const { productId } = req.body;

        if (!productId) {
            return sendError(res, 400, 'Product ID is required');
        }

        await addToWishlistService(userId, productId);
        return sendResponse(res, 201, 'Product added to wishlist successfully');
    } catch (error: any) {
        return sendError(res, 400, error.message || 'Failed to add product to wishlist');
    }
};

export const removeFromWishlist = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.userId;
        const { productId } = req.params;

        if (!productId) {
            return sendError(res, 400, 'Product ID is required');
        }

        await removeFromWishlistService(userId, parseInt(productId));
        return sendResponse(res, 200, 'Product removed from wishlist successfully');
    } catch (error: any) {
        return sendError(res, 400, error.message || 'Failed to remove product from wishlist');
    }
};

export const checkWishlistStatus = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.userId;
        const { productId } = req.params;

        if (!productId) {
            return sendError(res, 400, 'Product ID is required');
        }

        const isInWishlist = await isInWishlistService(userId, parseInt(productId));
        return sendResponse(res, 200, 'Wishlist status checked successfully', { isInWishlist });
    } catch (error: any) {
        return sendError(res, 500, error.message || 'Failed to check wishlist status');
    }
}; 