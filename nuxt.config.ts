
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  build: {
    transpile: ['csv-parse'],
  },
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  
  // Optimize resource loading to fix preload warnings
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },
    },
    vue: {
      compilerOptions: {
        isCustomElement: (tag) => tag === 'RouterLink'
      }
    }
  },
  modules: [
    // '@nuxtjs/supabase', // Disabled temporarily - using local storage instead
  ],
  plugins: [
    '~/plugins/cleanup-cache.client.js',
    '~/plugins/chart.client.js',
    '~/plugins/preload-optimizer.client.js',
    // '~/plugins/page-cache.client.ts', // Disabled - causing navigation issues
  ],
  
  // Nitro configuration for server-side caching
  nitro: {
    storage: {
      // Cache storage configuration
      cache: {
        driver: 'fs',
        base: './.nitro/cache'
      }
    },
    // Enable route caching
    routeRules: {
      // Global caching for all pages (60 seconds)
      '/**': { 
        headers: { 
          'Cache-Control': 'public, max-age=60, s-maxage=60' 
        },
        experimentalNoScripts: false
      },
      // Static pages with longer cache (1 hour)
      '/': { 
        headers: { 
          'Cache-Control': 'public, max-age=3600, s-maxage=3600' 
        }
      },
      // Profile pages with medium cache (5 minutes)
      '/profile/**': { 
        headers: { 
          'Cache-Control': 'public, max-age=300, s-maxage=300' 
        }
      },
      // Admin pages with shorter cache (30 seconds)
      '/admin/**': { 
        headers: { 
          'Cache-Control': 'public, max-age=30, s-maxage=30' 
        }
      },
      // API routes with minimal cache (10 seconds)
      '/api/**': { 
        headers: { 
          'Cache-Control': 'public, max-age=10, s-maxage=10' 
        }
      },
      // Static assets with long cache (1 day)
      '/images/**': { 
        headers: { 
          'Cache-Control': 'public, max-age=86400, s-maxage=86400' 
        }
      },
      '/assets/**': { 
        headers: { 
          'Cache-Control': 'public, max-age=86400, s-maxage=86400' 
        }
      },
      // Prevent preloading of dev.json in development
      '/_nuxt/builds/meta/dev.json': {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'X-Preload': 'false'
        }
      }
    }
  },
  
  // Server-side rendering with caching
  ssr: true,
  
  // Enable experimental features for better caching
  experimental: {
    payloadExtraction: false,
    renderJsonPayloads: true
  },
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
      midtransClientKey: process.env.NUXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-XZVBXJmESkGTZlFP',
      baseUrl: process.env.NUXT_PUBLIC_BASE_URL || 'http://localhost:3000',
      // Supabase public config
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY
    }
  },

  app: {
    head: {
      title: 'Nixty Demo',
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
