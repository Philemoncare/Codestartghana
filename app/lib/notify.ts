import { toast } from 'sonner';

/**
 * Premium Notification Engine for CodeStart Ghana
 * Wraps Sonner to provide a consistent, elegant UI across the platform.
 */
export const notify = {
  success: (title: string, description?: string) => {
    return toast.success(title, {
      description: description,
    });
  },

  error: (title: string, description?: string) => {
    return toast.error(title, {
      description: description,
    });
  },

  warning: (title: string, description?: string) => {
    return toast.warning(title, {
      description: description,
    });
  },

  info: (title: string, description?: string) => {
    return toast.info(title, {
      description: description,
    });
  },

  loading: (message: string) => {
    return toast.loading(message);
  },

  dismiss: (id?: string | number) => {
    toast.dismiss(id);
  }
};
