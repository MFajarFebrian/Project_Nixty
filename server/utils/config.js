// Database configuration
export const useSupabase = false; // Set to true for PostgreSQL
export const useOnlineDB = false; // Set to true for online MySQL

// Midtrans configuration (Sandbox)
export const midtransConfig = {
  isProduction: process.env.NUXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.NUXT_MIDTRANS_SERVER_KEY || process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-0-XiKyaD4PwMJvSRl7JZbZDp',
  clientKey: process.env.NUXT_PUBLIC_MIDTRANS_CLIENT_KEY || process.env.MIDTRANS_CLIENT_KEY || 'SB-Mid-client-XZVBXJmESkGTZlFP'
};
