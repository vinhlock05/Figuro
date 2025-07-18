import { Express } from 'express'
import authRoutes from './auth'
import productRoutes from './products'
import cartRoutes from './cart'
import orderRoutes from './order'
import adminRoutes from './admin'

export const registerRoutes = (app: Express) => {
    app.use('/api/auth', authRoutes)
    app.use('/api/products', productRoutes)
    app.use('/api/cart', cartRoutes)
    app.use('/api/order', orderRoutes)
    app.use('/api/admin', adminRoutes)
} 