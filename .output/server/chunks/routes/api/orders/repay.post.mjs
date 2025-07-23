import { c as defineEventHandler, r as readBody, e as createError, f as db, n as midtransConfig } from '../../../_/nitro.mjs';
import { r as requireAuth } from '../../../_/auth.mjs';
import midtransClient from 'midtrans-client';
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

const repay_post = defineEventHandler(async (event) => {
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
        t.order_id,
        t.product_id,
        t.product_name,
        t.customer_name,
        t.email,
        t.amount,
        t.quantity,
        t.status,
        t.payment_gateway_status
      FROM transactions t
      WHERE t.order_id = ? AND t.user_id = ?`,
      [transactionId, user.id]
    );
    if (transactions.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Transaction not found"
      });
    }
    const transaction = transactions[0];
    const validStatuses = ["pending", "expire", "cancel", "failed"];
    const isValidForRepayment = validStatuses.includes(transaction.status.toLowerCase()) || validStatuses.includes((_a = transaction.payment_gateway_status) == null ? void 0 : _a.toLowerCase());
    if (!isValidForRepayment) {
      throw createError({
        statusCode: 400,
        statusMessage: "This transaction cannot be repaid. It may be already completed or in an invalid state."
      });
    }
    if (!midtransConfig.serverKey) ;
    let snap = new midtransClient.Snap({
      isProduction: midtransConfig.isProduction,
      serverKey: midtransConfig.serverKey
    });
    const newOrderId = `${transaction.order_id}-repay-${Date.now()}`;
    const transactionDetails = {
      order_id: newOrderId,
      gross_amount: transaction.amount
    };
    const itemDetails = [
      {
        id: transaction.product_id,
        name: transaction.product_name,
        price: transaction.amount / (transaction.quantity || 1),
        quantity: transaction.quantity || 1
      }
    ];
    const customerDetails = {
      first_name: transaction.customer_name || user.name || "",
      email: transaction.email || user.email || ""
    };
    const parameter = {
      transaction_details: transactionDetails,
      item_details: itemDetails,
      customer_details: customerDetails,
      credit_card: {
        secure: true
      },
      callbacks: {
        finish: `${process.env.NUXT_PUBLIC_BASE_URL || "http://localhost:3000"}/payment/finish`,
        unfinish: `${process.env.NUXT_PUBLIC_BASE_URL || "http://localhost:3000"}/payment/unfinish`,
        error: `${process.env.NUXT_PUBLIC_BASE_URL || "http://localhost:3000"}/payment/error`
      }
    };
    const transactionToken = await snap.createTransaction(parameter);
    await db.execute(
      `UPDATE transactions 
       SET payment_gateway_payload = COALESCE(payment_gateway_payload, '{}')::jsonb || 
         jsonb_build_object(
           'repayment_attempts', COALESCE((payment_gateway_payload->>'repayment_attempts')::int, 0) + 1,
           'last_repayment_time', $1,
           'last_repayment_order_id', $2
         )
       WHERE id = $3`,
      [(/* @__PURE__ */ new Date()).toISOString(), newOrderId, transaction.id]
    );
    await db.execute(
      `INSERT INTO transactions (
        order_id, user_id, product_id, product_name, 
        customer_name, email, amount, quantity, status, 
        payment_gateway_payload
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newOrderId,
        user.id,
        transaction.product_id,
        transaction.product_name,
        transaction.customer_name || user.name,
        transaction.email || user.email,
        transaction.amount,
        transaction.quantity || 1,
        "pending",
        JSON.stringify({
          original_transaction_id: transaction.id,
          is_repayment: true,
          original_order_id: transaction.order_id,
          repayment_time: (/* @__PURE__ */ new Date()).toISOString()
        })
      ]
    );
    return {
      success: true,
      message: "Repayment initiated successfully",
      token: transactionToken.token,
      order_id: newOrderId,
      data: {
        client_key: midtransConfig.clientKey
      }
    };
  } catch (error) {
    console.error("Error initiating repayment:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Failed to initiate repayment"
    });
  }
});

export { repay_post as default };
//# sourceMappingURL=repay.post.mjs.map
