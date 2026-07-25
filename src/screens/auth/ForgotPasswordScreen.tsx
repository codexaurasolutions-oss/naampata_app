import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../services/api';

type Step = 'email' | 'reset';

export default function ForgotPasswordScreen({ navigation }: any) {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const requestMutation = useMutation({
    mutationFn: (email: string) => api.auth.forgotPassword(email),
    onSuccess: () => {
      setStep('reset');
    },
    onError: (err: any) => {
      Alert.alert("Error", err.response?.data?.message || "Something went wrong. Please try again.");
    }
  });

  const resetMutation = useMutation({
    mutationFn: () => api.auth.resetPassword(email.trim(), code.trim(), newPassword),
    onSuccess: () => {
      Alert.alert(
        "Password Reset", 
        "Password reset successfully! You can now sign in with your new password.",
        [{ text: "OK", onPress: () => navigation.navigate('Login') }]
      );
    },
    onError: (err: any) => {
      Alert.alert("Error", err.response?.data?.message || "Invalid or expired code. Please try again.");
    }
  });

  const handleRequestCode = () => {
    if (!email || !email.includes('@')) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }
    requestMutation.mutate(email.trim());
  };

  const handleResetPassword = () => {
    if (!code || code.length < 6) {
      Alert.alert("Error", "Please enter the 6-digit reset code.");
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }
    resetMutation.mutate();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-white">
      <View className="bg-white pt-14 pb-4 px-4 shadow-sm z-10 border-b border-slate-100 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Icon name="arrow-back" size={24} color="#112D4E" />
        </TouchableOpacity>
        <Text className="text-xl font-black text-[#112D4E]">
          {step === 'email' ? 'Forgot Password' : 'Reset Password'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }}>
        <View className="w-16 h-16 bg-blue-50 rounded-2xl items-center justify-center mb-6 border border-blue-100 self-center">
          <Icon name="vpn-key" size={32} color="#2563EB" />
        </View>

        <Text className="text-3xl font-black text-center text-[#0F2747] mb-2">
          {step === 'email' ? 'Forgot Password?' : 'Reset Password'}
        </Text>
        <Text className="text-slate-500 text-center font-medium mb-10 leading-relaxed px-4">
          {step === 'email' 
            ? "Enter your email and we'll send you a reset code."
            : `Enter the code sent to ${email}`
          }
        </Text>

        {step === 'email' ? (
          <View className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm mb-6">
            <View className="mb-6">
              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">Email Address</Text>
              <View className="bg-slate-50 flex-row items-center rounded-2xl px-4 py-4 border border-transparent focus:border-blue-500/20">
                <Icon name="email" size={20} color="#CBD5E1" />
                <TextInput 
                  className="flex-1 ml-3 text-slate-900 font-bold"
                  placeholder="name@example.com"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            <TouchableOpacity 
              className={`py-4 rounded-2xl items-center shadow-md flex-row justify-center ${!email ? 'bg-slate-300' : 'bg-[#112D4E]'}`}
              onPress={handleRequestCode}
              disabled={requestMutation.isPending || !email}
            >
              {requestMutation.isPending ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Text className="text-white font-bold text-sm mr-2">Send Reset Code</Text>
                  <Icon name="arrow-forward" size={18} color="#FFF" />
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm mb-6">
            <View className="mb-4">
              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">Reset Code</Text>
              <View className="bg-slate-50 flex-row items-center rounded-2xl px-4 py-4 border border-transparent focus:border-blue-500/20">
                <Icon name="vpn-key" size={20} color="#CBD5E1" />
                <TextInput 
                  className="flex-1 ml-3 text-slate-900 font-bold tracking-widest text-lg"
                  placeholder="000000"
                  placeholderTextColor="#94A3B8"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={code}
                  onChangeText={(val) => setCode(val.replace(/\D/g, ''))}
                />
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">New Password</Text>
              <View className="bg-slate-50 flex-row items-center rounded-2xl px-4 py-4 border border-transparent focus:border-blue-500/20">
                <Icon name="lock" size={20} color="#CBD5E1" />
                <TextInput 
                  className="flex-1 ml-3 text-slate-900 font-bold"
                  placeholder="At least 8 characters"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Icon name={showPassword ? "visibility-off" : "visibility"} size={20} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">Confirm Password</Text>
              <View className="bg-slate-50 flex-row items-center rounded-2xl px-4 py-4 border border-transparent focus:border-blue-500/20">
                <Icon name="lock" size={20} color="#CBD5E1" />
                <TextInput 
                  className="flex-1 ml-3 text-slate-900 font-bold"
                  placeholder="Re-type your password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showConfirm}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                  <Icon name={showConfirm ? "visibility-off" : "visibility"} size={20} color="#94A3B8" />
                </TouchableOpacity>
              </View>
              {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                <Text className="text-xs text-red-500 font-bold ml-1 mt-1">Passwords do not match</Text>
              )}
            </View>

            <TouchableOpacity 
              className={`py-4 rounded-2xl items-center shadow-md flex-row justify-center ${(!code || !newPassword || !confirmPassword || newPassword !== confirmPassword) ? 'bg-slate-300' : 'bg-[#112D4E]'}`}
              onPress={handleResetPassword}
              disabled={resetMutation.isPending || !code || !newPassword || !confirmPassword || newPassword !== confirmPassword}
            >
              {resetMutation.isPending ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Text className="text-white font-bold text-sm mr-2">Reset Password</Text>
                  <Icon name="check-circle" size={18} color="#FFF" />
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              className="mt-6 items-center"
              onPress={() => { setStep('email'); setCode(''); }}
            >
              <Text className="text-slate-500 font-bold text-sm">Use a different email</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
