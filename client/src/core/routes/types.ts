import React from 'react';

// Route types and interfaces
export interface RouteConfig {
  path: string;
  element: React.ComponentType;
  protected?: boolean;
  redirectTo?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
}
