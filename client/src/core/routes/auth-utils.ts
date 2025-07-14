import { redirect } from 'react-router-dom';

import Ecrypter from '@/core/utils/encrypter';

export const authService = {
  isAuthenticated: async (): Promise<boolean> => {
    const token = await Ecrypter.getUserToken();
    return token !== null;
  },

  // getUser: () => {
  //   const userData = localStorage.getItem('userData');
  //   return userData ? JSON.parse(userData) : null;
  // }
};

// Protected route loader - runs before component renders
export const protectedLoader = async () => {
  const isAuth = await authService.isAuthenticated();
  if (!isAuth) {
    throw redirect('/login');
  }
  return null;
};

// Public only route loader (redirects authenticated users)
export const publicOnlyLoader = async () => {
  const isAuth = await authService.isAuthenticated();
  if (isAuth) {
    throw redirect('/');
  }
  return null;
};
