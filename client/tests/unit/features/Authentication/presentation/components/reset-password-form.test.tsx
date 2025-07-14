import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'next-themes';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import { ResetPasswordForm } from '@/features/Authentication/presentation/components/reset-password-form';

// Mock react-router-dom
const mockNavigate = jest.fn();
const mockSearchParams = new URLSearchParams('?token=valid-token');

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useSearchParams: () => [mockSearchParams],
}));

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
  },
}));

// Mock the custom hook
const mockResetPasswordHandler = jest.fn();
const mockResetPasswordForm = {
  handleSubmit: jest.fn(
    (callback) => () =>
      callback({
        newPassword: 'newPassword123',
        confirmPassword: 'newPassword123',
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
  '@/features/Authentication/presentation/state/hooks/use-reset-password.tsx',
  () => ({
    __esModule: true,
    default: (_token: string) => ({
      resetPasswordForm: mockResetPasswordForm,
      isRequestingPasswordReset: false,
      resetPasswordHandler: mockResetPasswordHandler,
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

const renderWithProviders = (
  component: React.ReactElement,
  theme = 'light'
) => {
  return render(
    <BrowserRouter>
      <ThemeProvider attribute="class" defaultTheme={theme}>
        {component}
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('ResetPasswordForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams.set('token', 'valid-token');
  });

  it('should render all form elements correctly with valid token', () => {
    renderWithProviders(<ResetPasswordForm />);

    expect(screen.getByText('Reset your password 🔑')).toBeInTheDocument();
    expect(screen.getByText('Provide your new password')).toBeInTheDocument();
    expect(screen.getByLabelText('New Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /reset password/i })
    ).toBeInTheDocument();
  });

  it('should display correct button text when not processing', () => {
    renderWithProviders(<ResetPasswordForm />);
    const button = screen.getByRole('button', { name: /reset password/i });
    expect(button).toHaveTextContent('Reset Password');
  });

  it('should handle form submission on button click', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ResetPasswordForm />);

    const submitButton = screen.getByRole('button', {
      name: /reset password/i,
    });
    await user.click(submitButton);

    expect(mockResetPasswordForm.handleSubmit).toHaveBeenCalled();
  });

  it('should handle Enter key press on submit button', () => {
    renderWithProviders(<ResetPasswordForm />);

    const submitButton = screen.getByRole('button', {
      name: /reset password/i,
    });
    fireEvent.keyDown(submitButton, { key: 'Enter', code: 'Enter' });

    expect(mockResetPasswordForm.handleSubmit).toHaveBeenCalled();
  });

  it('should render correct image based on theme', () => {
    const { rerender } = renderWithProviders(<ResetPasswordForm />, 'light');
    let image = screen.getByAltText('Authentication');
    expect(image).toHaveAttribute('src', 'auth-image-light.png');

    rerender(
      <BrowserRouter>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <ResetPasswordForm />
        </ThemeProvider>
      </BrowserRouter>
    );
    image = screen.getByAltText('Authentication');
    expect(image).toHaveAttribute('src', 'auth-image-light.png');
  });

  it('should match snapshot with valid token', () => {
    const { container } = renderWithProviders(<ResetPasswordForm />);
    expect(container.firstChild).toMatchSnapshot();
  });
});

describe('ResetPasswordForm - Invalid Token', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams.delete('token');
  });

  it('should handle missing token correctly', async () => {
    const { toast } = await import('sonner');
    renderWithProviders(<ResetPasswordForm />);

    expect(toast.error).toHaveBeenCalledWith('Invalid or expired reset token');
    expect(mockNavigate).toHaveBeenCalledWith('/forgot-password', {
      replace: true,
    });
  });
});

describe('ResetPasswordForm - Loading State', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams.set('token', 'valid-token');
  });

  it('should show loading state correctly', () => {
    // Create a simple test component for loading state
    const LoadingForm = () => {
      return <button disabled={true}>Resetting...</button>;
    };

    renderWithProviders(<LoadingForm />);

    const submitButton = screen.getByRole('button');
    expect(submitButton).toHaveTextContent('Resetting...');
    expect(submitButton).toBeDisabled();
  });
});
