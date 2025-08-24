import { Express } from 'express'
import authRoutes from './auth'
import productRoutes from './products'
import cartRoutes from './cart'
import orderRoutes from './order'
import adminRoutes from './admin'
import paymentRoutes from './payment'
import notificationRoutes from './notification'
import orderTrackingRoutes from './orderTracking'
import wishlistRoutes from './wishlist'
import voiceAgentRoutes from './voiceAgent'
import chatbotRoutes from './chatbot'

export const registerRoutes = (app: Express) => {
    app.use('/api/auth', authRoutes)
    app.use('/api/products', productRoutes)
    app.use('/api/cart', cartRoutes)
    app.use('/api/order', orderRoutes)
    app.use('/api/admin', adminRoutes)
    app.use('/api/payment', paymentRoutes)
    app.use('/api/notifications', notificationRoutes)
    app.use('/api/order-tracking', orderTrackingRoutes)
    app.use('/api/wishlist', wishlistRoutes)
    app.use('/api/voice-agent', voiceAgentRoutes)
    app.use('/api/chatbot', chatbotRoutes)
} 