# License Email Delivery System

This document explains the automatic license delivery system that sends product licenses or credentials to customers after successful payment.

## Features

### 1. Custom Email Field in Checkout
- Users can specify a custom email address for license delivery during checkout
- Email is automatically filled with user's account email if logged in
- Email validation ensures proper format
- Fallback to user's account email if custom email is not provided

### 2. License Types Supported
The system supports multiple license types:
- **Product Key**: License keys for software activation
- **Email/Password**: Account credentials for cloud services
- **Access Code**: Special access codes for services
- **Download Link**: Direct download links for digital products

### 3. Automatic Email Delivery
- Emails are sent automatically after successful payment confirmation
- Professional HTML email templates with company branding
- Includes all relevant license information based on product type
- Error handling to prevent payment notification failures

## Technical Implementation

### 1. Database Structure
```sql
-- Transactions table stores custom email in payment_gateway_payload
{
  "custom_email": "customer@example.com"
}

-- Product licenses are marked as used when assigned
UPDATE product_licenses 
SET status = 'used', 
    used_by_transaction_id = ?, 
    used_at = NOW()
WHERE id = ?
```

### 2. Email Service Configuration
Configure SMTP settings in your `.env` file:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### 3. Payment Flow Integration
1. Customer enters custom email during checkout
2. Payment initiated through Midtrans
3. Payment notification webhook receives success status
4. System automatically:
   - Finds available license for the product
   - Assigns license to transaction
   - Sends formatted email to customer
   - Updates license status to 'used'

## Email Templates

### Product Key Template
```html
<div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
  <h3>Product License Key</h3>
  <p style="font-family: monospace; font-size: 18px; color: #e74c3c;">
    XXXXX-XXXXX-XXXXX-XXXXX
  </p>
</div>
```

### Email/Password Template
```html
<div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
  <h3>Account Credentials</h3>
  <p><strong>Email:</strong> user@service.com</p>
  <p><strong>Password:</strong> SecurePassword123</p>
</div>
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

### 2. Configure Email Service
1. Copy `.env.example` to `.env`
2. Update SMTP configuration with your email provider settings
3. For Gmail, use App Passwords instead of regular password

### 3. Test Email Configuration
The system includes email connection testing:
```javascript
import { testEmailConnection } from '~/server/utils/emailService.js';
const result = await testEmailConnection();
console.log(result);
```

## Error Handling

### 1. No Available Licenses
- System logs error but doesn't fail payment
- Admin should be notified to add more licenses
- Customer receives payment confirmation but license delivery fails gracefully

### 2. Email Delivery Failure
- SMTP errors are logged but don't affect payment status
- System falls back to console logging of license information
- Failed deliveries can be retried manually

### 3. Configuration Issues
- Missing SMTP configuration results in console logging only
- Invalid email formats are validated before payment
- Database errors are logged and handled gracefully

## Security Considerations

### 1. Email Protection
- License information is sent via secure SMTP
- Emails include security warnings
- Customer data is handled according to privacy standards

### 2. License Management
- Licenses are immediately marked as 'used' when assigned
- Transaction IDs are logged for audit trails
- No duplicate license assignments possible

### 3. Error Information
- Sensitive information is not exposed in error messages
- Failed operations are logged securely
- Customer emails are validated and sanitized

## Monitoring and Maintenance

### 1. License Stock Monitoring
- Monitor available license counts per product
- Set up alerts for low stock situations
- Regular cleanup of expired licenses

### 2. Email Delivery Monitoring
- Log all email delivery attempts
- Monitor SMTP connection health
- Track failed delivery rates

### 3. Customer Support
- Email delivery confirmations logged
- License assignment audit trail available
- Customer inquiry handling procedures

## Customization

### 1. Email Templates
Modify email templates in `server/utils/emailService.js`:
- Update branding and styling
- Add additional product information
- Customize security warnings

### 2. License Logic
Customize license assignment in `server/utils/licenseService.js`:
- Add business-specific rules
- Implement license priority systems
- Add expiration handling

### 3. Notification Flow
Extend the notification webhook in `server/api/midtrans/notification.post.js`:
- Add additional payment gateways
- Implement retry mechanisms
- Add admin notifications
