import { c as defineEventHandler, r as readBody, e as createError, f as db, n as midtransConfig, u as useRuntimeConfig } from '../../../_/nitro.mjs';
import midtransClient from 'midtrans-client';
import { r as requireAuth } from '../../../_/auth.mjs';
import crypto from 'crypto';
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

function generateOrderId(options = {}) {
  const {
    prefix = "NIXTY",
    userId = null,
    productId = null
  } = options;
  const now = /* @__PURE__ */ new Date();
  const dateStr = now.getFullYear().toString() + (now.getMonth() + 1).toString().padStart(2, "0") + now.getDate().toString().padStart(2, "0");
  const timeStr = now.getHours().toString().padStart(2, "0") + now.getMinutes().toString().padStart(2, "0");
  const timestamp = now.getTime();
  const userPart = userId ? userId.toString().padStart(3, "0").slice(-3) : "000";
  const randomPart = crypto.randomInt(100, 999);
  const uniqueId = (timestamp % 1e3).toString().padStart(3, "0") + userPart.slice(-3) + randomPart.toString();
  const shortId = uniqueId.slice(-6);
  return `${prefix}-${shortId}-${dateStr}-${timeStr}`;
}
function generateOrderIdWithProduct(userId, productId) {
  return generateOrderId({
    prefix: "NIXTY",
    userId,
    productId
  });
}

const { public: { baseUrl } } = useRuntimeConfig();
const snap = new midtransClient.Snap({
  isProduction: midtransConfig.isProduction,
  serverKey: midtransConfig.serverKey,
  clientKey: midtransConfig.clientKey
});
const initiate_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { product, customer, quantity = 1 } = body;
  if (!product || !customer || !customer.email || !customer.name || !product.id || !product.price) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request: Missing required product or customer data."
    });
  }
  if (quantity <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request: Quantity must be greater than 0."
    });
  }
  if (!customer.email.includes("@")) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request: Invalid email format."
    });
  }
  if (body.payment_method || body.enabled_payments) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request: Payment method cannot be overridden."
    });
  }
  const user = await requireAuth(event);
  try {
    const [stockResult] = await db.query(
      `SELECT 
        COUNT(*) as total_licenses,
        SUM(CASE 
          WHEN status = 'available' AND (COALESCE(send_license, 0) < max_usage)
          THEN (max_usage - COALESCE(send_license, 0))
          ELSE 0 
        END) as available_stock
      FROM nixty.product_license_base 
      WHERE product_id = ?`,
      [product.id]
    );
    if (stockResult.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "Product is out of stock."
      });
    }
    const availableStock = parseInt(stockResult[0].available_stock || 0);
    if (availableStock < quantity) {
      throw createError({
        statusCode: 400,
        statusMessage: `Not enough stock available. Requested: ${quantity}, Available: ${availableStock}`
      });
    }
    console.log(`Stock check passed: ${availableStock} available, ${quantity} requested`);
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    console.error("Error checking stock:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to verify product stock."
    });
  }
  const order_id = generateOrderIdWithProduct(user.id, product.id);
  const parameter = {
    transaction_details: {
      order_id,
      gross_amount: Math.round(product.price) * quantity
    },
    item_details: [{
      id: product.id,
      price: Math.round(product.price),
      quantity,
      name: `${product.name} ${product.version}`.substring(0, 50),
      // Max 50 chars
      category: product.category ? product.category.name : "Digital Product",
      merchant_name: "Nixty"
    }],
    customer_details: {
      first_name: customer.name.split(" ")[0],
      last_name: customer.name.split(" ").slice(1).join(" ") || customer.name.split(" ")[0],
      email: customer.email
    }
    // Enable all available payment methods (let user choose)
    // enabled_payments will be determined by Midtrans dashboard settings
  };
  parameter.callbacks = {
    finish: `${baseUrl}/payment/finish`,
    unfinish: `${baseUrl}/payment/unfinish`,
    error: `${baseUrl}/payment/error`
  };
  let snapToken, midtransResponse;
  try {
    snapToken = await snap.createTransactionToken(parameter);
    midtransResponse = {
      status_code: "201",
      transaction_id: null,
      // Will be updated via webhook
      gross_amount: (product.price * quantity).toString(),
      currency: "IDR",
      order_id,
      payment_type: null,
      // Will be updated when user selects payment method
      transaction_status: "pending",
      fraud_status: "accept",
      status_message: "Success, transaction is found",
      merchant_id: midtransConfig.merchantId || "G454677231",
      transaction_time: (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " "),
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      custom_email: customer.email
      // Store the custom email for license delivery
    };
    console.log("Midtrans transaction created:", {
      token: snapToken,
      order_id,
      status: "pending"
    });
  } catch (error) {
    console.error("Midtrans API Error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to get payment token from Midtrans."
    });
  }
  try {
    const [result] = await db.query(
      `INSERT INTO nixty.orders (user_id, product_id, quantity, total, status, order_id) 
       VALUES (?, ?, ?, ?, 'pending', ?) RETURNING id`,
      [
        user.id,
        product.id,
        quantity,
        product.price * quantity,
        order_id
      ]
    );
    const transactionId = result.length > 0 ? result[0].id : null;
    console.log("Transaction created with ID:", transactionId, "for user ID:", user.id);
    if (transactionId) {
      await db.query(
        `INSERT INTO nixty.payment_gateway_logs (transaction_id, key, value) VALUES (?, ?, ?)`,
        [transactionId, "midtrans_order_id", order_id]
      );
      await db.query(
        `INSERT INTO nixty.payment_gateway_logs (transaction_id, key, value) VALUES (?, ?, ?)`,
        [transactionId, "midtrans_response", JSON.stringify(midtransResponse)]
      );
      await db.query(
        `INSERT INTO nixty.payment_gateway_logs (transaction_id, key, value) VALUES (?, ?, ?)`,
        [transactionId, "customer_email", customer.email]
      );
      await db.query(
        `INSERT INTO nixty.payment_gateway_logs (transaction_id, key, value) VALUES (?, ?, ?)`,
        [transactionId, "custom_email", body.custom_email || customer.email]
      );
    }
  } catch (error) {
    console.error("Database Error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to create transaction record."
    });
  }
  return { token: snapToken, order_id };
});

export { initiate_post as default };
//# sourceMappingURL=initiate.post.mjs.map
