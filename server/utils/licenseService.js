import db from './db.js';

export const getAvailableLicense = async (productId) => {
  try {
    // Get an available license for the product with row-level locking
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
       LIMIT 1
       FOR UPDATE SKIP LOCKED`,
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
      `SELECT product_id, send_license, max_usage FROM product_licenses WHERE id = ?`,
      [licenseId]
    );
    
    if (currentLicense.length === 0) {
      return { success: false, error: 'License not found' };
    }
    
    const license = currentLicense[0];
    const productId = license.product_id;
    const currentUsage = license.send_license || 0;
    const maxUsage = license.max_usage || 1;
    const newUsage = currentUsage + 1;
    
    // Check if license can still be used
    if (newUsage > maxUsage) {
      return { success: false, error: 'License usage limit exceeded' };
    }
    
    // Update license usage count and status
    const newStatus = newUsage >= maxUsage ? 'used' : 'available';
    
    // Update the license record
    await db.execute(
      `UPDATE product_licenses 
       SET send_license = ?, status = ?, updated_at = NOW()
       WHERE id = ?`,
      [newUsage, newStatus, licenseId]
    );
    
    // Create a license usage record to track which transaction used this license
    // Check if license_usage_history table exists first
    try {
      await db.execute(
        `INSERT INTO license_usage_history (license_id, transaction_id, used_at, usage_number)
         VALUES (?, ?, NOW(), ?)`,
        [licenseId, transactionId, newUsage]
      );
      console.log(`License usage history recorded for transaction ${transactionId}`);
    } catch (historyError) {
      // If license_usage_history table doesn't exist, that's okay - continue without it
      console.warn(`Could not record license usage history: ${historyError.message}`);
    }
    
    console.log(`License ${licenseId} assigned to transaction ${transactionId} (usage ${newUsage}/${maxUsage})`);
    console.log(`License status updated to ${newStatus}`);
    
    return { success: true, send_license: newUsage, max_usage: maxUsage };
  } catch (error) {
    console.error('Error assigning license to transaction:', error);
    return { success: false, error: error.message };
  }
};

export const getProductInfo = async (productId) => {
  try {
    const [products] = await db.execute(
      `SELECT id, name, version, price, image_url, license_type_default
       FROM products WHERE id = ?`,
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
    
    // Get available license with locking
    const licenseResult = await getAvailableLicense(productId);
    if (!licenseResult.success) {
      console.error(`No available license for product ${productId}:`, licenseResult.message);
      return licenseResult;
    }
    
    const license = licenseResult.license;
    console.log(`Selected license ${license.id} for transaction ${transactionId}`);
    
    // Assign license to transaction
    const assignResult = await assignLicenseToTransaction(license.id, transactionId);
    if (!assignResult.success) {
      return assignResult;
    }
    
    // Prepare license info for email
    const licenseInfo = {
      license_id: license.id,
      license_type: license.license_type,
      product_key: license.product_key,
      email: license.email,
      password: license.password,
      additional_info: license.additional_info,
      notes: license.notes,
      send_license: assignResult.send_license || 1,
      max_usage: license.max_usage || 1,
      expires_at: license.expires_at
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

// New function to process multiple licenses atomically
export const processMultipleLicenses = async (transactionId, productId, quantity, customerEmail, customerName) => {
  try {
    console.log(`Processing ${quantity} licenses for transaction ${transactionId}`);
    
    // Get product information
    const productResult = await getProductInfo(productId);
    if (!productResult.success) {
      return productResult;
    }
    
    const product = productResult.product;
    const productName = `${product.name} ${product.version || ''}`.trim();
    
    const allLicenses = [];
    const processedLicenseIds = [];
    
    // Process each license sequentially to avoid race conditions
    for (let i = 0; i < quantity; i++) {
      console.log(`Processing license ${i + 1}/${quantity}...`);
      
      // Get available license with locking
      const licenseResult = await getAvailableLicense(productId);
      if (!licenseResult.success) {
        console.error(`No available license ${i + 1} for product ${productId}:`, licenseResult.message);
        // Rollback any processed licenses
        for (const licenseId of processedLicenseIds) {
          await db.execute(
            `UPDATE product_licenses SET send_license = send_license - 1, 
             status = CASE WHEN send_license - 1 < max_usage THEN 'available' ELSE status END 
             WHERE id = ?`,
            [licenseId]
          );
        }
        return { success: false, message: `Only ${i} licenses available, but ${quantity} requested` };
      }
      
      const license = licenseResult.license;
      console.log(`Selected license ${license.id} for transaction ${transactionId} (${i + 1}/${quantity})`);
      
      // Assign license to transaction
      const assignResult = await assignLicenseToTransaction(license.id, transactionId);
      if (!assignResult.success) {
        console.error(`Failed to assign license ${license.id}:`, assignResult.error);
        // Rollback any processed licenses
        for (const licenseId of processedLicenseIds) {
          await db.execute(
            `UPDATE product_licenses SET send_license = send_license - 1, 
             status = CASE WHEN send_license - 1 < max_usage THEN 'available' ELSE status END 
             WHERE id = ?`,
            [licenseId]
          );
        }
        return assignResult;
      }
      
      // Prepare license info for email
      const licenseInfo = {
        license_id: license.id,
        license_type: license.license_type,
        product_key: license.product_key,
        email: license.email,
        password: license.password,
        additional_info: license.additional_info,
        notes: license.notes,
        send_license: assignResult.send_license || 1,
        max_usage: license.max_usage || 1,
        expires_at: license.expires_at
      };
      
      allLicenses.push(licenseInfo);
      processedLicenseIds.push(license.id);
      
      console.log(`License ${license.id} processed successfully (${i + 1}/${quantity})`);
    }
    
    console.log(`Successfully processed ${allLicenses.length} licenses for transaction ${transactionId}`);
    
    return {
      success: true,
      licenses: allLicenses,
      productName: productName,
      customerEmail: customerEmail,
      customerName: customerName
    };
    
  } catch (error) {
    console.error('Error processing multiple licenses:', error);
    return { success: false, error: error.message };
  }
};

export const updateTransactionWithLicense = async (transactionId, licenseId) => {
  try {
    // First get the license details
    const [licenses] = await db.execute(
      `SELECT * FROM product_licenses WHERE id = ?`,
      [licenseId]
    );
    
    if (licenses.length === 0) {
      return { success: false, error: 'License not found' };
    }
    
    const license = licenses[0];
    
    // Prepare license info object
    const licenseInfo = {
      license_id: licenseId,
      license_type: license.license_type,
      product_key: license.product_key,
      email: license.email,
      password: license.password,
      additional_info: license.additional_info,
      notes: license.notes,
      expires_at: license.expires_at
    };
    
    // Get existing license_info to append to it
    const [currentTransaction] = await db.execute(
      'SELECT license_info FROM transactions WHERE id = ?',
      [transactionId]
    );
    
    let allLicenses = [];
    
    // If there's existing license_info, parse it
    if (currentTransaction[0]?.license_info) {
      try {
        const existing = JSON.parse(currentTransaction[0].license_info);
        allLicenses = Array.isArray(existing) ? existing : [existing];
      } catch (e) {
        console.warn('Could not parse existing license_info, starting fresh');
        allLicenses = [];
      }
    }
    
    // Add the new license to the array
    allLicenses.push(licenseInfo);
    
    // Update the transaction with the combined license info
    await db.execute(
      `UPDATE transactions SET license_info = ?, updated_at = NOW() WHERE id = ?`,
      [JSON.stringify(allLicenses), transactionId]
    );
    
    console.log(`Transaction ${transactionId} updated with license ${licenseId}`);
    return { success: true };
  } catch (error) {
    console.error('Error updating transaction with license:', error);
    return { success: false, error: error.message };
  }
};
