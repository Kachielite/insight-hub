import { Outlet } from 'react-router-dom';

import AgreementLink from '@/features/Authentication/presentation/components/agreement-link.tsx';

const RootLayout = () => {
  return (
    <div className="h-screen w-screen bg-background flex flex-col justify-center items-center gap-6">
      <Outlet />
      <AgreementLink />
    </div>
  );
};

export default RootLayout;
