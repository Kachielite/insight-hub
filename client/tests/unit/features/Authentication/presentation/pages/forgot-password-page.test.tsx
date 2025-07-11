import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'next-themes';
import React from 'react';

import ForgotPasswordPage from '@/features/Authentication/presentation/pages/forgot-password-page';

// Mock the RequestPasswordResetForm component
jest.mock(
  '@/features/Authentication/presentation/components/request-password-reset-form.tsx',
  () => ({
    RequestPasswordResetForm: () => (
      <div data-testid="request-password-reset-form">
        Request Password Reset Form
      </div>
    ),
  })
);

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider attribute="class" defaultTheme="light">
      {component}
    </ThemeProvider>
  );
};

describe('ForgotPasswordPage', () => {
  it('should render without crashing', () => {
    renderWithTheme(<ForgotPasswordPage />);
    expect(
      screen.getByTestId('request-password-reset-form')
    ).toBeInTheDocument();
  });

  it('should render the RequestPasswordResetForm component', () => {
    renderWithTheme(<ForgotPasswordPage />);
    expect(
      screen.getByTestId('request-password-reset-form')
    ).toBeInTheDocument();
    expect(screen.getByText('Request Password Reset Form')).toBeInTheDocument();
  });

  it('should match snapshot', () => {
    const { container } = renderWithTheme(<ForgotPasswordPage />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
