import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import {
  authLoginSchema,
  type AuthLoginSchema,
} from '@/core/validation/auth.ts';
import { loginEffect } from '@/features/Authentication/presentation/state/store/effects.ts';

const useLogin = () => {
  const navigate = useNavigate();

  const loginForm = useForm<AuthLoginSchema>({
    resolver: zodResolver(authLoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const { mutate: loginHandler, isLoading: isLoggingIn } = useMutation(
    ['login'],
    (data: AuthLoginSchema) => loginEffect(data),
    {
      onSuccess: () => {
        toast.success('Login successful');
        navigate('/');
      },
      onError: (error) => {
        console.error('useLogin error:', error);
        const errorMessage =
          error instanceof Error ? error.message : 'An unknown error occurred';
        toast.error(errorMessage);
      },
    }
  );

  return {
    loginForm,
    isLoggingIn,
    loginHandler,
  };
};

export default useLogin;
