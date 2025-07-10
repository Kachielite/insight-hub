import { useTheme } from 'next-themes';

import { Button } from '@/core/common/presentation/components/ui/button.tsx';
import {
  Card,
  CardContent,
} from '@/core/common/presentation/components/ui/card.tsx';
import { Input } from '@/core/common/presentation/components/ui/input.tsx';
import { Label } from '@/core/common/presentation/components/ui/label.tsx';
import { AuthImageDark, AuthImageLight } from '@/core/constants/images.ts';

function SignupForm() {
  const { theme } = useTheme();
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
            <div className="grid gap-3">
              <Label htmlFor="email">Name</Label>
              <Input id="name" type="name" placeholder="John Doe" required />
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
              </div>
              <Input id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full">
              Create account
            </Button>
            <div className="text-center text-sm">
              Already have an account?{' '}
              <a href="/login" className="underline underline-offset-4">
                Log in
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

export default SignupForm;
