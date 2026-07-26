import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, ScrollView, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuthStore } from '../../stores/authStore';
import { googleLogin } from '../../hooks/useGoogleAuth';

export default function RegisterScreen({ navigation }: any) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [role, setRole] = useState<'user' | 'vendor'>('user');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { register } = useAuthStore();

  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirmPassword || !phone) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    if (!agreedToTerms) {
      Alert.alert('Error', 'You must agree to the Terms & Conditions.');
      return;
    }

    setLoading(true);
    try {
      await register({
        fullName,
        email,
        phone,
        password,
        role,
      });
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Registration Failed', error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setGoogleLoading(true);
    try {
      await googleLogin();
    } catch (error: any) {
      console.warn('Google register failed:', error);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>

        <View className="items-center mb-8">
          <Text className="text-4xl font-black text-slate-900 mb-2">Join Naampata</Text>
          <Text className="text-slate-500 font-medium text-center px-4">
            One account to browse local businesses or list your own when you are ready.
          </Text>
        </View>

        <View className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm mb-6">

          <View className="mb-4">
            <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">
              Full Name
            </Text>
            <View className="bg-slate-50 flex-row items-center rounded-2xl px-4 py-4 border border-transparent focus:border-blue-500/20">
              <Icon name="person" size={20} color="#CBD5E1" />
              <TextInput
                placeholder="Enter your full name"
                className="flex-1 ml-3 text-slate-900 font-bold"
                value={fullName}
                onChangeText={setFullName}
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">
              Phone Number
            </Text>
            <View className="bg-slate-50 flex-row items-center rounded-2xl px-4 py-4 border border-transparent focus:border-blue-500/20">
              <Icon name="phone" size={20} color="#CBD5E1" />
              <TextInput
                placeholder="e.g. +923001234567"
                className="flex-1 ml-3 text-slate-900 font-bold"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">
              Email Address
            </Text>
            <View className="bg-slate-50 flex-row items-center rounded-2xl px-4 py-4 border border-transparent focus:border-blue-500/20">
              <Icon name="mail" size={20} color="#CBD5E1" />
              <TextInput
                placeholder="name@example.com"
                className="flex-1 ml-3 text-slate-900 font-bold"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">
              Password
            </Text>
            <View className="bg-slate-50 flex-row items-center rounded-2xl px-4 py-4 border border-transparent focus:border-blue-500/20">
              <Icon name="lock" size={20} color="#CBD5E1" />
              <TextInput
                placeholder="At least 8 characters"
                className="flex-1 ml-3 text-slate-900 font-bold"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                placeholderTextColor="#94A3B8"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Icon name={showPassword ? "visibility-off" : "visibility"} size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">
              Re-type Password
            </Text>
            <View className="bg-slate-50 flex-row items-center rounded-2xl px-4 py-4 border border-transparent focus:border-blue-500/20">
              <Icon name="lock" size={20} color="#CBD5E1" />
              <TextInput
                placeholder="Re-type your password"
                className="flex-1 ml-3 text-slate-900 font-bold"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholderTextColor="#94A3B8"
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Icon name={showConfirmPassword ? "visibility-off" : "visibility"} size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">
              I want to
            </Text>
            <View className="flex-row">
              <TouchableOpacity
                className={`flex-1 py-3 rounded-xl items-center mr-2 border ${role === 'user' ? 'bg-[#112D4E] border-[#112D4E]' : 'bg-white border-slate-200'}`}
                onPress={() => setRole('user')}
              >
                <Text className={`font-bold ${role === 'user' ? 'text-white' : 'text-slate-600'}`}>Find Services</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-3 rounded-xl items-center border ${role === 'vendor' ? 'bg-[#112D4E] border-[#112D4E]' : 'bg-white border-slate-200'}`}
                onPress={() => setRole('vendor')}
              >
                <Text className={`font-bold ${role === 'vendor' ? 'text-white' : 'text-slate-600'}`}>List My Business</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            className="flex-row items-center mb-6 pl-1"
            onPress={() => setAgreedToTerms(!agreedToTerms)}
            activeOpacity={0.7}
          >
            <View className={`w-5 h-5 rounded border-2 items-center justify-center mr-3 ${agreedToTerms ? 'bg-[#FF7A30] border-[#FF7A30]' : 'border-slate-300'}`}>
              {agreedToTerms && <Icon name="check" size={14} color="#FFF" />}
            </View>
            <Text className="text-slate-500 font-medium text-xs flex-1">
              I agree to the <Text className="text-[#FF7A30] font-bold">Terms & Conditions</Text> and <Text className="text-[#FF7A30] font-bold">Privacy Policy</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`py-4 rounded-2xl items-center shadow-md mb-4 flex-row justify-center ${(!fullName || !email || !password || !confirmPassword || !phone || !agreedToTerms) ? 'bg-slate-300' : 'bg-[#112D4E]'}`}
            onPress={handleRegister}
            disabled={loading || !fullName || !email || !password || !confirmPassword || !phone || !agreedToTerms}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Text className="text-white font-black text-sm mr-2">Create Account</Text>
                <Icon name="arrow-forward" size={18} color="#FFF" />
              </>
            )}
          </TouchableOpacity>

          <View className="flex-row items-center mb-6">
            <View className="flex-1 h-[1px] bg-slate-200" />
            <Text className="px-4 text-slate-400 text-sm font-medium">or continue with</Text>
            <View className="flex-1 h-[1px] bg-slate-200" />
          </View>

          <TouchableOpacity
            className="bg-white flex-row items-center justify-center rounded-xl px-4 py-3 border border-slate-200 shadow-sm mb-4"
            onPress={handleGoogleRegister}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <ActivityIndicator color="#FF7A30" />
            ) : (
              <>
            <Icon name="google" size={22} color="#DB4437" />
                <Text className="text-slate-700 font-bold text-base">Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center mt-2">
            <Text className="text-slate-500 font-bold text-sm">Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text className="text-[#FF7A30] font-bold text-sm">Log in here</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}