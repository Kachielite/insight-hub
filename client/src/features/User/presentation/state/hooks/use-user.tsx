import { useQuery } from 'react-query';
import { toast } from 'sonner';

import { useAppStore } from '@/core/common/presentation/state/store';
import Encrypter from '@/core/utils/encrypter.ts';
import { fetchUserEffect } from '@/features/User/presentation/state/store/effects.ts';

const useUser = () => {
  const { setUser } = useAppStore();

  const { isLoading: isLoadingUserData } = useQuery(
    'fetchCurrentUser',
    async () => {
      const token = await Encrypter.getUserToken();
      if (!token) {
        throw new Error('You are not authenticated. Please log in.');
      }
      return fetchUserEffect();
    },
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
    isLoadingUserData,
  };
};

export default useUser;
