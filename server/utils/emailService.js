import path from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';
import dotenv from 'dotenv';

// Explicitly load .env file from the project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });


// Email configuration - in production, these should be environment variables
const emailConfig = {
  host: process.env.MAIL_HOST || process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.MAIL_PORT || process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_USER || process.env.SMTP_USER || '', // Your email
    pass: process.env.MAIL_PASS || process.env.SMTP_PASS || '', // Your email password or app password
  },
  // Add required Gmail settings for external recipients
  tls: {
    rejectUnauthorized: false
  },
  debug: true, // Enable debug output to help diagnose issues
  logger: true // Enable logging
};

// Create reusable transporter object using the default SMTP transport
let transporter = null;

const getTransporter = async () => {
  console.log('[EMAIL SERVICE] Initializing email transporter...');
  console.log('[EMAIL SERVICE] Email config:', JSON.stringify({
    host: emailConfig.host,
    port: emailConfig.port,
    secure: emailConfig.secure,
    auth: { user: emailConfig.auth.user ? `${emailConfig.auth.user.slice(0, 3)}***` : 'NOT SET' }
  }));

  if (!transporter) {
    try {
      const { createTransport } = await import('nodemailer');
      transporter = createTransport(emailConfig);
      console.log('[EMAIL SERVICE] Transporter created successfully');
    } catch (error) {
      console.error('[EMAIL SERVICE] Failed to create transporter:', error);
      throw error;
    }
  }
  return transporter;
};

// Email templates
const getLicenseEmailTemplate = (customerName, productName, licenseInfo, orderId = null) => {
  const { license_type, product_key, email, password, additional_info, notes, send_license, max_usage } = licenseInfo;
  
  let licenseContent = '';
  
  // Remove usage information display
  
  switch (license_type) {
    case 'product_key':
      licenseContent = `
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2c3e50; margin-top: 0;">Product License Key</h3>
          <p style="font-size: 18px; font-weight: bold; color: #e74c3c; font-family: monospace; background: white; padding: 15px; border: 2px dashed #3498db; border-radius: 5px; text-align: center;">
            ${product_key}
          </p>
          ${additional_info ? `<p><strong>Additional Information:</strong> ${additional_info}</p>` : ''}
          ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
        </div>
      `;
      break;
      
    case 'email_password':
      licenseContent = `
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2c3e50; margin-top: 0;">Account Credentials</h3>
          <div style="background: white; padding: 15px; border-radius: 5px; border: 1px solid #dee2e6;">
            <p><strong>Email:</strong> <span style="font-family: monospace; color: #2980b9;">${email}</span></p>
            <p><strong>Password:</strong> <span style="font-family: monospace; color: #e74c3c;">${password}</span></p>
          </div>
          ${additional_info ? `<p><strong>Additional Information:</strong> ${additional_info}</p>` : ''}
          ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
        </div>
      `;
      break;
  }
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Your ${productName} License</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; border-bottom: 3px solid #3498db; padding-bottom: 20px; margin-bottom: 30px;">
        <h1 style="color: #2c3e50; margin: 0;">Nixty</h1>
        <p style="color: #7f8c8d; margin: 5px 0;">Digital Software Solutions</p>
      </div>
      
      <h2 style="color: #2c3e50;">Thank you for your purchase!</h2>
      
      <p>Dear ${customerName},</p>
      
      <p>Thank you for purchasing <strong>${productName}</strong> from Nixty. Your payment has been successfully processed${orderId ? ` with Order ID: <strong>${orderId}</strong>` : ''}, and below are your license details:</p>
      
      ${licenseContent}
      
      <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
        <h4 style="color: #856404; margin-top: 0;">Installation & Usage Guide:</h4>
        <div style="background: #e8f4f8; border: 1px solid #bee5eb; border-radius: 5px; padding: 15px; margin: 10px 0;">
          <p style="margin: 0; color: #0c5460; font-weight: 600;">
            📁 <strong>Complete Installation Guide:</strong><br>
            <a href="https://drive.google.com/drive/folders/152-8EDjMmHhhKkTF4Fzj9EuqQ3OprfV0?usp=sharing" 
               style="color: #0366d6; text-decoration: none; font-size: 14px;"
               target="_blank">
              https://drive.google.com/drive/folders/152-8EDjMmHhhKkTF4Fzj9EuqQ3OprfV0?usp=sharing
            </a>
          </p>
        </div>
        <ol style="color: #856404; margin-bottom: 10px;">
          <li>Download the software from the official website or provided link</li>
          <li>Install the software following the installation wizard</li>
          <li>When prompted for activation, use the license information provided above</li>
          <li>For product keys: Copy and paste the key exactly as shown</li>
          <li>For account credentials: Use the email and password combination provided</li>
        </ol>
        <h4 style="color: #856404; margin-top: 15px;">Important Information:</h4>
        <ul style="color: #856404; margin-bottom: 0;">
          <li>Please save this email for your records</li>
          <li>Refer to the installation guide link above for step-by-step instructions</li>
          <li>Keep your license information secure and confidential</li>
          <li>Each license can only be used according to its terms and limitations</li>
          ${orderId ? `<li>Reference Order ID <strong>${orderId}</strong> for any support inquiries</li>` : ''}
          <li>For technical support, please contact our support team</li>
        </ul>
      </div>
      
      <div style="border-top: 1px solid #dee2e6; padding-top: 20px; margin-top: 30px; text-align: center; color: #6c757d; font-size: 14px;">
        <p>This email was sent from Nixty. If you have any questions, please contact our support team.</p>
        <p>© 2025 Nixty. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
};

