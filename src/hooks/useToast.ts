import toast, { ToastOptions } from 'react-hot-toast';

interface ToastConfig extends ToastOptions {
  preventDuplicate?: boolean;
  category?: string;
  dismissAll?: boolean; // New option to dismiss all toasts before showing new one
  dismissCategory?: boolean; // New option to dismiss all toasts in the same category
}

class ToastManager {
  private activeToasts = new Map<string, string>();

  private generateKey(message: string, category?: string): string {
    const baseKey = category ? `${category}-${message}` : message;
    return baseKey.toLowerCase().replace(/\s+/g, '-').slice(0, 50);
  }

  private dismissByKey(key: string) {
    const toastId = this.activeToasts.get(key);
    if (toastId) {
      toast.dismiss(toastId);
      this.activeToasts.delete(key);
    }
  }

  private showToast(
    type: 'success' | 'error' | 'loading' | 'custom',
    message: string,
    config: ToastConfig = {}
  ) {
    const { 
      preventDuplicate = true, 
      category, 
      dismissAll = false,
      dismissCategory = false,
      ...toastOptions 
    } = config;
    
    // Dismiss all toasts if requested
    if (dismissAll) {
      toast.dismiss();
      this.activeToasts.clear();
    }
    
    // Dismiss all toasts in the same category if requested
    if (dismissCategory && category) {
      this.dismissByCategory(category);
    }
    
    // Existing duplicate prevention logic
    if (preventDuplicate) {
      const key = this.generateKey(message, category);
      this.dismissByKey(key);
    }

    let toastId: string;
    
    switch (type) {
      case 'success':
        toastId = toast.success(message, toastOptions);
        break;
      case 'error':
        toastId = toast.error(message, toastOptions);
        break;
      case 'loading':
        toastId = toast.loading(message, toastOptions);
        break;
      default:
        toastId = toast(message, toastOptions);
    }

    if (preventDuplicate) {
      const key = this.generateKey(message, category);
      this.activeToasts.set(key, toastId);
      
      // Clean up after toast duration
      setTimeout(() => {
        this.activeToasts.delete(key);
      }, (toastOptions.duration || 4000) + 1000);
    }

    return toastId;
  }

  success(message: string, config?: ToastConfig) {
    return this.showToast('success', message, { dismissAll: true, ...config });
  }

  error(message: string, config?: ToastConfig) {
    return this.showToast('error', message, { dismissAll: true, ...config });
  }

  loading(message: string, config?: ToastConfig) {
    return this.showToast('loading', message, { dismissAll: true, ...config });
  }

  info(message: string, config?: ToastConfig) {
    return this.showToast('custom', message, { 
      dismissAll: true,
      ...config, 
      icon: 'ℹ️',
      style: { background: '#3b82f6', color: 'white' }
    });
  }

  promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    },
    config?: ToastConfig
  ) {
    const { preventDuplicate = true, category, ...toastOptions } = config || {};
    
    if (preventDuplicate) {
      const key = this.generateKey(messages.loading, category);
      this.dismissByKey(key);
    }

    return toast.promise(promise, messages, toastOptions);
  }

  dismiss(toastId?: string) {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
      this.activeToasts.clear();
    }
  }

  dismissByCategory(category: string) {
    for (const [key, toastId] of this.activeToasts.entries()) {
      if (key.startsWith(category.toLowerCase())) {
        toast.dismiss(toastId);
        this.activeToasts.delete(key);
      }
    }
  }
}

const toastManager = new ToastManager();

export const useToast = () => {
  return {
    success: (message: string, config?: ToastConfig) => 
      toastManager.success(message, config),
    
    error: (message: string, config?: ToastConfig) => 
      toastManager.error(message, config),
    
    loading: (message: string, config?: ToastConfig) => 
      toastManager.loading(message, config),
    
    info: (message: string, config?: ToastConfig) => 
      toastManager.info(message, config),
    
    promise: <T>(
      promise: Promise<T>,
      messages: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((error: any) => string);
      },
      config?: ToastConfig
    ) => toastManager.promise(promise, messages, config),
    
    dismiss: (toastId?: string) => toastManager.dismiss(toastId),
    
    dismissByCategory: (category: string) => toastManager.dismissByCategory(category),
    
    // Specific categories for common use cases
    auth: {
      success: (message: string) => toastManager.success(message, { category: 'auth', dismissCategory: true }),
      error: (message: string) => toastManager.error(message, { category: 'auth', dismissCategory: true }),
      loading: (message: string) => toastManager.loading(message, { category: 'auth', dismissCategory: true }),
    },
    
    otp: {
      success: (message: string) => toastManager.success(message, { category: 'otp', dismissCategory: true }),
      error: (message: string) => toastManager.error(message, { category: 'otp', dismissCategory: true }),
      loading: (message: string) => toastManager.loading(message, { category: 'otp', dismissCategory: true }),
    },
    
    verification: {
      success: (message: string) => toastManager.success(message, { category: 'verification', dismissCategory: true }),
      error: (message: string) => toastManager.error(message, { category: 'verification', dismissCategory: true }),
      loading: (message: string) => toastManager.loading(message, { category: 'verification', dismissCategory: true }),
    },
    
    review: {
      success: (message: string) => toastManager.success(message, { category: 'review', dismissCategory: true }),
      error: (message: string) => toastManager.error(message, { category: 'review', dismissCategory: true }),
      loading: (message: string) => toastManager.loading(message, { category: 'review', dismissCategory: true }),
    }
  };
};

export default useToast; 