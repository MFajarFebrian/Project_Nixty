import midtransClient from 'midtrans-client';

export default defineEventHandler(async (event) => {
  const { order_id } = getQuery(event);
  const core = new midtransClient.CoreApi({
    isProduction: false,
    serverKey: 'SB-Mid-server-muppA5b1JSMIz_Xst3TkglSj',
    clientKey: 'SB-Mid-client-1mWLxp9NeFFOyqQs',
  });
  try {
    const status = await core.transaction.status(order_id);
    return status;
  } catch (err) {
    return { error: err.message };
  }
});
