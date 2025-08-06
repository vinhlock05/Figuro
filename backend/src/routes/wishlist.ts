import { Router } from 'express';
import * as wishlistController from '../controllers/wishlistController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Wishlist routes - all require authentication
router.use(authenticate);

// Get user's wishlist
router.get('/', wishlistController.getWishlist);

// Add product to wishlist
router.post('/add', wishlistController.addToWishlist);

// Remove product from wishlist
router.delete('/:productId', wishlistController.removeFromWishlist);

// Check if product is in wishlist
router.get('/check/:productId', wishlistController.checkWishlistStatus);

export default router; 