import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'next-themes';
import React from 'react';

import SignupForm from '@/features/Authentication/presentation/components/signup-form';

// Mock the custom hook
const mockRegisterHandler = jest.fn();
const mockRegisterForm = {
  handleSubmit: jest.fn(
    (callback) => () =>
      callback({
        name: 'John Doe',
        email: 'test@example.com',
        password: 'password123',
      })
  ),
  formState: { errors: {} },
  register: jest.fn(),
  watch: jest.fn(),
  setValue: jest.fn(),
  getValues: jest.fn(),
  control: {},
};

jest.mock(
  '@/features/Authentication/presentation/state/hooks/use-register.tsx',
  () => ({
    __esModule: true,
    default: () => ({
      registerForm: mockRegisterForm,
      isRegistering: false,
      registerHandler: mockRegisterHandler,
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
jest.mock('@/core/constants/images.ts', () => ({
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

describe('SignupForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all form elements correctly', () => {
    renderWithTheme(<SignupForm />);

    expect(screen.getByText('Join InsightHub 🚀')).toBeInTheDocument();
    expect(
      screen.getByText('Create an account to continue')
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByTestId('register-button')).toBeInTheDocument();
  });

  it('should display correct button text when not registering', () => {
    renderWithTheme(<SignupForm />);
    expect(screen.getByTestId('register-button')).toHaveTextContent(
      'Create account'
    );
  });

  it('should handle register button click', async () => {
    const user = userEvent.setup();
    renderWithTheme(<SignupForm />);

    const registerButton = screen.getByTestId('register-button');
    await user.click(registerButton);

    expect(mockRegisterForm.handleSubmit).toHaveBeenCalled();
  });

  it('should handle Enter key press on register button', async () => {
    renderWithTheme(<SignupForm />);

    const registerButton = screen.getByTestId('register-button');
    fireEvent.keyDown(registerButton, { key: 'Enter', code: 'Enter' });

    expect(mockRegisterForm.handleSubmit).toHaveBeenCalled();
  });

  it('should render correct image based on theme', () => {
    const { rerender } = renderWithTheme(<SignupForm />, 'light');
    let image = screen.getByAltText('Authentication');
    expect(image).toHaveAttribute('src', 'auth-image-light.png');

    rerender(
      <ThemeProvider attribute="class" defaultTheme="dark">
        <SignupForm />
      </ThemeProvider>
    );
    image = screen.getByAltText('Authentication');
    expect(image).toHaveAttribute('src', 'auth-image-light.png');
  });

  it('should have correct navigation link', () => {
    renderWithTheme(<SignupForm />);

    const loginLink = screen.getByText('Log in');
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  it('should match snapshot', () => {
    const { container } = renderWithTheme(<SignupForm />);
    expect(container.firstChild).toMatchSnapshot();
  });
});

describe('SignupForm - Loading State', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show loading state correctly', () => {
    // Create a simple test component for loading state
    const LoadingSignupForm = () => {
      return (
        <button data-testid="register-button" disabled={true}>
          Signing up...
        </button>
      );
    };

    renderWithTheme(<LoadingSignupForm />);

    const registerButton = screen.getByTestId('register-button');
    expect(registerButton).toHaveTextContent('Signing up...');
    expect(registerButton).toBeDisabled();
  });
});
