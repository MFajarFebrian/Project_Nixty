import pool from '../../../utils/db';

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
    const [licenseRows] = await pool.execute(`
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
    if (license.usage_count >= license.max_usage) {
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
    const newUsageCount = license.usage_count + 1;
    
    // Determine new status
    let newStatus;
    if (newUsageCount >= license.max_usage) {
      newStatus = 'used';
    } else {
      newStatus = 'partially_used';
    }

    // Update the license
    const updateQuery = `
      UPDATE product_licenses 
      SET 
        usage_count = ?,
        status = ?,
        is_used = ?,
        used_by_transaction_id = ?,
        used_at = NOW(),
        updated_at = NOW()
      WHERE id = ?
    `;

    await pool.execute(updateQuery, [
      newUsageCount,
      newStatus,
      newUsageCount >= license.max_usage ? 1 : 0,
      transaction_id || null,
      license_id
    ]);

    // Fetch updated license
    const [updatedLicense] = await pool.execute(`
      SELECT 
        pl.*,
        p.name as product_name,
        p.version as product_version,
        (pl.max_usage - pl.usage_count) as remaining_uses
      FROM product_licenses pl
      JOIN products p ON pl.product_id = p.id
      WHERE pl.id = ?
    `, [license_id]);

    console.log(`License ${license_id} used. Usage: ${newUsageCount}/${license.max_usage}, Status: ${newStatus}`);

    return {
      success: true,
      message: `License used successfully. ${license.max_usage - newUsageCount} uses remaining.`,
      data: {
        license: updatedLicense[0],
        usage_info: {
          previous_usage: license.usage_count,
          new_usage: newUsageCount,
          max_usage: license.max_usage,
          remaining_uses: license.max_usage - newUsageCount,
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
