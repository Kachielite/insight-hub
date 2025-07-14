import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        {/* You can add your logo or branding here */}
        <div className="text-center">
          <h1 className="text-2xl font-bold">InsightHub</h1>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
