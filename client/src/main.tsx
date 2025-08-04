import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'sonner';

import App from './App';
import './index.css';
import { configureAuthContainer } from './init-dependencies/auth-di.ts';
import { configureUserContainer } from './init-dependencies/user-di.ts';

// Configure dependency injection containers
configureAuthContainer();
configureUserContainer();

// React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: false,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <App />
    <Toaster position="top-center" richColors />
  </QueryClientProvider>
);
