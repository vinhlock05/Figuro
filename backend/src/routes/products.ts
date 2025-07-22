import { Router } from 'express'
import * as productController from '../controllers/productController'

const router = Router()

// Basic product routes
router.get('/', productController.list)
router.get('/:slug', productController.getBySlug)
router.get('/categories/all', productController.getAllCategories)
router.get('/category/:categoryId', productController.getByCategory)

// Search and suggestions
router.get('/search', productController.searchProducts)
router.get('/suggestions', productController.getProductSuggestions)

// Customization routes
router.get('/:productId/customizations', productController.getCustomizationOptions)
router.post('/:productId/calculate-price', productController.calculateCustomizedPrice)

export default router 