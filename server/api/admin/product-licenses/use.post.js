import db from '../../../utils/db.js';

/**
 * POST /api/admin/product-licenses/use
 * Mark a license as used (increment usage count)
 */
export default defineEventHandler(async (event) => {
  try {
    // Check admin authentication
    const headers = getHeaders(event);
    const userId = headers['x-user-id'];
    const userEmail = headers['x-user-email'];
    
    if (!userId || !userEmail) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Admin authentication required'
      });
    }

    const body = await readBody(event);
    console.log('License usage request:', body);

    const { license_id, transaction_id } = body;

    if (!license_id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'license_id is required'
      });
    }

    // Get current license information
    const [licenseRows] = await db.query(`
      SELECT 
        pl.*,
        p.name as product_name,
        p.version as product_version
      FROM product_licenses pl
      JOIN products p ON pl.product_id = p.id
      WHERE pl.id = ?
    `, [license_id]);

    if (licenseRows.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'License not found'
      });
    }

    const license = licenseRows[0];

    // Check if license can be used
    if (license.send_license >= license.max_usage) {
      throw createError({
        statusCode: 400,
        statusMessage: 'License has reached maximum usage limit'
      });
    }

    if (license.expires_at && new Date(license.expires_at) < new Date()) {
      throw createError({
        statusCode: 400,
        statusMessage: 'License has expired'
      });
    }

    if (license.status === 'reserved' || license.status === 'expired') {
      throw createError({
        statusCode: 400,
        statusMessage: `License is ${license.status} and cannot be used`
      });
    }

    // Increment usage count
    
    
    // Determine new status
    let newStatus;
    if (newSendLicense >= license.max_usage) {
      newStatus = 'used';
    } else {
      newStatus = 'partially_used';
    }

    // Update the license
    const updateQuery = `
      UPDATE product_licenses 
      SET send_license = ?, status = ?,
        updated_at = NOW()
      WHERE id = ?
    `;

    await db.query(updateQuery, [
      newSendLicense,
      newSendLicense,
      newStatus,
      
      transaction_id || null,
      license_id
    ]);

    // Fetch updated license
    const [updatedLicense] = await db.query(`
      SELECT 
        pl.*,
        p.name as product_name,
        p.version as product_version,
        (pl.max_usage - pl.usage_count) as remaining_uses
      FROM product_licenses pl
      JOIN products p ON pl.product_id = p.id
      WHERE pl.id = ?
    `, [license_id]);

    console.log(`License ${license_id} used. Usage: ${newSendLicense}/${license.max_usage}, Status: ${newStatus}`);

    return {
      success: true,
      message: `License used successfully. ${license.max_usage - newSendLicense} uses remaining.`,
      data: {
        license: updatedLicense[0],
        usage_info: {
          previous_usage: license.send_license,
          new_usage: newSendLicense,
          max_usage: license.max_usage,
          remaining_uses: license.max_usage - newSendLicense,
          status_changed: license.status !== newStatus,
          previous_status: license.status,
          new_status: newStatus
        }
      }
    };

  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    
    console.error('Error using license:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to use license'
    });
  }
});
