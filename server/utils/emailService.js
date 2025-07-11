import nodemailer from 'nodemailer';

// Email configuration - in production, these should be environment variables
const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || '', // Your email
    pass: process.env.SMTP_PASS || '', // Your email password or app password
  },
};

// Create reusable transporter object using the default SMTP transport
let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransporter(emailConfig);
  }
  return transporter;
};

// Email templates
const getLicenseEmailTemplate = (customerName, productName, licenseInfo) => {
  const { license_type, product_key, email, password, additional_info, notes } = licenseInfo;
  
  let licenseContent = '';
  
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
        <h1 style="color: #2c3e50; margin: 0;">Nixty Store</h1>
        <p style="color: #7f8c8d; margin: 5px 0;">Digital Software Solutions</p>
      </div>
      
      <h2 style="color: #2c3e50;">Thank you for your purchase!</h2>
      
      <p>Dear ${customerName},</p>
      
      <p>Thank you for purchasing <strong>${productName}</strong> from Nixty Store. Your payment has been successfully processed, and below are your license details:</p>
      
      ${licenseContent}
      
      <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
        <h4 style="color: #856404; margin-top: 0;">Important Information:</h4>
        <ul style="color: #856404; margin-bottom: 0;">
          <li>Please save this email for your records</li>
          <li>Keep your license information secure and confidential</li>
          <li>For technical support, please contact our support team</li>
        </ul>
      </div>
      
      <div style="border-top: 1px solid #dee2e6; padding-top: 20px; margin-top: 30px; text-align: center; color: #6c757d; font-size: 14px;">
        <p>This email was sent from Nixty Store. If you have any questions, please contact our support team.</p>
        <p>© 2025 Nixty Store. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
};

// Template for multiple licenses
const getMultipleLicenseEmailTemplate = (customerName, productName, licenseInfoArray) => {
  let licenseContentArray = [];
  
  licenseInfoArray.forEach((licenseInfo, index) => {
    const { license_type, product_key, email, password, additional_info, notes } = licenseInfo;
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
        <h1 style="color: #2c3e50; margin: 0;">Nixty Store</h1>
        <p style="color: #7f8c8d; margin: 5px 0;">Digital Software Solutions</p>
      </div>
      
      <h2 style="color: #2c3e50;">Thank you for your purchase!</h2>
      
      <p>Dear ${customerName},</p>
      
      <p>Thank you for purchasing <strong>${productName}</strong> from Nixty Store. Your payment has been successfully processed, and below are your ${licenseCount} license${licenseCount > 1 ? 's' : ''}:</p>
      
      ${allLicenseContent}
      
      <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
        <h4 style="color: #856404; margin-top: 0;">Important Information:</h4>
        <ul style="color: #856404; margin-bottom: 0;">
          <li>Please save this email for your records</li>
          <li>Keep your license information secure and confidential</li>
          <li>${licenseCount > 1 ? 'Each license can be used according to its terms' : 'Use this license according to its terms'}</li>
          <li>For technical support, please contact our support team</li>
        </ul>
      </div>
      
      <div style="border-top: 1px solid #dee2e6; padding-top: 20px; margin-top: 30px; text-align: center; color: #6c757d; font-size: 14px;">
        <p>This email was sent from Nixty Store. If you have any questions, please contact our support team.</p>
        <p>© 2025 Nixty Store. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
};

export const sendMultipleLicenseEmail = async (customerEmail, customerName, productName, licenseInfoArray) => {
  try {
    // Skip sending email if SMTP is not configured
    if (!emailConfig.auth.user || !emailConfig.auth.pass) {
      console.log('Email service not configured. Multiple licenses info:', licenseInfoArray);
      return { success: false, message: 'Email service not configured' };
    }
    
    const transporter = getTransporter();
    
    const mailOptions = {
      from: `"Nixty Store" <${emailConfig.auth.user}>`,
      to: customerEmail,
      subject: `Your ${productName} License${licenseInfoArray.length > 1 ? 's' : ''} - Nixty Store`,
      html: getMultipleLicenseEmailTemplate(customerName, productName, licenseInfoArray),
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Multiple license email sent successfully:', info.messageId);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending multiple license email:', error);
    return { success: false, error: error.message };
  }
};

export const sendLicenseEmail = async (customerEmail, customerName, productName, licenseInfo) => {
  try {
    // Skip sending email if SMTP is not configured
    if (!emailConfig.auth.user || !emailConfig.auth.pass) {
      console.log('Email service not configured. License info:', licenseInfo);
      return { success: false, message: 'Email service not configured' };
    }
    
    const transporter = getTransporter();
    
    const mailOptions = {
      from: `"Nixty Store" <${emailConfig.auth.user}>`,
      to: customerEmail,
      subject: `Your ${productName} License - Nixty Store`,
      html: getLicenseEmailTemplate(customerName, productName, licenseInfo),
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('License email sent successfully:', info.messageId);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending license email:', error);
    return { success: false, error: error.message };
  }
};

export const testEmailConnection = async () => {
  try {
    const transporter = getTransporter();
    await transporter.verify();
    console.log('Email service is ready');
    return { success: true };
  } catch (error) {
    console.error('Email service connection failed:', error);
    return { success: false, error: error.message };
  }
};
