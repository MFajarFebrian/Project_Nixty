import db from './db.js';

export const getAvailableLicense = async (productId) => {
  try {
    // Get an available license for the product
    // Priority: licenses with send_license < max_usage, then completely unused ones
    const [licenses] = await db.execute(
      `SELECT * FROM product_licenses 
       WHERE product_id = ? 
         AND status = 'available' 
         AND (send_license < max_usage OR send_license IS NULL)
       ORDER BY 
         CASE WHEN send_license IS NULL OR send_license = 0 THEN 0 ELSE 1 END,
         send_license ASC,
         created_at ASC 
       LIMIT 1`,
      [productId]
    );
    
    if (licenses.length === 0) {
      return { success: false, message: 'No available licenses for this product' };
    }
    
    return { success: true, license: licenses[0] };
  } catch (error) {
    console.error('Error getting available license:', error);
    return { success: false, error: error.message };
  }
};

export const assignLicenseToTransaction = async (licenseId, transactionId) => {
  try {
    // First, get current license info
    const [currentLicense] = await db.execute(
      `SELECT send_license, max_usage FROM product_licenses WHERE id = ?`,
      [licenseId]
    );
    
    if (currentLicense.length === 0) {
      return { success: false, error: 'License not found' };
    }
    
    const license = currentLicense[0];
    const currentUsage = license.send_license || 0;
    const maxUsage = license.max_usage || 1;
    const newUsage = currentUsage + 1;
    
    // Check if license can still be used
    if (newUsage > maxUsage) {
      return { success: false, error: 'License usage limit exceeded' };
    }
    
    // Update license usage count and status
    const newStatus = newUsage >= maxUsage ? 'used' : 'available';
    
    await db.execute(
      `UPDATE product_licenses 
       SET send_license = ?,
           status = ?,
           is_used = CASE WHEN ? >= max_usage THEN 1 ELSE 0 END,
           updated_at = NOW()
       WHERE id = ?`,
      [newUsage, newStatus, newUsage, licenseId]
    );
    
    // Create a license usage record to track which transaction used this license
    try {
      await db.execute(
        `INSERT INTO license_usage_history (license_id, transaction_id, used_at, usage_number)
         VALUES (?, ?, NOW(), ?)`,
        [licenseId, transactionId, newUsage]
      );
    } catch (historyError) {
      console.log('Warning: Could not create usage history record:', historyError.message);
      // Continue without failing - the main license update is more important
    }
    
    console.log(`License ${licenseId} assigned to transaction ${transactionId} (usage ${newUsage}/${maxUsage})`);
    return { success: true, usage_count: newUsage, max_usage: maxUsage };
  } catch (error) {
    console.error('Error assigning license to transaction:', error);
    return { success: false, error: error.message };
  }
};

export const getProductInfo = async (productId) => {
  try {
    const [products] = await db.execute(
      `SELECT p.*, c.name as category_name 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id 
       WHERE p.id = ?`,
      [productId]
    );
    
    if (products.length === 0) {
      return { success: false, message: 'Product not found' };
    }
    
    return { success: true, product: products[0] };
  } catch (error) {
    console.error('Error getting product info:', error);
    return { success: false, error: error.message };
  }
};

export const processLicenseDelivery = async (transactionId, productId, customerEmail, customerName) => {
  try {
    console.log(`Processing license delivery for transaction ${transactionId}`);
    
    // Get product information
    const productResult = await getProductInfo(productId);
    if (!productResult.success) {
      return productResult;
    }
    
    const product = productResult.product;
    const productName = `${product.name} ${product.version || ''}`.trim();
    
    // Get available license
    const licenseResult = await getAvailableLicense(productId);
    if (!licenseResult.success) {
      console.error(`No available license for product ${productId}:`, licenseResult.message);
      return licenseResult;
    }
    
    const license = licenseResult.license;
    
    // Assign license to transaction
    const assignResult = await assignLicenseToTransaction(license.id, transactionId);
    if (!assignResult.success) {
      return assignResult;
    }
    
    // Prepare license info for email
    const licenseInfo = {
      license_type: license.license_type,
      product_key: license.product_key,
      email: license.email,
      password: license.password,
      additional_info: license.additional_info,
      notes: license.notes
    };
    
    console.log(`License ${license.id} prepared for delivery to ${customerEmail}`);
    
    return {
      success: true,
      license: licenseInfo,
      productName: productName,
      customerEmail: customerEmail,
      customerName: customerName
    };
    
  } catch (error) {
    console.error('Error processing license delivery:', error);
    return { success: false, error: error.message };
  }
};

export const updateTransactionWithLicense = async (transactionId, licenseId) => {
  try {
    // Add a field to track which license was assigned to the transaction
    await db.execute(
      `UPDATE transactions 
       SET payment_gateway_payload = JSON_SET(
         COALESCE(payment_gateway_payload, '{}'),
         '$.assigned_license_id', ?
       ),
       updated_at = NOW()
       WHERE id = ?`,
      [licenseId, transactionId]
    );
    
    console.log(`Transaction ${transactionId} updated with license ${licenseId}`);
    return { success: true };
  } catch (error) {
    console.error('Error updating transaction with license:', error);
    return { success: false, error: error.message };
  }
};
