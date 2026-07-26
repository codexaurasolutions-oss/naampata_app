import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuthStore } from '../../stores/authStore';
import { googleLogin } from '../../hooks/useGoogleAuth';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }
    setLoading(true);
    try {
      await login({ email, password });
    } catch (error: any) {
      Alert.alert('Login Failed', error.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await googleLogin();
    } catch (error: any) {
      console.warn('Google login failed:', error);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#F8FAFC] px-5 justify-center"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View className="mb-10">
        <View className="flex-row items-center mb-4">
          <Image
            source={{ uri: 'https://naampata.com/logo.png' }}
            style={{ width: 48, height: 48 }}
            resizeMode="contain"
          />
        </View>
        <Text className="text-4xl font-black text-[#112D4E] mb-2">Welcome Back!</Text>
        <Text className="text-slate-500 text-base">Sign in to manage your NAAMPATA account.</Text>
      </View>

      <View className="bg-white flex-row items-center rounded-xl px-4 py-3.5 mb-4 border border-slate-200">
        <Icon name="email" size={22} color="#94A3B8" />
        <TextInput
          placeholder="Email Address"
          className="flex-1 ml-3 text-slate-900 text-base"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          placeholderTextColor="#CBD5E1"
        />
      </View>

      <View className="bg-white flex-row items-center rounded-xl px-4 py-3.5 mb-6 border border-slate-200">
        <Icon name="lock" size={22} color="#94A3B8" />
        <TextInput
          placeholder="Password"
          className="flex-1 ml-3 text-slate-900 text-base"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          placeholderTextColor="#CBD5E1"
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Icon name={showPassword ? 'visibility' : 'visibility-off'} size={20} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        className="bg-[#112D4E] py-4 rounded-xl items-center shadow-md mb-4"
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text className="text-white font-bold text-lg">Sign In</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
        <Text className="text-[#FF7A30] text-sm font-medium text-right mb-6">Forgot Password?</Text>
      </TouchableOpacity>

      <View className="flex-row items-center mb-6">
        <View className="flex-1 h-[1px] bg-slate-200" />
        <Text className="px-4 text-slate-400 text-sm font-medium">or continue with</Text>
        <View className="flex-1 h-[1px] bg-slate-200" />
      </View>

      <TouchableOpacity
        className="bg-white flex-row items-center justify-center rounded-xl px-4 py-3.5 border border-slate-200 shadow-sm mb-8"
        onPress={handleGoogleLogin}
        disabled={googleLoading}
      >
        {googleLoading ? (
          <ActivityIndicator color="#FF7A30" />
        ) : (
          <>
            <Icon name="google" size={22} color="#DB4437" />
            <Text className="text-slate-700 font-bold text-base ml-3">Continue with Google</Text>
          </>
        )}
      </TouchableOpacity>

      <View className="flex-row justify-center">
        <Text className="text-slate-500">Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text className="text-[#FF7A30] font-bold">Sign Up</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
