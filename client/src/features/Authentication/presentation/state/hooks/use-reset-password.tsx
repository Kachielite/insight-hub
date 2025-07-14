import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import {
  authResetSchema,
  type AuthResetSchema,
} from '@/core/validation/auth.ts';
import { resetPasswordEffect } from '@/features/Authentication/presentation/state/store/effects.ts';

const useResetPassword = (resetToken: string) => {
  const navigate = useNavigate();
  const resetPasswordForm = useForm<AuthResetSchema>({
    resolver: zodResolver(authResetSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
      resetToken,
    },
  });

  const {
    isLoading: isRequestingPasswordReset,
    mutateAsync: resetPasswordHandler,
  } = useMutation(
    ['reset-password'],
    async (data: AuthResetSchema) => resetPasswordEffect(data),
    {
      onSuccess: () => {
        toast.success(
          'Password reset successful, please login with your new password',
          {
            duration: 8000,
          }
        );
        navigate('/login');
      },
      onError: (error) => {
        console.error('useRequestPasswordReset error:', error);
        const errorMessage =
          error instanceof Error ? error.message : 'An unknown error occurred';
        if (errorMessage === 'Invalid reset token') {
          toast.error(
            'Invalid reset token. Please request a new password reset.',
            {
              duration: 8000,
            }
          );
          navigate('/forgot-password', { replace: true });
        } else {
          toast.error(errorMessage);
        }
      },
    }
  );

  return {
    resetPasswordForm,
    isRequestingPasswordReset,
    resetPasswordHandler,
  };
};

export default useResetPassword;
