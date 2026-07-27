import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function SplashScreen({ navigation }: any) {
  const { checkSession, isAuthenticated } = useAuthStore();
  const spinValue = useRef(new Animated.Value(0)).current;
  const fadeValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      )
    ]).start();

    const initApp = async () => {
      await checkSession();
      setTimeout(() => {
        const state = useAuthStore.getState();
        if (state.isAuthenticated && state.token) {
          navigation.replace('Main');
        } else {
          navigation.replace('Auth');
        }
      }, 1500);
    };

    initApp();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <View style={{ position: 'absolute', top: -80, left: -80, width: 240, height: 240, backgroundColor: '#F1F5F9', borderRadius: 999, opacity: 0.5 }} />
      <View style={{ position: 'absolute', bottom: -40, right: -40, width: 160, height: 160, backgroundColor: '#FF7A30', borderRadius: 999, opacity: 0.1 }} />

      <Animated.View style={{ opacity: fadeValue, alignItems: 'center', zIndex: 10 }}>
        <View style={{ width: 96, height: 96, backgroundColor: '#FFFFFF', borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 24, position: 'relative', borderWidth: 1, borderColor: '#F1F5F9' }}>
          <Icon name="storefront" size={48} color="#FF7A30" />
          <Animated.View
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderWidth: 4, borderStyle: 'dashed', borderColor: '#E2E8F0', borderRadius: 24, transform: [{ rotate: spin }] }}
          />
        </View>
        <Text style={{ fontSize: 36, fontWeight: '900', color: '#112D4E', letterSpacing: 4, marginBottom: 8 }}>NAAMPATA</Text>
        <Text style={{ color: '#FF7A30', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 5, fontSize: 10 }}>Directory & Search</Text>
      </Animated.View>

      <View style={{ position: 'absolute', bottom: 40, alignItems: 'center', width: '100%' }}>
        <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '500' }}>Initializing Secure Environment...</Text>
      </View>
    </View>
  );
}
