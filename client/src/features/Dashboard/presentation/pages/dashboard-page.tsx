import CustomLoader from '@/core/common/presentation/components/custom-loader.tsx';
import useUser from '@/features/User/presentation/state/hooks/use-user.tsx';

function DashboardPage() {
  const { isLoadingUserData } = useUser();

  if (isLoadingUserData) {
    return <CustomLoader isFullScreen />;
  }

  return <div>DashboardPage</div>;
}

export default DashboardPage;
