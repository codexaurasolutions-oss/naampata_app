import { Alert } from 'react-native';
import { useAuthStore } from '../stores/authStore';

export function requireAuth(navigation: any, action: () => void, message?: string) {
  const { isAuthenticated } = useAuthStore.getState();
  if (isAuthenticated) {
    action();
  } else {
    Alert.alert(
      'Login Required',
      message || 'Please login to use this feature.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => navigation.navigate('Auth', { screen: 'Login' }) },
      ]
    );
  }
}
