// Database configuration
export const useSupabase = process.env.USE_SUPABASE === 'true' || process.env.VERCEL === '1';
export const useOnlineDB = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';