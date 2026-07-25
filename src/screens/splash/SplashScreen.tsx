import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function SplashScreen({ navigation }: any) {
  const { checkSession } = useAuthStore();
  const spinValue = new Animated.Value(0);
  const fadeValue = new Animated.Value(0);

  useEffect(() => {
    // Start animations
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

    // Verify session and transition
    const initApp = async () => {
      await checkSession();
      // Minimum display time for branding
      setTimeout(() => {
        navigation.replace('Main');
      }, 1500);
    };

    initApp();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <View className="flex-1 bg-[#112D4E] items-center justify-center relative overflow-hidden">
      {/* Background Decorators */}
      <View className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-[#1A3A63] rounded-full opacity-50" />
      <View className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#FF7A30] rounded-full opacity-20" />

      <Animated.View style={{ opacity: fadeValue }} className="items-center z-10">
        <View className="w-24 h-24 bg-white rounded-3xl items-center justify-center shadow-xl mb-6 relative">
          <Icon name="storefront" size={48} color="#FF7A30" />
          <Animated.View 
            style={{ transform: [{ rotate: spin }] }}
            className="absolute inset-0 border-4 border-dashed border-[#112D4E]/10 rounded-3xl"
          />
        </View>
        <Text className="text-4xl font-black text-white tracking-widest mb-2">NAAMPATA</Text>
        <Text className="text-orange-400 font-bold uppercase tracking-[0.2em] text-xs">Directory & Search</Text>
      </Animated.View>

      <View className="absolute bottom-10 items-center w-full">
        <Text className="text-white/40 text-xs font-medium">Initializing Secure Environment...</Text>
      </View>
    </View>
  );
}
