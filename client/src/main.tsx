import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { configureAuthContainer } from './init-dependencies/auth-di.ts';

// Configure dependency injection containers
configureAuthContainer();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