// Template for multiple licenses
const getMultipleLicenseEmailTemplate = (customerName, productName, licenseInfoArray, orderId = null) => {
  let licenseContentArray = [];
  
  licenseInfoArray.forEach((licenseInfo, index) => {
    const { license_type, product_key, email, password, additional_info, notes, send_license, max_usage } = licenseInfo;
    
    // Remove usage information display
    
    let licenseContent = '';
    
    switch (license_type) {
      case 'product_key':
        licenseContent = `
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3498db;">
            <h4 style="color: #2c3e50; margin-top: 0;">Product Key #${index + 1}</h4>
            <p style="font-size: 16px; font-weight: bold; color: #e74c3c; font-family: monospace; background: white; padding: 12px; border: 2px dashed #3498db; border-radius: 5px; text-align: center;">
              ${product_key}
            </p>
            ${additional_info ? `<p><strong>Additional Information:</strong> ${additional_info}</p>` : ''}
            ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
          </div>
        `;
        break;
        
      case 'email_password':
        licenseContent = `
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #27ae60;">
            <h4 style="color: #2c3e50; margin-top: 0;">Account Credentials #${index + 1}</h4>
            <div style="background: white; padding: 15px; border-radius: 5px; border: 1px solid #dee2e6;">
              <p><strong>Email:</strong> <span style="font-family: monospace; color: #2980b9;">${email}</span></p>
              <p><strong>Password:</strong> <span style="font-family: monospace; color: #e74c3c;">${password}</span></p>
            </div>
            ${additional_info ? `<p><strong>Additional Information:</strong> ${additional_info}</p>` : ''}
            ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
          </div>
        `;
        break;
    }
    
    licenseContentArray.push(licenseContent);
  });
  
  const allLicenseContent = licenseContentArray.join('');
  const licenseCount = licenseInfoArray.length;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Your ${productName} License${licenseCount > 1 ? 's' : ''}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; border-bottom: 3px solid #3498db; padding-bottom: 20px; margin-bottom: 30px;">
        <h1 style="color: #2c3e50; margin: 0;">Nixty</h1>
        <p style="color: #7f8c8d; margin: 5px 0;">Digital Software Solutions</p>
      </div>
      
      <h2 style="color: #2c3e50;">Thank you for your purchase!</h2>
      
      <p>Dear ${customerName},</p>
      
      <p>Thank you for purchasing <strong>${productName}</strong> from Nixty. Your payment has been successfully processed${orderId ? ` with Order ID: <strong>${orderId}</strong>` : ''}, and below are your ${licenseCount} license${licenseCount > 1 ? 's' : ''}:</p>
      
      ${allLicenseContent}
      
      <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
        <h4 style="color: #856404; margin-top: 0;">Installation & Usage Guide:</h4>
        <div style="background: #e8f4f8; border: 1px solid #bee5eb; border-radius: 5px; padding: 15px; margin: 10px 0;">
          <p style="margin: 0; color: #0c5460; font-weight: 600;">
            📁 <strong>Complete Installation Guide:</strong><br>
            <a href="https://drive.google.com/drive/folders/152-8EDjMmHhhKkTF4Fzj9EuqQ3OprfV0?usp=sharing" 
               style="color: #0366d6; text-decoration: none; font-size: 14px;"
               target="_blank">
              https://drive.google.com/drive/folders/152-8EDjMmHhhKkTF4Fzj9EuqQ3OprfV0?usp=sharing
            </a>
          </p>
        </div>
        <ol style="color: #856404; margin-bottom: 10px;">
          <li>Download the software from the official website or provided link</li>
          <li>Install the software following the installation wizard</li>
          <li>When prompted for activation, choose the appropriate license from those provided above</li>
          <li>For product keys: Copy and paste each key exactly as shown</li>
          <li>For account credentials: Use the respective email and password combinations</li>
          <li>${licenseCount > 1 ? 'You can use different licenses for different installations or devices as per the terms' : 'Use this license for your installation'}</li>
        </ol>
        <h4 style="color: #856404; margin-top: 15px;">Important Information:</h4>
        <ul style="color: #856404; margin-bottom: 0;">
          <li>Please save this email for your records</li>
          <li>Refer to the installation guide link above for step-by-step instructions</li>
          <li>Keep your license information secure and confidential</li>
          <li>${licenseCount > 1 ? 'Each license can be used according to its individual terms and limitations' : 'Use this license according to its terms and limitations'}</li>
          ${orderId ? `<li>Reference Order ID <strong>${orderId}</strong> for any support inquiries</li>` : ''}
          <li>For technical support, please contact our support team</li>
        </ul>
      </div>
      
      <div style="border-top: 1px solid #dee2e6; padding-top: 20px; margin-top: 30px; text-align: center; color: #6c757d; font-size: 14px;">
        <p>This email was sent from Nixty. If you have any questions, please contact our support team.</p>
        <p>© 2025 Nixty. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
};

