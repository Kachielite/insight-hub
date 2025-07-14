import { useTheme } from 'next-themes';

import CustomInput from '@/core/common/presentation/components/custom-input.tsx';
import { Button } from '@/core/common/presentation/components/ui/button.tsx';
import {
  Card,
  CardContent,
} from '@/core/common/presentation/components/ui/card.tsx';
import { AuthImageDark, AuthImageLight } from '@/core/constants/images.ts';
import useRegister from '@/features/Authentication/presentation/state/hooks/use-register.tsx';

function SignupForm() {
  const { theme } = useTheme();
  const { registerForm, isRegistering, registerHandler } = useRegister();
  return (
    <Card className="overflow-hidden p-0 w-[90vw] md:w-[80vw] lg:w-[50rem]">
      <CardContent className="grid p-0 md:grid-cols-2">
        <form className="p-6 md:p-8">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col items-center text-center gap-4">
              <h1 className="text-2xl font-bold">Join InsightHub 🚀</h1>
              <p className="text-muted-foreground text-balance">
                Create an account to continue
              </p>
            </div>
            <CustomInput
              id="name"
              label="Name"
              placeholder="Enter your name"
              formController={registerForm}
              dataTestId="name-input"
            />
            <CustomInput
              id="email"
              type="email"
              label="Email"
              placeholder="Enter your email"
              formController={registerForm}
              dataTestId="email-input"
            />
            <CustomInput
              id="password"
              type="password"
              label="Password"
              placeholder="Enter your password"
              formController={registerForm}
              dataTestId="password-input"
            />
            <Button
              data-testid="register-button"
              disabled={isRegistering}
              onClick={registerForm.handleSubmit((e) => registerHandler(e))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  registerForm.handleSubmit((e) => registerHandler(e))();
                }
              }}
              type="submit"
              className="w-full"
            >
              {isRegistering ? 'Creating...' : 'Create account'}
            </Button>
            <div className="text-center text-sm">
              Already have an account?{' '}
              <a href="/login" className="underline underline-offset-4">
                Log in
              </a>
            </div>
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

export default SignupForm;
