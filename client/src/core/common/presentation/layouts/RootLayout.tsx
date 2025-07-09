import { Outlet } from 'react-router-dom';

import { ModeToggle } from '@/core/common/presentation/components/mode-toggle.tsx';

const RootLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Global components like notifications, modals, etc. */}
      <ModeToggle />
      <Outlet />
    </div>
  );
};

export default RootLayout;
