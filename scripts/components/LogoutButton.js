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

  const handleLogout = () => {
    const isAdmin = user.value?.account_type === 'admin';
    
    // Use the logout function from useAuth
    logout();
    
    // Redirect admin to admin login page, others to specified redirectTo or default
    if (isAdmin) {
      router.push('/admin');
    } else {
      router.push(props.redirectTo);
    }
  };

  return {
    // Computed
    buttonSize,
    
    // Methods
    handleLogout
  };
};
