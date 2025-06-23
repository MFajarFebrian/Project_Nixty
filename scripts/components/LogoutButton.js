import { computed } from 'vue';

export const useLogoutButton = (props) => {
  const router = useRouter();
  const { logout } = useAuth();

  // Compute CSS class based on size prop
  const buttonSize = computed(() => {
    return {
      'btn-small': props.size === 'small',
      'btn-medium': props.size === 'medium',
      'btn-large': props.size === 'large'
    };
  });

  const handleLogout = () => {
    // Use the logout function from useAuth
    logout();
    
    // Redirect to the specified page (default is login)
    router.push(props.redirectTo);
  };

  return {
    // Computed
    buttonSize,
    
    // Methods
    handleLogout
  };
};
