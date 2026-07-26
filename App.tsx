import './global.css';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SocketProvider } from './src/providers/SocketProvider';
import { configureGoogleSignIn } from './src/hooks/useGoogleAuth';
import { useAuthStore } from './src/stores/authStore';

const queryClient = new QueryClient();

export default function App(): React.JSX.Element {
  const checkSession = useAuthStore(state => state.checkSession);

  useEffect(() => {
    configureGoogleSignIn();
    checkSession();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <SocketProvider>
          <RootNavigator />
        </SocketProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
