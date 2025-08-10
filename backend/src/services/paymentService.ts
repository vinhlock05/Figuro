import { prisma } from '../lib/prisma'
import crypto from 'crypto'
import axios from 'axios'
import dateFormat from 'dateformat'
import qs from 'qs'
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
            const ipnUrl = `${process.env.API_BASE_URL}/api/payment/momo-callback`
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

    // ZaloPay Payment Integration (OpenAPI v2)
    static async processZaloPayPayment(request: PaymentRequest): Promise<PaymentResponse> {
        try {
            const appId = process.env.ZALOPAY_APP_ID
            const key1 = process.env.ZALOPAY_KEY1
            const key2 = process.env.ZALOPAY_KEY2
            const environment = process.env.ZALOPAY_ENVIRONMENT || 'sandbox'

            if (!appId || !key1 || !key2) {
                throw new Error('ZaloPay payment gateway not configured')
            }

            // Build app_trans_id in YYMMDD_random format per docs
            const now = new Date()
            const yymmdd = dateFormat(now, 'yymmdd')
            const transRand = Math.floor(Math.random() * 1000000)
            const appTransId = `${yymmdd}_${transRand}`

            const amount = Math.round(request.amount) // Integer VND

            // Create payment record with app_trans_id for later reconciliation
            await prisma.payment.create({
                data: {
                    orderId: request.orderId,
                    paymentGateway: 'zalopay',
                    amount: request.amount,
                    status: 'pending',
                    transactionId: appTransId
                }
            })

            const appUser = `user_${request.orderId}`
            const appTime = Date.now()
            const items = JSON.stringify([])
            const embedData = JSON.stringify({ redirecturl: `${request.returnUrl}&app_trans_id=${appTransId}` })
            const description = request.description || `Thanh toan don hang ${request.orderId}`

            // mac = HMAC SHA256 over: appid|app_trans_id|appuser|amount|apptime|embeddata|item with key1
            const macData = `${appId}|${appTransId}|${appUser}|${amount}|${appTime}|${embedData}|${items}`
            const mac = crypto.createHmac('sha256', key1).update(macData).digest('hex')

            const params: any = {
                app_id: Number(appId),
                app_trans_id: appTransId,
                app_user: appUser,
                app_time: appTime,
                item: items,
                embed_data: embedData,
                amount,
                description,
                bank_code: '',
                mac,
                callback_url: 'https://8d487a10e0a5.ngrok-free.app/api/payment/zalopay-callback'
            }

            const apiUrl = environment === 'sandbox'
                ? 'https://sb-openapi.zalopay.vn/v2/create'
                : 'https://openapi.zalopay.vn/v2/create'

            // Send as query string params, empty body
            const response = await axios.post(apiUrl, null, { params })
            const responseData = response.data as any

            if (responseData.return_code === 1) {
                return {
                    success: true,
                    paymentUrl: responseData.order_url,
                    transactionId: appTransId
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

    // ZaloPay query transaction status
    static async queryZaloPay(appTransId: string): Promise<any> {
        const appId = process.env.ZALOPAY_APP_ID
        const key1 = process.env.ZALOPAY_KEY1
        const environment = process.env.ZALOPAY_ENVIRONMENT || 'sandbox'
        if (!appId || !key1) throw new Error('ZaloPay not configured')

        const endpoint = environment === 'sandbox'
            ? 'https://sb-openapi.zalopay.vn/v2/query'
            : 'https://openapi.zalopay.vn/v2/query'

        const postData: any = {
            app_id: Number(appId),
            app_trans_id: appTransId
        }
        const signData = `${postData.app_id}|${postData.app_trans_id}|${key1}`
        postData.mac = crypto.createHmac('sha256', key1).update(signData).digest('hex')

        const res = await axios.post(endpoint, qs.stringify(postData), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        })
        return res.data
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
            var date = new Date()
            const createDate = dateFormat(date, 'yyyymmddHHmmss');
            const expireDate = dateFormat(date.getTime() + 15 * 60 * 1000, 'yyyymmddHHmmss')
            const orderInfo = request.description || 'Thanh toan don hang Figuro'

            // Ensure return URL is a valid absolute URL (VNPay will redirect to this URL)
            const apiBase = process.env.API_BASE_URL && process.env.API_BASE_URL.trim().length > 0
                ? process.env.API_BASE_URL
                : (new URL(request.returnUrl)).origin
            const vnpReturnUrl = `${apiBase}/api/payment/vnpay-return`
            let vnpayParams = {
                vnp_Version: '2.1.0',
                vnp_Command: 'pay',
                vnp_TmnCode: tmnCode,
                vnp_Amount: amount,
                vnp_CurrCode: 'VND',
                vnp_TxnRef: transactionId,
                vnp_OrderInfo: orderInfo,
                vnp_OrderType: 'other',
                vnp_Locale: 'vn',
                vnp_ReturnUrl: vnpReturnUrl,
                vnp_IpAddr: '127.0.0.1',
                vnp_CreateDate: createDate,
                vnp_ExpireDate: expireDate
            }

            // Sort parameters and create signature
            let sortedParams = Object.keys(vnpayParams)
                .sort()
                .reduce((result: any, key) => {
                    result[key] = vnpayParams[key as keyof typeof vnpayParams]
                    return result
                }, {})
            let signData = qs.stringify(sortedParams)

            const hmac = crypto.createHmac('sha512', hashSecret)
            const signature = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex")
            sortedParams["vnp_SecureHash"] = signature
            let paymentUrl = vnpayUrl + "?" + qs.stringify(sortedParams)

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

        // Use order's totalPrice in VND as payment amount (no extra scaling here)
        // Gateways will handle unit differences individually:
        // - MoMo, ZaloPay: amount in VND integer
        // - VNPAY: amount must be VND * 100 in request builder
        const paymentRequest = {
            ...request,
            amount: Math.round(Number(order.totalPrice))
        }

        // Process payment based on gateway
        switch (request.gateway) {
            case 'momo':
                return await VietnamesePaymentGateway.processMoMoPayment(paymentRequest)
            case 'zalopay':
                return await VietnamesePaymentGateway.processZaloPayPayment(paymentRequest)
            case 'vnpay':
                return await VietnamesePaymentGateway.processVNPAYPayment(paymentRequest)
            case 'cod':
                return await VietnamesePaymentGateway.processCODPayment(paymentRequest)
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

// Re-export helper for routes
export const queryZaloPay = VietnamesePaymentGateway.queryZaloPay.bind(VietnamesePaymentGateway)

// VNPay return handler (computes FE redirect URL and updates payment)
export const processVnpayReturn = async (vnpParams: any): Promise<string> => {
    // Remove secure hash for recompute
    const secureHash = vnpParams['vnp_SecureHash'] || vnpParams['vnp_SecureHashType']
    delete vnpParams['vnp_SecureHash']
    delete vnpParams['vnp_SecureHashType']

    const txnRef = vnpParams['vnp_TxnRef'] as string
    const responseCode = vnpParams['vnp_ResponseCode'] as string
    const feBase = process.env.WEB_BASE_URL || 'http://localhost:5173'
    let redirectUrl = `${feBase}/checkout/result`

    // Verify signature (best-effort)
    try {
        const hashSecret = process.env.VNPAY_HASH_SECRET as string
        if (hashSecret) {
            const sortedParams = Object.keys(vnpParams).sort().reduce((acc: any, key) => {
                acc[key] = vnpParams[key]
                return acc
            }, {})
            const signData = qs.stringify(sortedParams, { encode: false })
            const hmac = crypto.createHmac('sha512', hashSecret)
            const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex')
            if (secureHash && secureHash.toLowerCase() !== signed.toLowerCase()) {
                console.warn('VNPAY signature mismatch')
            }
        }
    } catch (e) {
        console.warn('VNPAY signature verify error', e)
    }

    if (responseCode === '00') {
        const payment = await prisma.payment.findFirst({ where: { transactionId: txnRef } })
        if (payment) {
            await prisma.payment.update({
                where: { id: payment.id },
                data: { status: 'paid', paidAt: new Date() }
            })
            redirectUrl = `${feBase}/checkout/result?orderId=${payment.orderId}&vnp_TxnRef=${encodeURIComponent(txnRef)}&vnp_ResponseCode=00`
        }
    } else {
        redirectUrl = `${feBase}/checkout/result?vnp_TxnRef=${encodeURIComponent(txnRef)}&vnp_ResponseCode=${encodeURIComponent(responseCode)}`
    }

    return redirectUrl
}

// ZaloPay IPN handler
export const processZaloPayCallback = async (body: any): Promise<{ return_code: number; return_message: string }> => {
    try {
        const dataStr = body.data
        const reqMac = body.mac
        const mac = crypto.createHmac('sha256', process.env.ZALOPAY_KEY2 as string).update(dataStr).digest('hex')
        if (reqMac !== mac) {
            return { return_code: -1, return_message: 'mac not equal' }
        }

        const data = JSON.parse(dataStr)
        const appTransId = data.app_trans_id

        const payment = await prisma.payment.findFirst({ where: { transactionId: appTransId } })
        if (payment) {
            let paySuccess = false
            try {
                const qres: any = await queryZaloPay(appTransId)
                paySuccess = qres?.return_code === 1 && (qres?.sub_return_code === 1 || qres?.is_processing === false)
            } catch (e) {
                const fallback = data?.return_code === 1 || data?.zp_trans_token || data?.is_success === true
                paySuccess = Boolean(fallback)
            }
            await prisma.payment.update({
                where: { id: payment.id },
                data: { status: paySuccess ? 'paid' : 'failed', paidAt: paySuccess ? new Date() : null }
            })
        }
        return { return_code: 1, return_message: 'success' }
    } catch (e) {
        console.error('processZaloPayCallback error:', e)
        return { return_code: -1, return_message: 'error' }
    }
}

// MoMo IPN handler
export const processMomoCallback = async (body: any): Promise<number> => {
    try {
        const orderId = body.orderId as string | undefined
        const resultCode = Number(body.resultCode)
        const signature = body.signature as string | undefined

        // Verify signature best-effort
        try {
            const accessKey = process.env.MOMO_ACCESS_KEY as string
            const secretKey = process.env.MOMO_SECRET_KEY as string
            if (accessKey && secretKey) {
                const raw = `accessKey=${accessKey}&amount=${body.amount}&extraData=${body.extraData || ''}&message=${body.message}&orderId=${body.orderId}&orderInfo=${body.orderInfo}&orderType=${body.orderType}&partnerCode=${body.partnerCode}&payType=${body.payType}&requestId=${body.requestId}&responseTime=${body.responseTime}&resultCode=${body.resultCode}&transId=${body.transId}`
                const expected = crypto.createHmac('sha256', secretKey).update(raw).digest('hex')
                if (signature && expected !== signature) {
                    console.warn('MoMo signature mismatch')
                }
            }
        } catch (e) {
            console.warn('MoMo signature verification error', e)
        }

        if (orderId) {
            const payment = await prisma.payment.findFirst({ where: { transactionId: orderId } })
            if (payment) {
                const paid = resultCode === 0 || resultCode === 9000
                await prisma.payment.update({
                    where: { id: payment.id },
                    data: { status: paid ? 'paid' : 'failed', paidAt: paid ? new Date() : null }
                })
            }
        }
        return 204
    } catch (e) {
        console.error('processMomoCallback error:', e)
        return 500
    }
}