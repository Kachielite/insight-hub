import { useTheme } from 'next-themes';

import { Button } from '@/core/common/presentation/components/ui/button';
import {
  Card,
  CardContent,
} from '@/core/common/presentation/components/ui/card';
import { Input } from '@/core/common/presentation/components/ui/input';
import { Label } from '@/core/common/presentation/components/ui/label';
import { AuthImageDark, AuthImageLight } from '@/core/constants/images';

export function LoginForm() {
  const { theme } = useTheme();
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
            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-3">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <a
                  href="/forgot-password"
                  className="ml-auto text-sm underline-offset-2 hover:underline"
                >
                  Forgot your password?
                </a>
              </div>
              <Input id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
            <div className="text-center text-sm">
              Don&apos;t have an account?{' '}
              <a href="/signup" className="underline underline-offset-4">
                Sign up
              </a>
            </div>
          </div>
        </form>
        <div className="bg-muted relative hidden md:block">
          <img
            src={theme === 'light' ? AuthImageLight : AuthImageDark}
            alt="Authentication"
            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          />
        </div>
      </CardContent>
    </Card>
  );
}
