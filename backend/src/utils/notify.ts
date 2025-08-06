import { Resend } from 'resend'

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'yourname@resend.dev'

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null

export async function sendResetPasswordEmail(email: string, token: string) {

    if (!resend) {
        console.log(`[EMAIL] ⚠️  No Resend API key configured. Email not sent.`)
        console.log(`[EMAIL] 💡 To enable real email sending, add RESEND_API_KEY to your .env file`)
        return
    }

    try {
        await resend.emails.send({
            from: FROM_EMAIL,
            to: email,
            subject: 'Reset your password - Figuro',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4F46E5;">Reset Your Password</h2>
                    <p>You requested to reset your password. Click the button below to proceed:</p>
                    <a href="http://localhost:5173?action=reset&token=${token}" 
                       style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                        Reset Password
                    </a>
                    <p style="margin-top: 20px; color: #6B7280; font-size: 14px;">
                        If you didn't request this, you can safely ignore this email.
                    </p>
                </div>
            `
        })
        console.log(`[EMAIL] ✅ Password reset email sent successfully to ${email}`)
    } catch (error) {
        console.error(`[EMAIL] ❌ Failed to send password reset email:`, error)
    }
}

export async function sendVerificationEmail(email: string, otp: string) {
    console.log(`[EMAIL] ✅ Email Verification Request`)
    console.log(`[EMAIL] 📧 To: ${email}`)
    console.log(`[EMAIL] 🔢 OTP Code: ${otp}`)

    if (!resend) {
        console.log(`[EMAIL] ⚠️  No Resend API key configured. Email not sent.`)
        console.log(`[EMAIL] 💡 To enable real email sending, add RESEND_API_KEY to your .env file`)
        console.log(`[EMAIL] 🧪 For testing, use OTP code: ${otp}`)
        return
    }

    try {
        await resend.emails.send({
            from: FROM_EMAIL,
            to: email,
            subject: 'Your verification code - Figuro',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4F46E5;">Your Verification Code</h2>
                    <p>Please use the following code to verify your email address:</p>
                    <div style="background-color: #F3F4F6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                        <h1 style="color: #4F46E5; font-size: 32px; font-weight: bold; letter-spacing: 4px; margin: 0;">
                            ${otp}
                        </h1>
                    </div>
                    <p style="color: #6B7280; font-size: 14px;">
                        This code will expire in 10 minutes.
                    </p>
                </div>
            `
        })
        console.log(`[EMAIL] ✅ Verification OTP sent successfully to ${email}`)
    } catch (error) {
        console.error(`[EMAIL] ❌ Failed to send verification OTP:`, error)
    }
}

