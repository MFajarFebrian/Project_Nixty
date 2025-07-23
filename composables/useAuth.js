import { ref, computed } from 'vue';

const user = ref(null);
const isReady = ref(false);

export function useAuth() {
  const initUser = async () => {
    if (process.client && !isReady.value) {
      // First try to get user from localStorage
      const userJson = localStorage.getItem('currentUser');
      if (userJson) {
        try {
          user.value = JSON.parse(userJson);
        } catch (error) {
          console.error('Error parsing user data:', error);
          user.value = null;
        }
      }
      
      // Use the Nuxt Supabase composables directly
      try {
        const supabase = useSupabaseClient();
        if (supabase) {
          const { data } = await supabase.auth.getSession();
          if (data?.session?.user && !user.value) {
            // Get user profile from database
            const { data: profile } = await supabase
              .from('users')
              .select('*')
              .eq('id', data.session.user.id)
              .single();
              
            if (profile) {
              user.value = profile;
              localStorage.setItem('currentUser', JSON.stringify(profile));
            }
          }
        }
      } catch (error) {
        console.error('Error checking Supabase auth:', error);
      }
      
      isReady.value = true;
    }
    return user.value;
  };

  const setUser = (newUser) => {
    if (process.client) {
      user.value = newUser;
      if (newUser) {
        localStorage.setItem('currentUser', JSON.stringify(newUser));
      } else {
        localStorage.removeItem('currentUser');
      }
    }
  };

  const logout = async () => {
    if (process.client) {
      // Log out from Supabase using the official composable
      try {
        const supabase = useSupabaseClient();
        if (supabase) {
          await supabase.auth.signOut();
        }
      } catch (error) {
        console.error('Error logging out from Supabase:', error);
      }
      
      user.value = null;
      localStorage.removeItem('currentUser');
    }
  };

  // Computed property to check if user is logged in
  const isLoggedIn = computed(() => {
    return !!user.value;
  });

  return {
    user,
    isReady,
    isLoggedIn,
    initUser,
    setUser,
    logout
  };
}
