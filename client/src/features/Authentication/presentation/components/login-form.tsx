import { useTheme } from 'next-themes';

import CustomInput from '@/core/common/presentation/components/custom-input.tsx';
import { Button } from '@/core/common/presentation/components/ui/button';
import {
  Card,
  CardContent,
} from '@/core/common/presentation/components/ui/card';
import { AuthImageDark, AuthImageLight } from '@/core/constants/images';
import useLogin from '@/features/Authentication/presentation/state/hooks/use-login.tsx';

export function LoginForm() {
  const { theme } = useTheme();
  const { loginForm, isLoggingIn, loginHandler } = useLogin();
  return (
    <Card className="overflow-hidden p-0 w-[90vw] md:w-[80vw] lg:w-[50rem]">
      <CardContent className="grid p-0 md:grid-cols-2">
        <form className="p-6 md:p-8">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col items-center text-center gap-4">
              <h1 className="text-2xl font-bold">Welcome back 👋</h1>
              <p className="text-muted-foreground text-balance">
                Login to your InsightHub account
              </p>
            </div>
            <CustomInput
              id="email"
              type="email"
              label="Email"
              placeholder="Enter your email"
              formController={loginForm}
            />
            <CustomInput
              id="password"
              type="password"
              label="Password"
              placeholder="Enter your password"
              formController={loginForm}
            />
            <a
              href="/forgot-password"
              className="mx-auto text-sm underline-offset-2 hover:underline"
            >
              Forgot your password?
            </a>
            <Button
              onClick={loginForm.handleSubmit((data) => loginHandler(data))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  loginForm.handleSubmit((data) => loginHandler(data))();
                }
              }}
              disabled={isLoggingIn}
              className="w-full"
            >
              {isLoggingIn ? 'Logging in...' : 'Login'}
            </Button>
            <div className="text-center text-sm">
              Don&apos;t have an account?{' '}
              <a href="/signup" className="underline underline-offset-4">
                Sign up
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
