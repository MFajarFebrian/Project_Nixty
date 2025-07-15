import { createClient } from '@supabase/supabase-js'

export const useSupabase = () => {
  const config = useRuntimeConfig()
  
  const supabaseUrl = config.public.supabaseUrl || 'https://buafxvcghfeoquyprmcb.supabase.co'
  const supabaseKey = config.public.supabaseKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1YWZ4dmNnaGZlb3F1eXBybWNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2OTQwOTIsImV4cCI6MjA2NjI3MDA5Mn0.yeTIbNE7Caq6wBV_hqvjlUyHAc5PBGsLQvlKSGSe4NI'
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  return { supabase }
}
