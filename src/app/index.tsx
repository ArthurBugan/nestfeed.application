import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { useAuthStore } from '@/stores';
import { LoadingState } from '@/components/states';
import apiClient from '@/api/client';

export default function Index() {
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function init() {
      await apiClient.loadAuthToken();
      await checkAuth();
      setIsLoading(false);
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <LoadingState
        label="Starting"
        className="flex-1 items-center justify-center bg-background"
      />
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(app)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
