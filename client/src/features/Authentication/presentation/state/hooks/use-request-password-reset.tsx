import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import {
  authRequestResetPasswordSchema,
  type AuthRequestResetPasswordSchema,
} from '@/core/validation/auth.ts';
import { requestResetPasswordEffect } from '@/features/Authentication/presentation/state/store/effects.ts';

const useRequestPasswordReset = () => {
  const navigate = useNavigate();
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
    async () =>
      requestResetPasswordEffect(requestResetPasswordForm.getValues()),
    {
      onSuccess: () => {
        toast.success('Registration successful');
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
    requestResetPasswordForm,
    isRequestingPasswordReset,
    requestResetPasswordHandler,
  };
};

export default useRequestPasswordReset;
