import { Loader } from 'lucide-react';

import { cn } from '@/core/lib/utils.ts';

function CustomLoader({ isFullScreen = false }: { isFullScreen?: boolean }) {
  return (
    <div
      className={cn(
        'flex items-center justify-center',
        isFullScreen ? 'h-screen w-screen' : 'h-[calc(100vh-4rem)] w-full'
      )}
    >
      <Loader className="h-[1.25rem] w-[1.25rem] animate-spin text-white" />
    </div>
  );
}

export default CustomLoader;
