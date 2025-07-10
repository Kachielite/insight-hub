import { useTheme } from 'next-themes';

import { Button } from '@/core/common/presentation/components/ui/button';
import {
  Card,
  CardContent,
} from '@/core/common/presentation/components/ui/card';
import { Input } from '@/core/common/presentation/components/ui/input';
import { Label } from '@/core/common/presentation/components/ui/label';
import { AuthImageDark, AuthImageLight } from '@/core/constants/images';

export function RequestPasswordResetForm() {
  const { theme } = useTheme();
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
            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Send reset link
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
