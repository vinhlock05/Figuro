import { prisma } from '../lib/prisma'
import crypto from 'crypto'
import axios from 'axios'

interface PaymentRequest {
    orderId: number
    amount: number
    gateway: 'momo' | 'zalopay' | 'vnpay' | 'cod'
    returnUrl: string
    cancelUrl: string
    description?: string
}

interface PaymentResponse {
    success: boolean
    paymentUrl?: string
    transactionId?: string
    error?: string
}

interface PaymentCallback {
    transactionId: string
    status: 'success' | 'failed' | 'pending'
    amount: number
    gateway: string
    signature?: string
}

// Vietnamese Payment Gateway implementations
class VietnamesePaymentGateway {
    private static generateSignature(data: string, secretKey: string): string {
        return crypto.createHmac('sha256', secretKey).update(data).digest('hex')
    }

    private static verifySignature(data: string, signature: string, secretKey: string): boolean {
        const expectedSignature = this.generateSignature(data, secretKey)
        return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
    }

    // MoMo Payment Integration
    static async processMoMoPayment(request: PaymentRequest): Promise<PaymentResponse> {
        try {
            const partnerCode = process.env.MOMO_PARTNER_CODE
            const accessKey = process.env.MOMO_ACCESS_KEY
            const secretKey = process.env.MOMO_SECRET_KEY
            const environment = process.env.MOMO_ENVIRONMENT || 'sandbox'

            if (!partnerCode || !accessKey || !secretKey) {
                throw new Error('MoMo payment gateway not configured')
            }

            const transactionId = `momo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            const amount = Math.round(request.amount) // MoMo expects integer amount

            // Create payment record
            await prisma.payment.create({
                data: {
                    orderId: request.orderId,
                    paymentGateway: 'momo',
                    amount: request.amount,
                    status: 'pending',
                    transactionId: transactionId
                }
            })

            // MoMo API request payload
            const requestId = transactionId
            const orderInfo = request.description || 'Thanh toan don hang Figuro'
            const redirectUrl = request.returnUrl
            const ipnUrl = `${process.env.API_BASE_URL}/api/payment/callback`
            const extraData = ''

            const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${transactionId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=captureWallet`

            const signature = this.generateSignature(rawSignature, secretKey)

            const momoRequest = {
                partnerCode,
                partnerName: 'Figuro',
                storeId: 'Figuro Store',
                requestId,
                amount,
                orderId: transactionId,
                orderInfo,
                redirectUrl,
                ipnUrl,
                lang: 'vi',
                extraData,
                requestType: 'captureWallet',
                signature
            }

            // Call MoMo API
            const apiUrl = environment === 'sandbox'
                ? 'https://test-payment.momo.vn/v2/gateway/api/create'
                : 'https://payment.momo.vn/v2/gateway/api/create'

            const response = await axios.post(apiUrl, momoRequest, {
                headers: { 'Content-Type': 'application/json' }
            })

            const responseData = response.data as any
            if (responseData.resultCode === 0) {
                return {
                    success: true,
                    paymentUrl: responseData.payUrl,
                    transactionId
                }
            } else {
                throw new Error(responseData.message || 'MoMo payment failed')
            }
        } catch (error) {
            console.error('MoMo payment error:', error)
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Payment processing failed'
            }
        }
    }

    // ZaloPay Payment Integration
    static async processZaloPayPayment(request: PaymentRequest): Promise<PaymentResponse> {
        try {
            const appId = process.env.ZALOPAY_APP_ID
            const key1 = process.env.ZALOPAY_KEY1
            const key2 = process.env.ZALOPAY_KEY2
            const environment = process.env.ZALOPAY_ENVIRONMENT || 'sandbox'

            if (!appId || !key1 || !key2) {
                throw new Error('ZaloPay payment gateway not configured')
            }

            const transactionId = `zalopay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            const amount = Math.round(request.amount)

            // Create payment record
            await prisma.payment.create({
                data: {
                    orderId: request.orderId,
                    paymentGateway: 'zalopay',
                    amount: request.amount,
                    status: 'pending',
                    transactionId: transactionId
                }
            })

            // ZaloPay API request
            const orderInfo = request.description || 'Thanh toan don hang Figuro'
            const embedData = JSON.stringify({ redirecturl: request.returnUrl })

            const rawSignature = `${appId}|${transactionId}|${amount}|${orderInfo}|${new Date().getTime()}|${embedData}`
            const mac = crypto.createHmac('sha256', key1).update(rawSignature).digest('hex')

            const zalopayRequest = {
                app_id: parseInt(appId),
                app_user: 'Figuro User',
                app_time: Date.now(),
                amount: amount,
                app_trans_id: transactionId,
                embed_data: embedData,
                item: orderInfo,
                description: orderInfo,
                bank_code: 'zalopayapp',
                mac: mac
            }

            // Call ZaloPay API
            const apiUrl = environment === 'sandbox'
                ? 'https://sandbox.zalopay.com.vn/v001/tpe/createorder'
                : 'https://api.zalopay.vn/v001/tpe/createorder'

            const response = await axios.post(apiUrl, zalopayRequest, {
                headers: { 'Content-Type': 'application/json' }
            })

            const responseData = response.data as any
            if (responseData.return_code === 1) {
                return {
                    success: true,
                    paymentUrl: responseData.order_url,
                    transactionId
                }
            } else {
                throw new Error(responseData.return_message || 'ZaloPay payment failed')
            }
        } catch (error) {
            console.error('ZaloPay payment error:', error)
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Payment processing failed'
            }
        }
    }

    // VNPAY Payment Integration
    static async processVNPAYPayment(request: PaymentRequest): Promise<PaymentResponse> {
        try {
            const tmnCode = process.env.VNPAY_TMN_CODE
            const hashSecret = process.env.VNPAY_HASH_SECRET
            const vnpayUrl = process.env.VNPAY_URL

            if (!tmnCode || !hashSecret || !vnpayUrl) {
                throw new Error('VNPAY payment gateway not configured')
            }

            const transactionId = `vnpay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            const amount = Math.round(request.amount * 100) // VNPAY expects amount in VND (smallest unit)

            // Create payment record
            await prisma.payment.create({
                data: {
                    orderId: request.orderId,
                    paymentGateway: 'vnpay',
                    amount: request.amount,
                    status: 'pending',
                    transactionId: transactionId
                }
            })

            // VNPAY request parameters
            const date = new Date()
            const createDate = date.toISOString().slice(0, 8).replace(/-/g, '')
            const orderInfo = request.description || 'Thanh toan don hang Figuro'

            const vnpayParams = {
                vnp_Version: '2.1.0',
                vnp_Command: 'pay',
                vnp_TmnCode: tmnCode,
                vnp_Amount: amount,
                vnp_CurrCode: 'VND',
                vnp_BankCode: '',
                vnp_TxnRef: transactionId,
                vnp_OrderInfo: orderInfo,
                vnp_OrderType: 'other',
                vnp_Locale: 'vn',
                vnp_ReturnUrl: request.returnUrl,
                vnp_IpAddr: '127.0.0.1',
                vnp_CreateDate: createDate
            }

            // Sort parameters and create signature
            const sortedParams = Object.keys(vnpayParams)
                .sort()
                .reduce((result: any, key) => {
                    result[key] = vnpayParams[key as keyof typeof vnpayParams]
                    return result
                }, {})

            const signData = Object.keys(sortedParams)
                .map(key => `${key}=${sortedParams[key]}`)
                .join('&')

            const hmac = crypto.createHmac('sha512', hashSecret)
            const signature = hmac.update(signData).digest('hex')

            const paymentUrl = `${vnpayUrl}?${signData}&vnp_SecureHash=${signature}`

            return {
                success: true,
                paymentUrl,
                transactionId
            }
        } catch (error) {
            console.error('VNPAY payment error:', error)
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Payment processing failed'
            }
        }
    }

    static async processCODPayment(request: PaymentRequest): Promise<PaymentResponse> {
        try {
            const transactionId = `cod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

            await prisma.payment.create({
                data: {
                    orderId: request.orderId,
                    paymentGateway: 'cod',
                    amount: request.amount,
                    status: 'pending',
                    transactionId: transactionId
                }
            })

            // COD doesn't need payment URL, just mark as pending
            return {
                success: true,
                transactionId
            }
        } catch (error) {
            console.error('COD payment error:', error)
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Payment processing failed'
            }
        }
    }

    static async handlePaymentCallback(callback: PaymentCallback): Promise<boolean> {
        try {
            const payment = await prisma.payment.findFirst({
                where: { transactionId: callback.transactionId }
            })

            if (!payment) {
                throw new Error('Payment not found')
            }

            // Verify signature if provided
            if (callback.signature) {
                const secretKey = process.env[`${callback.gateway.toUpperCase()}_SECRET_KEY`]
                if (secretKey && !this.verifySignature(callback.transactionId, callback.signature, secretKey)) {
                    throw new Error('Invalid signature')
                }
            }

            // Update payment status
            await prisma.payment.update({
                where: { id: payment.id },
                data: {
                    status: callback.status,
                    paidAt: callback.status === 'success' ? new Date() : null
                }
            })

            // Update order status if payment successful
            if (callback.status === 'success') {
                await prisma.order.update({
                    where: { id: payment.orderId },
                    data: { status: 'paid' }
                })

                // Add to order status history
                await prisma.orderStatusHistory.create({
                    data: {
                        orderId: payment.orderId,
                        status: 'paid'
                    }
                })
            }

            return true
        } catch (error) {
            console.error('Payment callback error:', error)
            return false
        }
    }
}

export const createPayment = async (request: PaymentRequest): Promise<PaymentResponse> => {
    try {
        // Validate order exists and is pending
        const order = await prisma.order.findUnique({
            where: { id: request.orderId }
        })

        if (!order) {
            throw new Error('Order not found')
        }

        if (order.status !== 'pending') {
            throw new Error('Order is not in pending status')
        }

        // Process payment based on gateway
        switch (request.gateway) {
            case 'momo':
                return await VietnamesePaymentGateway.processMoMoPayment(request)
            case 'zalopay':
                return await VietnamesePaymentGateway.processZaloPayPayment(request)
            case 'vnpay':
                return await VietnamesePaymentGateway.processVNPAYPayment(request)
            case 'cod':
                return await VietnamesePaymentGateway.processCODPayment(request)
            default:
                throw new Error('Unsupported payment gateway')
        }
    } catch (error) {
        console.error('Payment creation error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Payment creation failed'
        }
    }
}

export const handlePaymentCallback = async (callback: PaymentCallback): Promise<boolean> => {
    return await VietnamesePaymentGateway.handlePaymentCallback(callback)
}

export const getPaymentStatus = async (transactionId: string) => {
    try {
        const payment = await prisma.payment.findFirst({
            where: { transactionId },
            include: { order: true }
        })

        if (!payment) {
            throw new Error('Payment not found')
        }

        return {
            transactionId: payment.transactionId,
            status: payment.status,
            amount: payment.amount,
            gateway: payment.paymentGateway,
            paidAt: payment.paidAt,
            orderId: payment.orderId,
            orderStatus: payment.order.status
        }
    } catch (error) {
        console.error('Get payment status error:', error)
        throw error
    }
}

export const getOrderPayments = async (orderId: number) => {
    try {
        const payments = await prisma.payment.findMany({
            where: { orderId },
            orderBy: { createdAt: 'desc' }
        })

        return payments
    } catch (error) {
        console.error('Get order payments error:', error)
        throw error
    }
} 