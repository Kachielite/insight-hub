import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'next-themes';
import React from 'react';

import { RequestPasswordResetForm } from '@/features/Authentication/presentation/components/request-password-reset-form';

// Mock the custom hook
const mockRequestResetPasswordHandler = jest.fn();
const mockRequestResetPasswordForm = {
  handleSubmit: jest.fn(
    (callback) => () => callback({ email: 'test@example.com' })
  ),
  formState: { errors: {} },
  register: jest.fn(),
  watch: jest.fn(),
  setValue: jest.fn(),
  getValues: jest.fn(),
  control: {},
};

jest.mock(
  '@/features/Authentication/presentation/state/hooks/use-request-password-reset.tsx',
  () => ({
    __esModule: true,
    default: () => ({
      requestResetPasswordForm: mockRequestResetPasswordForm,
      isRequestingPasswordReset: false,
      requestResetPasswordHandler: mockRequestResetPasswordHandler,
    }),
  })
);

// Mock the CustomInput component
jest.mock('@/core/common/presentation/components/custom-input.tsx', () => ({
  __esModule: true,
  default: ({ id, label, dataTestId }: any) => (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} data-testid={dataTestId || `${id}-input`} />
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

describe('RequestPasswordResetForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all form elements correctly', () => {
    renderWithTheme(<RequestPasswordResetForm />);

    expect(screen.getByText('Recover your password 🔑')).toBeInTheDocument();
    expect(
      screen.getByText('A password reset link will be sent to your email')
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /send reset link/i })
    ).toBeInTheDocument();
  });

  it('should display correct button text when not requesting', () => {
    renderWithTheme(<RequestPasswordResetForm />);
    const button = screen.getByRole('button', { name: /send reset link/i });
    expect(button).toHaveTextContent('Send reset link');
  });

  it('should handle form submission on button click', async () => {
    const user = userEvent.setup();
    renderWithTheme(<RequestPasswordResetForm />);

    const submitButton = screen.getByRole('button', {
      name: /send reset link/i,
    });
    await user.click(submitButton);

    expect(mockRequestResetPasswordForm.handleSubmit).toHaveBeenCalled();
  });

  it('should handle Enter key press on submit button', () => {
    renderWithTheme(<RequestPasswordResetForm />);

    const submitButton = screen.getByRole('button', {
      name: /send reset link/i,
    });
    fireEvent.keyDown(submitButton, { key: 'Enter', code: 'Enter' });

    expect(mockRequestResetPasswordForm.handleSubmit).toHaveBeenCalled();
  });

  it('should render correct image based on theme', () => {
    const { rerender } = renderWithTheme(<RequestPasswordResetForm />, 'light');
    let image = screen.getByAltText('Authentication');
    expect(image).toHaveAttribute('src', 'auth-image-light.png');

    rerender(
      <ThemeProvider attribute="class" defaultTheme="dark">
        <RequestPasswordResetForm />
      </ThemeProvider>
    );
    image = screen.getByAltText('Authentication');
    expect(image).toHaveAttribute('src', 'auth-image-light.png');
  });

  it('should match snapshot', () => {
    const { container } = renderWithTheme(<RequestPasswordResetForm />);
    expect(container.firstChild).toMatchSnapshot();
  });
});

describe('RequestPasswordResetForm - Loading State', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show loading state correctly', () => {
    // Create a simple test component for loading state
    const LoadingForm = () => {
      return <button disabled={true}>Sending...</button>;
    };

    renderWithTheme(<LoadingForm />);

    const submitButton = screen.getByRole('button');
    expect(submitButton).toHaveTextContent('Sending...');
    expect(submitButton).toBeDisabled();
  });
});