// Order confirmation email
export async function sendOrderConfirmationEmail(email: string, order: any) {
    console.log(`[EMAIL] ✅ Order Confirmation Request`)
    console.log(`[EMAIL] 📧 To: ${email}`)
    console.log(`[EMAIL] 🛒 Order ID: ${order.id}`)

    if (!resend) {
        console.log(`[EMAIL] ⚠️  No Resend API key configured. Email not sent.`)
        console.log(`[EMAIL] 💡 To enable real email sending, add RESEND_API_KEY to your .env file`)
        return
    }

    try {
        const itemsHtml = order.items.map((item: any) => `
            <tr>
                <td style="padding: 12px; border-bottom: 1px solid #E5E7EB;">
                    <div style="display: flex; align-items: center;">
                        <img src="${item.product.imageUrl || '/placeholder.jpg'}" alt="${item.product.name}" 
                             style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; margin-right: 12px;">
                        <div>
                            <h4 style="margin: 0; color: #111827; font-size: 16px;">${item.product.name}</h4>
                            <p style="margin: 4px 0 0 0; color: #6B7280; font-size: 14px;">Số lượng: ${item.quantity}</p>
                            ${item.customizations ? `<p style="margin: 4px 0 0 0; color: #6B7280; font-size: 12px;">Tùy chỉnh: ${JSON.stringify(item.customizations)}</p>` : ''}
                        </div>
                    </div>
                </td>
                <td style="padding: 12px; border-bottom: 1px solid #E5E7EB; text-align: right; color: #111827; font-weight: 600;">
                    ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(item.price))}
                </td>
            </tr>
        `).join('')

        await resend.emails.send({
            from: FROM_EMAIL,
            to: email,
            subject: `Xác nhận đơn hàng #${order.id} - Figuro`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #F9FAFB;">
                    <div style="background-color: #4F46E5; padding: 24px; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 24px;">Cảm ơn bạn đã đặt hàng!</h1>
                    </div>
                    
                    <div style="background-color: white; padding: 24px;">
                        <h2 style="color: #111827; margin-bottom: 16px;">Đơn hàng #${order.id}</h2>
                        <p style="color: #6B7280; margin-bottom: 24px;">
                            Chúng tôi đã nhận được đơn hàng của bạn và đang xử lý. Dưới đây là chi tiết đơn hàng:
                        </p>
                        
                        <div style="background-color: #F3F4F6; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                            <h3 style="margin: 0 0 12px 0; color: #111827;">Thông tin đơn hàng</h3>
                            <p style="margin: 4px 0; color: #6B7280;"><strong>Trạng thái:</strong> Đang xử lý</p>
                            <p style="margin: 4px 0; color: #6B7280;"><strong>Phương thức thanh toán:</strong> ${order.paymentMethod}</p>
                            <p style="margin: 4px 0; color: #6B7280;"><strong>Địa chỉ giao hàng:</strong> ${order.shippingAddress}</p>
                            <p style="margin: 4px 0; color: #6B7280;"><strong>Ngày đặt:</strong> ${new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                        </div>
                        
                        <h3 style="color: #111827; margin-bottom: 16px;">Sản phẩm đã đặt</h3>
                        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                            <thead>
                                <tr style="background-color: #F9FAFB;">
                                    <th style="padding: 12px; text-align: left; color: #6B7280; font-weight: 600;">Sản phẩm</th>
                                    <th style="padding: 12px; text-align: right; color: #6B7280; font-weight: 600;">Giá</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHtml}
                            </tbody>
                        </table>
                        
                        <div style="border-top: 2px solid #E5E7EB; padding-top: 16px; text-align: right;">
                            <h3 style="margin: 0; color: #111827; font-size: 18px;">
                                Tổng cộng: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(order.totalPrice))}
                            </h3>
                        </div>
                        
                        <div style="margin-top: 24px; padding: 16px; background-color: #F0F9FF; border-radius: 8px;">
                            <h4 style="margin: 0 0 8px 0; color: #1E40AF;">Thông tin bổ sung</h4>
                            <p style="margin: 0; color: #1E40AF; font-size: 14px;">
                                Chúng tôi sẽ gửi email cập nhật khi đơn hàng được xử lý và giao hàng. 
                                Bạn có thể theo dõi trạng thái đơn hàng trong tài khoản của mình.
                            </p>
                        </div>
                    </div>
                    
                    <div style="background-color: #F9FAFB; padding: 24px; text-align: center;">
                        <p style="color: #6B7280; margin: 0; font-size: 14px;">
                            Nếu bạn có câu hỏi, vui lòng liên hệ với chúng tôi qua email hoặc hotline.
                        </p>
                    </div>
                </div>
            `
        })
        console.log(`[EMAIL] ✅ Order confirmation email sent successfully to ${email}`)
    } catch (error) {
        console.error(`[EMAIL] ❌ Failed to send order confirmation email:`, error)
    }
}

// Order status update email
export async function sendOrderStatusUpdateEmail(email: string, order: any, newStatus: string, description?: string) {
    console.log(`[EMAIL] ✅ Order Status Update Request`)
    console.log(`[EMAIL] 📧 To: ${email}`)
    console.log(`[EMAIL] 🛒 Order ID: ${order.id}`)
    console.log(`[EMAIL] 📊 New Status: ${newStatus}`)

    if (!resend) {
        console.log(`[EMAIL] ⚠️  No Resend API key configured. Email not sent.`)
        console.log(`[EMAIL] 💡 To enable real email sending, add RESEND_API_KEY to your .env file`)
        return
    }

    const statusMessages: Record<string, { title: string; message: string; color: string }> = {
        'confirmed': {
            title: 'Đơn hàng đã được xác nhận',
            message: 'Đơn hàng của bạn đã được xác nhận và đang được chuẩn bị.',
            color: '#059669'
        },
        'processing': {
            title: 'Đơn hàng đang được xử lý',
            message: 'Đơn hàng của bạn đang được xử lý và chuẩn bị để giao hàng.',
            color: '#D97706'
        },
        'shipped': {
            title: 'Đơn hàng đã được giao hàng',
            message: 'Đơn hàng của bạn đã được giao hàng và đang trên đường đến bạn.',
            color: '#2563EB'
        },
        'delivered': {
            title: 'Đơn hàng đã được giao thành công',
            message: 'Đơn hàng của bạn đã được giao thành công. Cảm ơn bạn đã mua hàng!',
            color: '#059669'
        },
        'cancelled': {
            title: 'Đơn hàng đã bị hủy',
            message: 'Đơn hàng của bạn đã bị hủy. Nếu có thắc mắc, vui lòng liên hệ với chúng tôi.',
            color: '#DC2626'
        }
    }

    const statusInfo = statusMessages[newStatus] || {
        title: 'Cập nhật trạng thái đơn hàng',
        message: 'Trạng thái đơn hàng của bạn đã được cập nhật.',
        color: '#6B7280'
    }

    try {
        await resend.emails.send({
            from: FROM_EMAIL,
            to: email,
            subject: `${statusInfo.title} - Đơn hàng #${order.id}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #F9FAFB;">
                    <div style="background-color: ${statusInfo.color}; padding: 24px; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 24px;">${statusInfo.title}</h1>
                    </div>
                    
                    <div style="background-color: white; padding: 24px;">
                        <h2 style="color: #111827; margin-bottom: 16px;">Đơn hàng #${order.id}</h2>
                        <p style="color: #6B7280; margin-bottom: 24px;">
                            ${statusInfo.message}
                        </p>
                        
                        <div style="background-color: #F3F4F6; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                            <h3 style="margin: 0 0 12px 0; color: #111827;">Chi tiết cập nhật</h3>
                            <p style="margin: 4px 0; color: #6B7280;"><strong>Trạng thái mới:</strong> ${newStatus}</p>
                            <p style="margin: 4px 0; color: #6B7280;"><strong>Thời gian:</strong> ${new Date().toLocaleString('vi-VN')}</p>
                            ${description ? `<p style="margin: 4px 0; color: #6B7280;"><strong>Ghi chú:</strong> ${description}</p>` : ''}
                        </div>
                        
                        <div style="margin-top: 24px; padding: 16px; background-color: #F0F9FF; border-radius: 8px;">
                            <h4 style="margin: 0 0 8px 0; color: #1E40AF;">Theo dõi đơn hàng</h4>
                            <p style="margin: 0; color: #1E40AF; font-size: 14px;">
                                Bạn có thể theo dõi chi tiết đơn hàng trong tài khoản của mình hoặc liên hệ với chúng tôi nếu có thắc mắc.
                            </p>
                        </div>
                    </div>
                    
                    <div style="background-color: #F9FAFB; padding: 24px; text-align: center;">
                        <p style="color: #6B7280; margin: 0; font-size: 14px;">
                            Cảm ơn bạn đã tin tưởng Figuro!
                        </p>
                    </div>
                </div>
            `
        })
        console.log(`[EMAIL] ✅ Order status update email sent successfully to ${email}`)
    } catch (error) {
        console.error(`[EMAIL] ❌ Failed to send order status update email:`, error)
    }
} 