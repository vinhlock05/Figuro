import { Router } from 'express'
import * as productController from '../controllers/productController'

const router = Router()

router.get('/', productController.list)
router.get('/:slug', productController.getBySlug)
router.get('/categories/all', productController.getAllCategories)
router.get('/category/:categorySlug', productController.getByCategory)

export default router 