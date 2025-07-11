// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  modules: [
    // '@nuxtjs/supabase', // Disabled temporarily - using local storage instead
  ],
  plugins: [
    '~/plugins/chart.client.js',
  ],
  runtimeConfig: {
    // The private keys which are only available server-side
    apiSecret: process.env.NUXT_API_SECRET || 'default_secret',
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_KEY,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,
    // Keys within public are also exposed client-side
public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api',
      googleClientId: process.env.GOOGLE_CLIENT_ID,
      bypassAdminAuth: process.env.NODE_ENV === 'development' ? 'true' : 'false',
      nodeEnv: process.env.NODE_ENV || 'development',
      midtransClientKey: process.env.NUXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-XZVBXJmESkGTZlFP'
    }
  },

  app: {
    head: {
      title: 'Nixty',
      script: [
        {
src: `https://app.sandbox.midtrans.com/snap/snap.js`,
          'data-client-key': 'SB-Mid-client-XZVBXJmESkGTZlFP'
        },
        {
          src: '/midtrans-official.js',
          async: true
        }
      ]
    }
  }
})
