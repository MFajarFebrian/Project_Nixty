import { testEmailConnection, sendLicenseEmail } from '../../utils/emailService.js';

export default defineEventHandler(async (event) => {
  try {
    // Test email connection
    const connectionTest = await testEmailConnection();
    
    if (!connectionTest.success) {
      return {
        success: false,
        message: 'Failed to connect to email service',
        error: connectionTest.error
      };
    }
    
    // Send test email
    const testLicense = {
      license_type: 'product_key',
      product_key: 'TEST-KEY-12345-ABCDE',
      send_license: 1,
      max_usage: 1,
      additional_info: 'This is a test email to verify email configuration.',
      notes: 'Test email sent from Nixty admin panel.'
    };
    
    const emailTest = await sendLicenseEmail(
      'nixtydemo@gmail.com', // Send test email to same address
      'Admin Test',
      'Test Product License',
      testLicense,
      'TEST-ORDER-001',
      null // no custom email
    );
    
    if (emailTest.success) {
      return {
        success: true,
        message: 'Email service is working correctly',
        details: {
          connection: 'OK',
          testEmail: 'Sent successfully',
          messageId: emailTest.messageId
        }
      };
    } else {
      return {
        success: false,
        message: 'Email connection OK but sending failed',
        error: emailTest.error
      };
    }
    
  } catch (error) {
    console.error('Email test error:', error);
    return {
      success: false,
      message: 'Email test failed',
      error: error.message
    };
  }
});
