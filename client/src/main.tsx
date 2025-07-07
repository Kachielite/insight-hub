import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { configureAuthContainer } from '@/features/Authentication/di/auth-container';

// Configure dependency injection containers
configureAuthContainer();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
