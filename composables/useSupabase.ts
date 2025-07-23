// This composable is deprecated - use the @nuxtjs/supabase module instead
// Use useSupabaseClient() directly from '#imports'

export const useSupabase = () => {
  // Return the official Nuxt Supabase client
  const supabase = useSupabaseClient()
  
  return { supabase }
}
