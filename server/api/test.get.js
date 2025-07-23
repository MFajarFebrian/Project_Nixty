export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    
    return {
      success: true,
      message: 'API is working!',
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV || 'unknown',
        hasSupabaseUrl: !!process.env.SUPABASE_URL,
        hasSupabaseKey: !!process.env.SUPABASE_KEY,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        publicBaseUrl: config.public.baseUrl
      }
    }
  } catch (error) {
    console.error('API test error:', error)
    return {
      success: false,
      message: 'API error occurred',
      error: error.message
    }
  }
})
