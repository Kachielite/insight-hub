import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';
import { toast } from 'sonner';

import {
  authRequestResetPasswordSchema,
  type AuthRequestResetPasswordSchema,
} from '@/core/validation/auth.ts';
import { requestResetPasswordEffect } from '@/features/Authentication/presentation/state/store/effects.ts';

const useRequestPasswordReset = () => {
  const requestResetPasswordForm = useForm<AuthRequestResetPasswordSchema>({
    resolver: zodResolver(authRequestResetPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const {
    isLoading: isRequestingPasswordReset,
    mutateAsync: requestResetPasswordHandler,
  } = useMutation(
    ['request-reset-password'],
    async (data: AuthRequestResetPasswordSchema) =>
      requestResetPasswordEffect(data),
    {
      onSuccess: () => {
        toast.success('A reset password link has been sent to your email.', {
          duration: 8000,
        });
        requestResetPasswordForm.reset();
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
    requestResetPasswordForm,
    isRequestingPasswordReset,
    requestResetPasswordHandler,
  };
};

export default useRequestPasswordReset;
