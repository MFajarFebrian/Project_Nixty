import midtransClient from 'midtrans-client';
import { midtransConfig } from '../../utils/config.js';

export default defineEventHandler(async (event) => {
  const { order_id } = getQuery(event);
  const core = new midtransClient.CoreApi({
    isProduction: midtransConfig.isProduction,
    serverKey: midtransConfig.serverKey,
    clientKey: midtransConfig.clientKey,
  });
  try {
    const status = await core.transaction.status(order_id);
    return status;
  } catch (err) {
    return { error: err.message };
  }
});
