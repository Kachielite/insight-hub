import { useTheme } from 'next-themes';

import { Button } from '@/core/common/presentation/components/ui/button';
import {
  Card,
  CardContent,
} from '@/core/common/presentation/components/ui/card';
import { Input } from '@/core/common/presentation/components/ui/input';
import { Label } from '@/core/common/presentation/components/ui/label';
import { AuthImageDark, AuthImageLight } from '@/core/constants/images';

export function ResetPasswordForm() {
  const { theme } = useTheme();
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
            <div className="grid gap-3">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input id="password" type="password" required />
            </div>
            <div className="grid gap-3">
              <div className="flex items-center">
                <Label htmlFor="password">Confirm Password</Label>
              </div>
              <Input id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full">
              Reset password
            </Button>
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
