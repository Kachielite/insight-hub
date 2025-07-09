import { redirect } from 'react-router-dom';

import Ecrypter from '@/core/utils/encrypter';

export const authService = {
  isAuthenticated: (): boolean => {
    const token = Ecrypter.getUserToken();
    return !!token;
  },

  // getUser: () => {
  //   const userData = localStorage.getItem('userData');
  //   return userData ? JSON.parse(userData) : null;
  // }
};

// Protected route loader - runs before component renders
export const protectedLoader = () => {
  if (!authService.isAuthenticated()) {
    throw redirect('/login');
  }
  return null;
};

// Public only route loader (redirects authenticated users)
export const publicOnlyLoader = () => {
  if (authService.isAuthenticated()) {
    throw redirect('/');
  }
  return null;
};