export const sendMultipleLicenseEmail = async (customerEmail, customerName, productName, licenseInfoArray, orderId = null, customEmail = null) => {
  try {
    console.log('[EMAIL SERVICE] Sending multiple license email');
    console.log(`[EMAIL SERVICE] Recipients: ${customerEmail}${customEmail ? ', ' + customEmail : ''}`);
    console.log(`[EMAIL SERVICE] Product: ${productName}, Order ID: ${orderId || 'N/A'}`);
    console.log(`[EMAIL SERVICE] Licenses count: ${licenseInfoArray.length}`);
    
    // Skip sending email if SMTP is not configured
    if (!emailConfig.auth.user || !emailConfig.auth.pass) {
      console.log('Email service not configured. Multiple licenses info:', licenseInfoArray);
      return { success: false, message: 'Email service not configured' };
    }
    
    // Validate email recipient (single email only)
    let finalRecipient = null;
    
    if (customerEmail && customerEmail.trim() !== '') {
      finalRecipient = customerEmail.trim();
    }
    
    // If customEmail is provided and different from customerEmail, it takes priority
    if (customEmail && customEmail.trim() !== '' && customEmail.trim() !== customerEmail?.trim()) {
      finalRecipient = customEmail.trim();
      console.log('[EMAIL SERVICE] Using custom email as priority recipient');
    }
    
    if (!finalRecipient) {
      console.error('[EMAIL SERVICE] No valid email recipients provided');
      await logEmailResult(orderId, 'No recipients', null, 'failed', 'No valid email recipients provided');
      return { success: false, error: 'No valid email recipients provided' };
    }
    
    console.log('[EMAIL SERVICE] Final recipient:', finalRecipient);
    
    const transporter = await getTransporter();

    const mailOptions = {
      from: `"no-reply@nixty" <${emailConfig.auth.user}>`,
      to: finalRecipient,
      subject: `Your ${productName} License${licenseInfoArray.length > 1 ? 's' : ''} ${orderId ? `- Order #${orderId}` : ''} - Nixty`,
      html: getMultipleLicenseEmailTemplate(customerName, productName, licenseInfoArray, orderId),
    };
    
    console.log('[EMAIL SERVICE] Sending email with options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      hasHTML: !!mailOptions.html
    });
    const info = await transporter.sendMail(mailOptions);
    console.log('Multiple license email sent successfully:', info.messageId);
    
    // Log successful email sending
    await logEmailResult(orderId, finalRecipient, null, 'success', null);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[EMAIL SERVICE] Error sending multiple license email:', error);
    console.error('[EMAIL SERVICE] Error details:', {
      code: error.code,
      command: error.command,
      message: error.message,
      stack: error.stack
    });
    
    // Log email failure
    try {
      await logEmailResult(orderId, finalRecipient || customerEmail || 'unknown', null, 'failed', error.message);
    } catch (logError) {
      console.error('[EMAIL SERVICE] Failed to log email error:', logError);
    }
    
    return { success: false, error: error.message };
  }
};

