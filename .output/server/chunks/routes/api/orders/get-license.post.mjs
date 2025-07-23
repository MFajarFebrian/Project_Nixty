import { c as defineEventHandler, r as readBody, e as createError, f as db } from '../../../_/nitro.mjs';
import { r as requireAuth } from '../../../_/auth.mjs';
import { p as processLicenseDelivery } from '../../../_/licenseService.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'chokidar';
import 'anymatch';
import 'node:crypto';
import 'node:url';
import 'mysql2/promise';
import 'pg';

const getLicense_post = defineEventHandler(async (event) => {
  var _a;
  try {
    const user = await requireAuth(event);
    const body = await readBody(event);
    const { transactionId } = body;
    if (!transactionId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Transaction ID is required"
      });
    }
    const [transactions] = await db.execute(
      `SELECT 
        t.id, 
        t.product_id,
        t.product_name,
        t.customer_name,
        t.email,
        t.status,
        t.payment_gateway_status
      FROM transactions t
      WHERE t.id = ? AND t.user_id = ?`,
      [transactionId, user.id]
    );
    if (transactions.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Transaction not found"
      });
    }
    const transaction = transactions[0];
    const isCompleted = transaction.status === "completed" || ["settlement", "capture"].includes((_a = transaction.payment_gateway_status) == null ? void 0 : _a.toLowerCase());
    if (!isCompleted) {
      throw createError({
        statusCode: 400,
        statusMessage: "Transaction is not completed yet"
      });
    }
    console.log(`Manual license retrieval for transaction ${transactionId}`);
    const quantity = transaction.quantity || 1;
    const allLicenses = [];
    await db.execute("START TRANSACTION");
    try {
      for (let i = 0; i < quantity; i++) {
        console.log(`Processing license ${i + 1}/${quantity}...`);
        const licenseResult = await processLicenseDelivery(
          transaction.id,
          transaction.product_id,
          transaction.email,
          transaction.customer_name || "Customer"
        );
        if (licenseResult.success) {
          allLicenses.push(licenseResult.license);
          console.log(`License ${i + 1} processed successfully`);
          try {
            const [licenseInfoResult] = await db.execute(
              `SELECT license_info FROM transactions WHERE id = ?`,
              [transaction.id]
            );
            if (!licenseInfoResult[0].license_info) {
              const licenseArray = [licenseResult.license];
              await db.execute(
                `UPDATE transactions SET license_info = ? WHERE id = ?`,
                [JSON.stringify(licenseArray), transaction.id]
              );
            } else {
              let existingLicenses = [];
              try {
                existingLicenses = JSON.parse(licenseInfoResult[0].license_info);
                if (!Array.isArray(existingLicenses)) {
                  existingLicenses = [existingLicenses];
                }
              } catch (parseError) {
                console.error(`Error parsing existing license_info:`, parseError);
                existingLicenses = [];
              }
              existingLicenses.push(licenseResult.license);
              await db.execute(
                `UPDATE transactions SET license_info = ? WHERE id = ?`,
                [JSON.stringify(existingLicenses), transaction.id]
              );
            }
            console.log(`License ${i + 1} stored in transaction record`);
          } catch (licenseStoreError) {
            console.error(`Failed to store license info:`, licenseStoreError);
          }
        } else {
          throw new Error(`Failed to process license ${i + 1}: ${licenseResult.error || licenseResult.message}`);
        }
      }
      await db.execute("COMMIT");
      const [updatedTransaction] = await db.execute(
        `SELECT license_info FROM transactions WHERE id = ?`,
        [transaction.id]
      );
      let licenseInfo = null;
      if (updatedTransaction.length > 0 && updatedTransaction[0].license_info) {
        try {
          licenseInfo = JSON.parse(updatedTransaction[0].license_info);
        } catch (e) {
          console.error("Error parsing license_info:", e);
        }
      }
      return {
        success: true,
        message: "License retrieved successfully",
        license: licenseInfo || allLicenses
      };
    } catch (error) {
      await db.execute("ROLLBACK");
      console.error("Error processing license delivery:", error);
      throw createError({
        statusCode: 500,
        statusMessage: error.message || "Failed to process license"
      });
    }
  } catch (error) {
    console.error("Error retrieving license:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to retrieve license"
    });
  }
});

export { getLicense_post as default };
//# sourceMappingURL=get-license.post.mjs.map
