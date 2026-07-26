import React, { useEffect } from 'react';
import { View, Text, Animated, Easing, Image } from 'react-native';
import { useAuthStore } from '../../stores/authStore';

export default function SplashScreen({ navigation }: any) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const fadeValue = new Animated.Value(0);
  const scaleValue = new Animated.Value(0.8);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeValue, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      if (isAuthenticated) {
        navigation.replace('Main');
      } else {
        navigation.replace('Auth');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  return (
    <View style={{ flex: 1, backgroundColor: '#112D4E', alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', top: -120, left: -80, width: 300, height: 300, borderRadius: 150, backgroundColor: '#1A3A63', opacity: 0.5 }} />
      <View style={{ position: 'absolute', bottom: -60, right: -60, width: 200, height: 200, borderRadius: 100, backgroundColor: '#FF7A30', opacity: 0.15 }} />

      <Animated.View style={{ opacity: fadeValue, transform: [{ scale: scaleValue }], alignItems: 'center' }}>
        <View style={{ width: 120, height: 120, backgroundColor: '#FFFFFF', borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 12 }}>
          <Image
            source={{ uri: 'https://naampata.com/logo.png' }}
            style={{ width: 80, height: 80 }}
            resizeMode="contain"
          />
        </View>
        <Text style={{ fontSize: 36, fontWeight: '900', color: '#FFFFFF', letterSpacing: 4, marginBottom: 8 }}>NAAMPATA</Text>
        <Text style={{ fontSize: 12, color: '#FF7A30', fontWeight: '700', letterSpacing: 6, textTransform: 'uppercase' }}>Directory & Search</Text>
      </Animated.View>

      <Animated.View style={{ position: 'absolute', bottom: 80, opacity: fadeValue, alignItems: 'center' }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginBottom: 4 }}>Welcome</Text>
        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Finding the best businesses near you...</Text>
      </Animated.View>
    </View>
  );
}
