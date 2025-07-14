import { useTheme } from 'next-themes';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

import CustomInput from '@/core/common/presentation/components/custom-input.tsx';
import { Button } from '@/core/common/presentation/components/ui/button';
import {
  Card,
  CardContent,
} from '@/core/common/presentation/components/ui/card';
import { AuthImageDark, AuthImageLight } from '@/core/constants/images';
import useResetPassword from '@/features/Authentication/presentation/state/hooks/use-reset-password.tsx';

export function ResetPasswordForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get('token');

  if (!resetToken) {
    toast.error('Invalid or expired reset token');
    navigate('/forgot-password', { replace: true });
    return null;
  }

  const { theme } = useTheme();
  const { resetPasswordForm, isRequestingPasswordReset, resetPasswordHandler } =
    useResetPassword(resetToken);

  return (
    <Card className="overflow-hidden p-0 w-[90vw] md:w-[80vw] lg:w-[50rem]">
      <CardContent className="grid p-0 md:grid-cols-2">
        <form className="p-6 md:p-8">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col items-center text-center gap-4">
              <h1 className="text-2xl font-bold">Reset your password 🔑</h1>
              <p className="text-muted-foreground text-balance">
                Provide your new password
              </p>
            </div>
            <CustomInput
              id="newPassword"
              type="password"
              label="New Password"
              placeholder="Enter your new password"
              formController={resetPasswordForm}
            />
            <CustomInput
              id="confirmPassword"
              type="password"
              label="Confirm Password"
              placeholder="Renter your new password"
              formController={resetPasswordForm}
            />
            <Button
              disabled={isRequestingPasswordReset}
              onClick={resetPasswordForm.handleSubmit((data) =>
                resetPasswordHandler(data)
              )}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  resetPasswordForm.handleSubmit((data) =>
                    resetPasswordHandler(data)
                  )();
                }
              }}
              className="w-full"
            >
              {isRequestingPasswordReset ? 'Resetting...' : 'Reset Password'}
            </Button>
          </div>
        </form>
        <div className="relative hidden md:block">
          <img
            src={theme === 'light' ? AuthImageLight : AuthImageDark}
            alt="Authentication"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      </CardContent>
    </Card>
  );
}
