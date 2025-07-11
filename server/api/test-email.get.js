import { defineEventHandler } from 'h3';
import { sendLicenseEmail, testEmailConnection } from '../utils/emailService.js';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const action = query.action || 'test-connection';
    
    if (action === 'test-connection') {
      // Test email connection
      const result = await testEmailConnection();
      return {
        success: result.success,
        message: result.success ? 'Email service is configured and ready' : 'Email service connection failed',
        error: result.error || null
      };
    }
    
    if (action === 'send-test') {
      // Send a test email
      const testEmail = query.email || 'test@example.com';
      const testLicense = {
        license_type: 'product_key',
        product_key: 'TEST-ABCD-EFGH-IJKL-MNOP',
        additional_info: 'This is a test license for Microsoft Office Pro Plus 2021',
        notes: 'Test license - valid for testing purposes only'
      };
      
      const result = await sendLicenseEmail(
        testEmail,
        'Test Customer',
        'Microsoft Office Pro Plus 2021 (Test)',
        testLicense
      );
      
      return {
        success: result.success,
        message: result.success ? 'Test email sent successfully' : 'Failed to send test email',
        messageId: result.messageId || null,
        error: result.error || null
      };
    }
    
    if (action === 'send-test-credentials') {
      // Send a test email with credentials
      const testEmail = query.email || 'test@example.com';
      const testLicense = {
        license_type: 'email_password',
        email: 'office365user@nixtystore.com',
        password: 'TestPassword123!',
        additional_info: 'Microsoft Office 365 - 1 Year Subscription',
        notes: 'Test credentials - includes 1TB OneDrive storage'
      };
      
      const result = await sendLicenseEmail(
        testEmail,
        'Test Customer',
        'Microsoft Office 365 (Test)',
        testLicense
      );
      
      return {
        success: result.success,
        message: result.success ? 'Test credentials email sent successfully' : 'Failed to send test email',
        messageId: result.messageId || null,
        error: result.error || null
      };
    }
    
    return {
      success: false,
      message: 'Invalid action. Available actions: test-connection, send-test, send-test-credentials',
      availableActions: [
        'test-connection - Test email service configuration',
        'send-test?email=your@email.com - Send test product key email',
        'send-test-credentials?email=your@email.com - Send test credentials email'
      ]
    };
    
  } catch (error) {
    console.error('Test email API error:', error);
    return {
      success: false,
      message: 'Test email API error',
      error: error.message
    };
  }
});
