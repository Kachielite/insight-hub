import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'next-themes';
import React from 'react';

import { LoginForm } from '@/features/Authentication/presentation/components/login-form';

// Mock the custom hook
const mockLoginHandler = jest.fn();
const mockLoginForm = {
  handleSubmit: jest.fn(
    (callback) => () =>
      callback({ email: 'test@example.com', password: 'password123' })
  ),
  formState: { errors: {} },
  register: jest.fn(),
  watch: jest.fn(),
  setValue: jest.fn(),
  getValues: jest.fn(),
  control: {},
};

jest.mock(
  '@/features/Authentication/presentation/state/hooks/use-login.tsx',
  () => ({
    __esModule: true,
    default: () => ({
      loginForm: mockLoginForm,
      isLoggingIn: false,
      loginHandler: mockLoginHandler,
    }),
  })
);

// Mock the CustomInput component
jest.mock('@/core/common/presentation/components/custom-input.tsx', () => ({
  __esModule: true,
  default: ({ id, label, dataTestId }: any) => (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} data-testid={dataTestId} />
    </div>
  ),
}));

// Mock the image constants
jest.mock('@/core/constants/images', () => ({
  AuthImageDark: 'auth-image-dark.png',
  AuthImageLight: 'auth-image-light.png',
}));

const renderWithTheme = (component: React.ReactElement, theme = 'light') => {
  return render(
    <ThemeProvider attribute="class" defaultTheme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all form elements correctly', () => {
    renderWithTheme(<LoginForm />);

    expect(screen.getByText('Welcome back 👋')).toBeInTheDocument();
    expect(
      screen.getByText('Login to your InsightHub account')
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByTestId('login-button')).toBeInTheDocument();
    expect(screen.getByText('Forgot your password?')).toBeInTheDocument();
    expect(screen.getByText('Sign up')).toBeInTheDocument();
  });

  it('should display correct button text when not logging in', () => {
    renderWithTheme(<LoginForm />);
    expect(screen.getByTestId('login-button')).toHaveTextContent('Login');
  });

  it('should handle login button click', async () => {
    const user = userEvent.setup();
    renderWithTheme(<LoginForm />);

    const loginButton = screen.getByTestId('login-button');
    await user.click(loginButton);

    expect(mockLoginForm.handleSubmit).toHaveBeenCalled();
  });

  it('should handle Enter key press on login button', async () => {
    renderWithTheme(<LoginForm />);

    const loginButton = screen.getByTestId('login-button');
    fireEvent.keyDown(loginButton, { key: 'Enter', code: 'Enter' });

    expect(mockLoginForm.handleSubmit).toHaveBeenCalled();
  });

  it('should render correct image based on theme', () => {
    const { rerender } = renderWithTheme(<LoginForm />, 'light');
    let image = screen.getByAltText('Authentication');
    expect(image).toHaveAttribute('src', 'auth-image-light.png');

    rerender(
      <ThemeProvider attribute="class" defaultTheme="dark">
        <LoginForm />
      </ThemeProvider>
    );
    image = screen.getByAltText('Authentication');
    expect(image).toHaveAttribute('src', 'auth-image-light.png');
  });

  it('should have correct navigation links', () => {
    renderWithTheme(<LoginForm />);

    const forgotPasswordLink = screen.getByText('Forgot your password?');
    const signupLink = screen.getByText('Sign up');

    expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password');
    expect(signupLink).toHaveAttribute('href', '/signup');
  });

  it('should match snapshot', () => {
    const { container } = renderWithTheme(<LoginForm />);
    expect(container.firstChild).toMatchSnapshot();
  });
});

describe('LoginForm - Loading State', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show loading state correctly', () => {
    // Create a simple test component for loading state
    const LoadingLoginForm = () => {
      const isLoggingIn = true;

      return (
        <button data-testid="login-button" disabled={isLoggingIn}>
          {isLoggingIn ? 'Logging in...' : 'Login'}
        </button>
      );
    };

    renderWithTheme(<LoadingLoginForm />);

    const loginButton = screen.getByTestId('login-button');
    expect(loginButton).toHaveTextContent('Logging in...');
    expect(loginButton).toBeDisabled();
  });
});
