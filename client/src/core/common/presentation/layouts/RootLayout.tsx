import { Outlet } from 'react-router-dom';

const RootLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Global components like notifications, modals, etc. */}
      <Outlet />
    </div>
  );
};

export default RootLayout;
