import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'next-themes';
import React from 'react';

import SignupPage from '@/features/Authentication/presentation/pages/signup-page';

// Mock the SignupForm component
jest.mock(
  '@/features/Authentication/presentation/components/signup-form.tsx',
  () => ({
    __esModule: true,
    default: () => <div data-testid="signup-form">Signup Form</div>,
  })
);

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider attribute="class" defaultTheme="light">
      {component}
    </ThemeProvider>
  );
};

describe('SignupPage', () => {
  it('should render without crashing', () => {
    renderWithTheme(<SignupPage />);
    expect(screen.getByTestId('signup-form')).toBeInTheDocument();
  });

  it('should render the SignupForm component', () => {
    renderWithTheme(<SignupPage />);
    expect(screen.getByTestId('signup-form')).toBeInTheDocument();
    expect(screen.getByText('Signup Form')).toBeInTheDocument();
  });

  it('should match snapshot', () => {
    const { container } = renderWithTheme(<SignupPage />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
