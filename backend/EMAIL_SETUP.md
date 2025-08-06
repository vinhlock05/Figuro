# Email Notifications Setup

## Overview
The Figuro e-commerce platform includes comprehensive email notification functionality for order management and user communication.

## Features Implemented

### ✅ **Email Notifications Available:**

1. **User Registration & Authentication:**
   - Email verification (OTP code)
   - Password reset emails

2. **Order Management:**
   - Order confirmation emails (when order is placed)
   - Order status update emails (when status changes)
   - Cancellation notifications

3. **Email Templates:**
   - Professional HTML templates in Vietnamese
   - Responsive design
   - Branded with Figuro colors

## Setup Instructions

### 1. **Resend Email Service Setup**

1. **Sign up for Resend:**
   - Go to [resend.com](https://resend.com)
   - Create a free account
   - Verify your domain or use Resend's sandbox domain

2. **Get API Key:**
   - Navigate to API Keys in your Resend dashboard
   - Create a new API key
   - Copy the API key

3. **Configure Environment Variables:**
   ```bash
   # Add to your .env file
   RESEND_API_KEY="your_resend_api_key_here"
   RESEND_FROM_EMAIL="Figuro <noreply@figuro.com>"
   ```

### 2. **Email Configuration**

The system uses the following email addresses:
- **From Email:** `noreply@figuro.com` (configurable via `RESEND_FROM_EMAIL`)
- **Reply-to:** Support email (can be configured)

### 3. **Testing Email Notifications**

#### **Development Mode:**
When `RESEND_API_KEY` is not configured, the system will:
- Log email requests to console
- Show what would be sent
- Not actually send emails

#### **Production Mode:**
When `RESEND_API_KEY` is configured:
- Real emails will be sent
- All notifications are logged
- Error handling is in place

## Email Types & Triggers

### **Order Confirmation Email**
- **Trigger:** When user places an order
- **Content:** Order details, items, total price, shipping info
- **Template:** Professional order confirmation

### **Order Status Update Emails**
- **Triggers:** When order status changes
- **Statuses:** confirmed, processing, shipped, delivered, cancelled
- **Content:** Status update, tracking info, estimated delivery

### **User Authentication Emails**
- **Email Verification:** OTP code for registration
- **Password Reset:** Reset link with token

## Email Templates

All email templates are:
- **Localized:** Vietnamese language
- **Responsive:** Mobile-friendly design
- **Branded:** Figuro colors and styling
- **Professional:** Clean, modern design

## Configuration Options

### **Environment Variables:**
```bash
# Required for email sending
RESEND_API_KEY="your_api_key"

# Optional - defaults to "yourname@resend.dev"
RESEND_FROM_EMAIL="Figuro <noreply@figuro.com>"

# Frontend URL for links
FRONTEND_URL="http://localhost:5173"
```

### **Email Content Customization:**
- Templates are in `backend/src/utils/notify.ts`
- HTML templates can be customized
- Colors and branding can be modified

## Monitoring & Logging

### **Console Logs:**
```
[EMAIL] ✅ Order Confirmation Request
[EMAIL] 📧 To: user@example.com
[EMAIL] 🛒 Order ID: 123
[EMAIL] ✅ Order confirmation email sent successfully to user@example.com
```

### **Error Handling:**
- Failed emails are logged but don't break the application
- Graceful fallback when email service is unavailable
- Detailed error messages for debugging

## Future Enhancements

### **Planned Features:**
- SMS notifications for critical updates
- Email preferences in user settings
- Newsletter subscription
- Abandoned cart reminders
- Product availability notifications

### **SMS Integration:**
- Twilio integration for SMS
- Order status SMS notifications
- Delivery updates via SMS

## Troubleshooting

### **Common Issues:**

1. **Emails not sending:**
   - Check `RESEND_API_KEY` is set
   - Verify domain is configured in Resend
   - Check console logs for errors

2. **Emails going to spam:**
   - Configure SPF/DKIM records
   - Use verified domain
   - Monitor email reputation

3. **Template issues:**
   - Check HTML syntax in templates
   - Verify image URLs are accessible
   - Test responsive design

### **Testing:**
```bash
# Test email functionality
npm run dev
# Place an order to trigger confirmation email
# Check console logs for email status
```

## Security Considerations

- API keys are stored in environment variables
- No sensitive data in email content
- HTTPS required for production
- Rate limiting on email sending
- User consent for marketing emails

## Support

For email-related issues:
1. Check console logs for error messages
2. Verify Resend configuration
3. Test with different email addresses
4. Review email templates for syntax errors 