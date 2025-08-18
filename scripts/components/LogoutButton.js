import { computed } from 'vue';

export const useLogoutButton = (props) => {
  const router = useRouter();
  const { user, logout } = useAuth();

  // Compute CSS class based on size prop
  const buttonSize = computed(() => {
    return {
      'btn-small': props.size === 'small',
      'btn-medium': props.size === 'medium',
      'btn-large': props.size === 'large'
    };
  });

  const handleLogout = async () => {
    const isAdmin = user.value?.account_type === 'admin';
    
    // Use the logout function from useAuth and wait for it to complete
    await logout();
    
    // Small delay to ensure logout is processed
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Redirect admin to admin login page, others to specified redirectTo or default
    if (isAdmin) {
      await router.push('/admin');
    } else {
      await router.push(props.redirectTo);
    }
  };

  return {
    // Computed
    buttonSize,
    
    // Methods
    handleLogout
  };
};
