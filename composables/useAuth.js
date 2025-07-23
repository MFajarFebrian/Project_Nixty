import { ref, computed } from 'vue';

const user = ref(null);
const isReady = ref(false);

export function useAuth() {
  const initUser = async () => {
    if (process.client && !isReady.value) {
      console.log('InitUser - Starting user initialization');
      
      // First try to get user from localStorage
      const userJson = localStorage.getItem('currentUser');
      if (userJson) {
        try {
          user.value = JSON.parse(userJson);
          console.log('InitUser - User loaded from localStorage:', {
            hasUser: !!user.value,
            accountType: user.value?.account_type,
            userId: user.value?.id ? user.value.id.substring(0, 8) + '***' : 'none',
            userEmail: user.value?.email ? user.value.email.substring(0, 5) + '***' : 'none'
          });
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
          console.log('InitUser - Supabase session check:', {
            hasSession: !!data?.session,
            hasUser: !!data?.session?.user,
            userFromStorage: !!user.value
          });
          
          if (data?.session?.user && !user.value) {
            console.log('InitUser - Getting user profile from database');
            // Get user profile from database
            const { data: profile, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('id', data.session.user.id)
              .single();
              
            if (profileError) {
              console.error('InitUser - Error fetching profile:', profileError);
            }
              
            if (profile) {
              user.value = profile;
              localStorage.setItem('currentUser', JSON.stringify(profile));
              console.log('InitUser - Profile loaded from database:', {
                accountType: profile.account_type,
                userId: profile.id ? profile.id.substring(0, 8) + '***' : 'none',
                userEmail: profile.email ? profile.email.substring(0, 5) + '***' : 'none'
              });
            }
          }
        }
      } catch (error) {
        console.error('Error checking Supabase auth:', error);
      }
      
      isReady.value = true;
      console.log('InitUser - Initialization complete:', {
        hasUser: !!user.value,
        isReady: isReady.value
      });
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
