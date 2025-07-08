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

const useResetPassword = ({ resetToken }: { resetToken: string }) => {
  const navigate = useNavigate();
  const resetPasswordForm = useForm<AuthResetSchema>({
    resolver: zodResolver(authResetSchema),
    defaultValues: {
      email: '',
      newPassword: '',
      resetToken,
    },
  });

  const { isLoading: isRequestingPasswordReset } = useMutation(
    ['reset-password'],
    async () => resetPasswordEffect(resetPasswordForm.getValues()),
    {
      onSuccess: () => {
        toast.success('Registration successful. Please login.');
        navigate('/login');
      },
      onError: (error) => {
        console.error('useRequestPasswordReset error:', error);
        const errorMessage =
          error instanceof Error ? error.message : 'An unknown error occurred';
        toast.error(errorMessage);
      },
    }
  );

  return {
    resetPasswordForm,
    isRequestingPasswordReset,
  };
};

export default useResetPassword;
