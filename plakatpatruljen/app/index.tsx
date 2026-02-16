import { Redirect } from 'expo-router';
import { useAuth } from '@/lib/auth/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function Index() {
  const { isAuthenticated, isLoading, user, orgStatus } = useAuth();

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/welcome" />;
  }

  if (user?.role === 'worker') {
    return <Redirect href="/(worker)" />;
  }

  if (user?.role === 'party_admin') {
    if (orgStatus === 'approved') {
      return <Redirect href="/(party)" />;
    }
    // pending, rejected, or suspended → show pending approval screen
    return <Redirect href="/(auth)/pending-approval" />;
  }

  if (user?.role === 'platform_admin') {
    return <Redirect href="/(admin)" />;
  }

  // No role detected — redirect to welcome
  return <Redirect href="/(auth)/welcome" />;
}
