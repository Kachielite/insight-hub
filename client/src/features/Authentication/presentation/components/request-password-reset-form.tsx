import { useTheme } from 'next-themes';

import CustomInput from '@/core/common/presentation/components/custom-input.tsx';
import { Button } from '@/core/common/presentation/components/ui/button';
import {
  Card,
  CardContent,
} from '@/core/common/presentation/components/ui/card';
import { AuthImageDark, AuthImageLight } from '@/core/constants/images';
import useRequestPasswordReset from '@/features/Authentication/presentation/state/hooks/use-request-password-reset.tsx';

export function RequestPasswordResetForm() {
  const { theme } = useTheme();
  const {
    requestResetPasswordForm,
    isRequestingPasswordReset,
    requestResetPasswordHandler,
  } = useRequestPasswordReset();
  return (
    <Card className="overflow-hidden p-0 w-[90vw] md:w-[80vw] lg:w-[50rem]">
      <CardContent className="grid p-0 md:grid-cols-2">
        <form className="p-6 md:p-8">
          <div className="flex flex-col gap-12">
            <div className="flex flex-col items-center text-center gap-4">
              <h1 className="text-2xl font-bold">Recover your password 🔑</h1>
              <p className="text-muted-foreground w-[70%]">
                A password reset link will be sent to your email
              </p>
            </div>
            <CustomInput
              id="email"
              type="email"
              label="Email"
              placeholder="Enter your email"
              formController={requestResetPasswordForm}
            />
            <Button
              disabled={isRequestingPasswordReset}
              onClick={requestResetPasswordForm.handleSubmit((data) =>
                requestResetPasswordHandler(data)
              )}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  requestResetPasswordForm.handleSubmit((data) =>
                    requestResetPasswordHandler(data)
                  )();
                }
              }}
              className="w-full"
            >
              {isRequestingPasswordReset ? 'Sending...' : 'Send reset link'}
            </Button>
          </div>
        </form>
        <div className=" relative hidden md:block">
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
