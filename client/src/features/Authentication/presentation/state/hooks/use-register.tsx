import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import {
  authRegisterSchema,
  type AuthRegisterSchema,
} from '@/core/validation/auth.ts';
import { registerEffect } from '@/features/Authentication/presentation/state/store/effects.ts';

const useRegister = () => {
  const navigate = useNavigate();

  const registerForm = useForm<AuthRegisterSchema>({
    resolver: zodResolver(authRegisterSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const { isLoading: isRegistering, mutateAsync: registerHandler } =
    useMutation(
      ['register'],
      async () => registerEffect(registerForm.getValues()),
      {
        onSuccess: () => {
          toast.success('Registration successful');
          navigate('/');
        },
        onError: (error) => {
          console.error('useRegister error:', error);
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'An unknown error occurred';
          toast.error(errorMessage);
        },
      }
    );

  return {
    registerForm,
    isRegistering,
    registerHandler,
  };
};

export default useRegister;
