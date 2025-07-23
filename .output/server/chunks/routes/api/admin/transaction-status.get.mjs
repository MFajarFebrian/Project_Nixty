import { c as defineEventHandler, h as getQuery, n as midtransConfig } from '../../../_/nitro.mjs';
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

const transactionStatus_get = defineEventHandler(async (event) => {
  const { order_id } = getQuery(event);
  const core = new midtransClient.CoreApi({
    isProduction: midtransConfig.isProduction,
    serverKey: midtransConfig.serverKey,
    clientKey: midtransConfig.clientKey
  });
  try {
    const status = await core.transaction.status(order_id);
    return status;
  } catch (err) {
    return { error: err.message };
  }
});

export { transactionStatus_get as default };
//# sourceMappingURL=transaction-status.get.mjs.map
