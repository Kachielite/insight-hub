import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'next-themes';
import React from 'react';

import ResetPasswordPage from '@/features/Authentication/presentation/pages/reset-password-page';

// Mock the ResetPasswordForm component
jest.mock(
  '@/features/Authentication/presentation/components/reset-password-form.tsx',
  () => ({
    ResetPasswordForm: () => (
      <div data-testid="reset-password-form">Reset Password Form</div>
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

describe('ResetPasswordPage', () => {
  it('should render without crashing', () => {
    renderWithTheme(<ResetPasswordPage />);
    expect(screen.getByTestId('reset-password-form')).toBeInTheDocument();
  });

  it('should render the ResetPasswordForm component', () => {
    renderWithTheme(<ResetPasswordPage />);
    expect(screen.getByTestId('reset-password-form')).toBeInTheDocument();
    expect(screen.getByText('Reset Password Form')).toBeInTheDocument();
  });

  it('should match snapshot', () => {
    const { container } = renderWithTheme(<ResetPasswordPage />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
