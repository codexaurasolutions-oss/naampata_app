import './global.css';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LogBox } from 'react-native';
import RootNavigator from './src/navigation/RootNavigator';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SocketProvider } from './src/providers/SocketProvider';
import ErrorBoundary from './src/components/ErrorBoundary';

LogBox.ignoreAllLogs(true);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

function AppContent() {
  useEffect(() => {
    try {
      const { configureGoogleSignIn } = require('./src/hooks/useGoogleAuth');
      configureGoogleSignIn();
    } catch (e) {
      console.warn('[App] Google Sign-In configure skipped:', e);
    }

    try {
      const { useAuthStore } = require('./src/stores/authStore');
      useAuthStore.getState().checkSession();
    } catch (e) {
      console.warn('[App] checkSession skipped:', e);
    }
  }, []);

  return (
    <SocketProvider>
      <RootNavigator />
    </SocketProvider>
  );
}

export default function App(): React.JSX.Element {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <AppContent />
        </SafeAreaProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
