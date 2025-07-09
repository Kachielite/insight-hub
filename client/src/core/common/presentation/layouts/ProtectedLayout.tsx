import { Outlet } from 'react-router-dom';

const ProtectedLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation header */}
      <header className="border-b">
        <div className="flex h-16 items-center px-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold">InsightHub</h1>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            {/* User menu, notifications, etc. */}
            <button className="text-sm">Logout</button>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default ProtectedLayout;
