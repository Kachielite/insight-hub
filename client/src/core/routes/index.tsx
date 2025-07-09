import { createBrowserRouter } from 'react-router-dom';

import ProtectedLayout from '@/core/common/presentation/layouts/ProtectedLayout';
import RootLayout from '@/core/common/presentation/layouts/RootLayout';
import ErrorPage from '@/core/common/presentation/pages/ErrorPage';
import NotFoundPage from '@/core/common/presentation/pages/NotFoundPage';
import ForgotPasswordPage from '@/features/Authentication/presentation/pages/forgot-password-page';
import LoginPage from '@/features/Authentication/presentation/pages/login-page';
import ResetPasswordPage from '@/features/Authentication/presentation/pages/reset-password-page';
import SignupPage from '@/features/Authentication/presentation/pages/signup-page';
import DashboardPage from '@/features/Dashboard/presentation/pages/dashboard-page';

import { protectedLoader, publicOnlyLoader } from './auth-utils';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      // Authentication routes (public only - redirect if already authenticated)
      {
        path: 'login',
        element: <LoginPage />,
        loader: publicOnlyLoader,
        errorElement: <ErrorPage />,
      },
      {
        path: 'signup',
        element: <SignupPage />,
        loader: publicOnlyLoader,
        errorElement: <ErrorPage />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPasswordPage />,
        loader: publicOnlyLoader,
        errorElement: <ErrorPage />,
      },
      {
        path: 'reset-password',
        element: <ResetPasswordPage />,
        loader: publicOnlyLoader,
        errorElement: <ErrorPage />,
      },

      // Protected routes
      {
        element: <ProtectedLayout />,
        errorElement: <ErrorPage />,
        loader: protectedLoader,
        children: [
          {
            path: '',
            element: <DashboardPage />,
            errorElement: <ErrorPage />,
          },
        ],
      },
    ],
  },
  // Catch-all route for 404
  {
    path: '*',
    element: <NotFoundPage />,
    errorElement: <ErrorPage />,
  },
]);

export default router;