export const sendLicenseEmail = async (customerEmail, customerName, productName, licenseInfo, orderId = null, customEmail = null) => {
  try {
    console.log('[EMAIL SERVICE] Sending single license email');
    console.log(`[EMAIL SERVICE] Recipients: ${customerEmail}${customEmail ? ', ' + customEmail : ''}`);
    console.log(`[EMAIL SERVICE] Product: ${productName}, Order ID: ${orderId || 'N/A'}`);
    console.log(`[EMAIL SERVICE] License type: ${licenseInfo.license_type}`);
    
    // Skip sending email if SMTP is not configured
    if (!emailConfig.auth.user || !emailConfig.auth.pass) {
      console.log('Email service not configured. License info:', licenseInfo);
      return { success: false, message: 'Email service not configured' };
    }
    
    // Validate email recipient (single email only)
    let finalRecipient = null;
    
    if (customerEmail && customerEmail.trim() !== '') {
      finalRecipient = customerEmail.trim();
    }
    
    // If customEmail is provided and different from customerEmail, it takes priority
    if (customEmail && customEmail.trim() !== '' && customEmail.trim() !== customerEmail?.trim()) {
      finalRecipient = customEmail.trim();
      console.log('[EMAIL SERVICE] Using custom email as priority recipient');
    }
    
    if (!finalRecipient) {
      console.error('[EMAIL SERVICE] No valid email recipients provided');
      await logEmailResult(orderId, 'No recipients', null, 'failed', 'No valid email recipients provided');
      return { success: false, error: 'No valid email recipients provided' };
    }
    
    console.log('[EMAIL SERVICE] Final recipient:', finalRecipient);
    
    const transporter = await getTransporter();

    const mailOptions = {
      from: `"no-reply@nixty" <${emailConfig.auth.user}>`,
      to: finalRecipient,
      subject: `Your ${productName} License${orderId ? ` - Order #${orderId}` : ''} - Nixty`,
      html: getLicenseEmailTemplate(customerName, productName, licenseInfo, orderId),
    };
    
    console.log('[EMAIL SERVICE] Sending email with options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      hasHTML: !!mailOptions.html
    });
    const info = await transporter.sendMail(mailOptions);
    console.log('License email sent successfully:', info.messageId);
    
    // Log successful email sending
    await logEmailResult(orderId, finalRecipient, null, 'success', null);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[EMAIL SERVICE] Error sending license email:', error);
    console.error('[EMAIL SERVICE] Error details:', {
      code: error.code,
      command: error.command,
      message: error.message,
      stack: error.stack
    });
    
    // Log email failure
    try {
      await logEmailResult(orderId, finalRecipient || customerEmail || 'unknown', null, 'failed', error.message);
    } catch (logError) {
      console.error('[EMAIL SERVICE] Failed to log email error:', logError);
    }
    
    return { success: false, error: error.message };
  }
};

export const testEmailConnection = async () => {
  try {
    console.log('[EMAIL SERVICE] Testing email connection to', emailConfig.host);
    const transporter = await getTransporter();
    console.log('[EMAIL SERVICE] Verifying SMTP connection...');
    const verifyResult = await transporter.verify();
    console.log('[EMAIL SERVICE] Verification successful:', verifyResult);
    console.log('Email service is ready');
    return { success: true };
  } catch (error) {
    console.error('Email service connection failed:', error);
    return { success: false, error: error.message };
  }
};


import db from './db.js'; // Import your database utility

// Helper function to log email results
const logEmailResult = async (orderId, recipients, ccRecipient, status, errorMessage = null) => {
  try {
    await db.execute(
      `INSERT INTO nixty.email_logs (order_id, recipients, status, error_message) VALUES (?, ?, ?, ?)`,
      [orderId, recipients, status, errorMessage]
    );
  } catch (dbError) {
    console.error('[EMAIL SERVICE] Failed to log email result to database:', dbError.message);
  }
};
