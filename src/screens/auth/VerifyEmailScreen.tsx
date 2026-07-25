import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../services/api';

export default function VerifyEmailScreen({ route, navigation }: any) {
  const emailParam = route.params?.email || '';
  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState('');

  const verifyMutation = useMutation({
    mutationFn: (data: { email: string, otp: string }) => api.auth.verifyEmail(data.email, data.otp),
    onSuccess: () => {
      Alert.alert(
        "Verified! 🎉", 
        "Your email has been successfully verified. You can now log in.",
        [{ text: "Login Now", onPress: () => navigation.navigate('Login') }]
      );
    },
    onError: (err: any) => {
      Alert.alert("Error", err.response?.data?.message || "Invalid or expired OTP code.");
    }
  });

  const handleVerify = () => {
    if (!email || !otp) {
      Alert.alert("Required", "Please enter both email and OTP code.");
      return;
    }
    verifyMutation.mutate({ email: email.trim(), otp: otp.trim() });
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-[#FDFCFB]">
      <View className="bg-white pt-14 pb-4 px-4 shadow-sm z-10 border-b border-slate-100 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Icon name="arrow-back" size={24} color="#112D4E" />
        </TouchableOpacity>
        <Text className="text-xl font-black text-[#112D4E]">Verify Email</Text>
      </View>

      <View className="flex-1 px-6 pt-10">
        <View className="w-16 h-16 bg-orange-50 rounded-2xl items-center justify-center mb-6 border border-orange-100">
          <Icon name="mark-email-read" size={32} color="#FF7A30" />
        </View>

        <Text className="text-3xl font-black text-[#0F2747] mb-2">Check your Inbox</Text>
        <Text className="text-slate-500 font-medium mb-10 leading-relaxed">
          We've sent a 6-digit verification code to your email. Enter it below to verify your account.
        </Text>

        <View className="mb-4">
          <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">Email Address</Text>
          <View className="bg-white border border-slate-200 rounded-2xl flex-row items-center px-4 h-14">
            <Icon name="email" size={20} color="#94A3B8" />
            <TextInput 
              className="flex-1 ml-3 text-slate-800 text-base"
              placeholder="Enter your email address"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>
        </View>

        <View className="mb-8">
          <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">6-Digit Code (OTP)</Text>
          <View className="bg-white border border-slate-200 rounded-2xl flex-row items-center px-4 h-14">
            <Icon name="password" size={20} color="#94A3B8" />
            <TextInput 
              className="flex-1 ml-3 text-slate-800 text-base tracking-[0.5em] font-bold"
              placeholder="••••••"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={setOtp}
            />
          </View>
        </View>

        <TouchableOpacity 
          className="bg-[#FF7A30] h-14 rounded-2xl items-center justify-center shadow-md shadow-orange-900/20"
          onPress={handleVerify}
          disabled={verifyMutation.isPending}
        >
          {verifyMutation.isPending ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text className="text-white font-bold text-lg">Verify Account</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
