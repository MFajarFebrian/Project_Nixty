import { c as defineEventHandler, h as getQuery, e as createError, n as midtransConfig } from '../../../_/nitro.mjs';
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

const status_get = defineEventHandler(async (event) => {
  const query = getQuery(event);
  const orderId = query.order_id;
  console.log("Received request to check status for order:", orderId);
  if (!orderId) {
    console.error("Order ID is required but not provided");
    throw createError({
      statusCode: 400,
      message: "Order ID is required"
    });
  }
  let coreApi = new midtransClient.CoreApi({
    isProduction: midtransConfig.isProduction,
    serverKey: midtransConfig.serverKey
  });
  try {
    console.log("Calling Midtrans API for order:", orderId);
    const transactionStatus = await coreApi.transaction.status(orderId);
    console.log("Midtrans API response:", transactionStatus);
    return {
      success: true,
      data: transactionStatus
    };
  } catch (error) {
    console.error(`Error fetching Midtrans transaction status for order ${orderId}:`, error);
    return {
      success: false,
      message: error.message || "Failed to fetch transaction status",
      error
    };
  }
});

export { status_get as default };
//# sourceMappingURL=status.get.mjs.map
