import { f as db } from './nitro.mjs';

const getAvailableLicense = async (productId) => {
  try {
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
      return { success: false, message: "No available licenses for this product" };
    }
    return { success: true, license: licenses[0] };
  } catch (error) {
    console.error("Error getting available license:", error);
    return { success: false, error: error.message };
  }
};
const assignLicenseToTransaction = async (licenseId, transactionId) => {
  try {
    const [currentLicense] = await db.execute(
      `SELECT product_id, send_license, max_usage FROM product_licenses WHERE id = ?`,
      [licenseId]
    );
    if (currentLicense.length === 0) {
      return { success: false, error: "License not found" };
    }
    const license = currentLicense[0];
    const productId = license.product_id;
    const currentUsage = license.send_license || 0;
    const maxUsage = license.max_usage || 1;
    const newUsage = currentUsage + 1;
    if (newUsage > maxUsage) {
      return { success: false, error: "License usage limit exceeded" };
    }
    const newStatus = newUsage >= maxUsage ? "used" : "available";
    await db.execute(
      `UPDATE product_licenses 
       SET send_license = ?, status = ?, updated_at = NOW()
       WHERE id = ?`,
      [newUsage, newStatus, licenseId]
    );
    try {
      await db.execute(
        `INSERT INTO license_usage_history (license_id, transaction_id, used_at, usage_number)
         VALUES (?, ?, NOW(), ?)`,
        [licenseId, transactionId, newUsage]
      );
      console.log(`License usage history recorded for transaction ${transactionId}`);
    } catch (historyError) {
      console.warn(`Could not record license usage history: ${historyError.message}`);
    }
    console.log(`License ${licenseId} assigned to transaction ${transactionId} (usage ${newUsage}/${maxUsage})`);
    console.log(`License status updated to ${newStatus}`);
    return { success: true, send_license: newUsage, max_usage: maxUsage };
  } catch (error) {
    console.error("Error assigning license to transaction:", error);
    return { success: false, error: error.message };
  }
};
const getProductInfo = async (productId) => {
  try {
    const [products] = await db.execute(
      `SELECT id, name, version, price, image_url, license_type_default
       FROM products WHERE id = ?`,
      [productId]
    );
    if (products.length === 0) {
      return { success: false, message: "Product not found" };
    }
    return { success: true, product: products[0] };
  } catch (error) {
    console.error("Error getting product info:", error);
    return { success: false, error: error.message };
  }
};
const processLicenseDelivery = async (transactionId, productId, customerEmail, customerName) => {
  try {
    console.log(`Processing license delivery for transaction ${transactionId}`);
    const productResult = await getProductInfo(productId);
    if (!productResult.success) {
      return productResult;
    }
    const product = productResult.product;
    const productName = `${product.name} ${product.version || ""}`.trim();
    const licenseResult = await getAvailableLicense(productId);
    if (!licenseResult.success) {
      console.error(`No available license for product ${productId}:`, licenseResult.message);
      return licenseResult;
    }
    const license = licenseResult.license;
    console.log(`Selected license ${license.id} for transaction ${transactionId}`);
    const assignResult = await assignLicenseToTransaction(license.id, transactionId);
    if (!assignResult.success) {
      return assignResult;
    }
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
      productName,
      customerEmail,
      customerName
    };
  } catch (error) {
    console.error("Error processing license delivery:", error);
    return { success: false, error: error.message };
  }
};
const processMultipleLicenses = async (transactionId, productId, quantity, customerEmail, customerName) => {
  try {
    console.log(`Processing ${quantity} licenses for transaction ${transactionId}`);
    const productResult = await getProductInfo(productId);
    if (!productResult.success) {
      return productResult;
    }
    const product = productResult.product;
    const productName = `${product.name} ${product.version || ""}`.trim();
    const allLicenses = [];
    const processedLicenseIds = [];
    for (let i = 0; i < quantity; i++) {
      console.log(`Processing license ${i + 1}/${quantity}...`);
      const licenseResult = await getAvailableLicense(productId);
      if (!licenseResult.success) {
        console.error(`No available license ${i + 1} for product ${productId}:`, licenseResult.message);
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
      const assignResult = await assignLicenseToTransaction(license.id, transactionId);
      if (!assignResult.success) {
        console.error(`Failed to assign license ${license.id}:`, assignResult.error);
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
      productName,
      customerEmail,
      customerName
    };
  } catch (error) {
    console.error("Error processing multiple licenses:", error);
    return { success: false, error: error.message };
  }
};

export { processMultipleLicenses as a, processLicenseDelivery as p };
//# sourceMappingURL=licenseService.mjs.map
