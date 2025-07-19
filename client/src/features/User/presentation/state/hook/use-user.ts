import { useMutation } from 'react-query';
import { toast } from 'sonner';

import { useAppStore } from '@/core/common/presentation/state/store';
import { fetchUserEffect } from '@/features/User/presentation/state/store/effects.ts';

const useUser = () => {
  const { setUser } = useAppStore();

  const { isLoading, mutateAsync: fetchCurrentUser } = useMutation(
    async () => fetchUserEffect(),
    {
      onSuccess: (data) => {
        setUser(data);
      },
      onError: (error) => {
        console.error('useUser: Error fetching user data:', error);
        const errorMessage =
          error instanceof Error ? error.message : 'An unknown error occurred';
        toast.error(errorMessage);
      },
    }
  );

  return {
    isLoading,
    fetchCurrentUser,
  };
};

export default useUser;
