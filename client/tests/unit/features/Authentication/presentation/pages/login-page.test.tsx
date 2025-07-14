import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'next-themes';
import React from 'react';

import LoginPage from '@/features/Authentication/presentation/pages/login-page';

// Mock the LoginForm component
jest.mock(
  '@/features/Authentication/presentation/components/login-form.tsx',
  () => ({
    LoginForm: () => <div data-testid="login-form">Login Form</div>,
  })
);

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider attribute="class" defaultTheme="light">
      {component}
    </ThemeProvider>
  );
};

describe('LoginPage', () => {
  it('should render without crashing', () => {
    renderWithTheme(<LoginPage />);
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
  });

  it('should render the LoginForm component', () => {
    renderWithTheme(<LoginPage />);
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
    expect(screen.getByText('Login Form')).toBeInTheDocument();
  });

  it('should match snapshot', () => {
    const { container } = renderWithTheme(<LoginPage />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
