import crypto from 'crypto';

async function verifySignature(orderId, statusCode, grossAmount, serverKey) {
  try {
    const stringToSign = `${orderId}${statusCode}${grossAmount}${serverKey}`;
    const hash = crypto.createHash("sha512").update(stringToSign).digest("hex");
    return hash;
  } catch (error) {
    console.error("Error verifying signature:", error);
    throw error;
  }
}

export { verifySignature as v };
//# sourceMappingURL=midtrans-helper.mjs.map
