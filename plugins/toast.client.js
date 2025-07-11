import { useToast } from '~/composables/useToast';

export default defineNuxtPlugin(() => {
  const { success, error, warning, info } = useToast();
  
  return {
    provide: {
      toast: {
        success,
        error,
        warning,
        info
      }
    }
  };
}); 