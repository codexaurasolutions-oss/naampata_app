import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuthStore } from '../stores/authStore';

export default function AuthGuard({ navigation, children }: { navigation: any; children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#FF7A30" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <View style={{ width: 80, height: 80, backgroundColor: '#FEF3C7', borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Icon name="lock" size={40} color="#F59E0B" />
        </View>
        <Text style={{ fontSize: 22, fontWeight: '800', color: '#112D4E', marginBottom: 8, textAlign: 'center' }}>Login Required</Text>
        <Text style={{ color: '#64748B', textAlign: 'center', marginBottom: 24, lineHeight: 22 }}>Please login to access your business dashboard.</Text>
        <TouchableOpacity
          style={{ backgroundColor: '#FF7A30', paddingHorizontal: 40, paddingVertical: 16, borderRadius: 16 }}
          onPress={() => navigation.navigate('Auth', { screen: 'Login' })}
        >
          <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 16 }}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <>{children}</>;
}
