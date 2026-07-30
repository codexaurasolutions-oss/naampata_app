import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Switch, Linking, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuthStore } from '../../stores/authStore';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../services/api';
import * as ImagePicker from 'react-native-image-picker';

export default function SettingsScreen({ navigation }: any) {
  const { user, isAuthenticated, logout } = useAuthStore();
  
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => api.users.updateProfile(data),
    onSuccess: () => {
      Alert.alert('Success', 'Profile updated successfully!');
    },
    onError: () => {
      Alert.alert('Error', 'Failed to update profile.');
    }
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: any) => api.users.changePassword(data),
    onSuccess: () => {
      Alert.alert('Success', 'Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update password. Make sure your current password is correct.');
    }
  });

  const notificationSettingsMutation = useMutation({
    mutationFn: (data: any) => api.users.updateNotificationSettings(data),
    onSuccess: () => {},
    onError: () => {},
  });

  const handleUpdateProfile = () => {
    updateProfileMutation.mutate({ fullName, email });
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword) return Alert.alert('Error', 'Please fill in both password fields.');
    if (newPassword.length < 6) return Alert.alert('Error', 'New password must be at least 6 characters.');
    changePasswordMutation.mutate({ currentPassword, newPassword });
  };

  const handleLogout = async () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: async () => {
            await logout();
            navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
          } 
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    navigation.navigate('DeleteAccount');
  };

  const pickImage = async () => {
    const options = {
      mediaType: 'photo' as const,
      quality: 0.8 as any,
      maxWidth: 500,
      maxHeight: 500,
      includeBase64: false,
    };

    try {
      const result = await ImagePicker.launchImageLibrary(options);
      if (result.didCancel) {
        console.log('[ImagePicker] User cancelled');
      } else if (result.errorCode) {
        console.error('[ImagePicker] Error:', result.errorMessage);
        Alert.alert('Error', result.errorMessage || 'Failed to pick image');
      } else if (result.assets && result.assets[0]) {
        const asset = result.assets[0];
        if (asset.uri) uploadAvatar(asset.uri);
      }
    } catch (e: any) {
      console.error('[ImagePicker] Launch failed:', e);
      Alert.alert('Error', 'Failed to open image picker.');
    }
  };

  const uploadAvatar = async (uri: string) => {
    try {
      const { data: signData } = await api.cloudinary.getSignature();
      const { signature, timestamp, apiKey, folder, uploadPreset } = signData;

      const formData = new FormData();
      formData.append('file', {
        uri,
        type: 'image/jpeg',
        name: 'avatar.jpg',
      } as any);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);
      formData.append('folder', folder || 'naampata/avatars');
      if (uploadPreset) formData.append('upload_preset', uploadPreset);

      const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const result = await uploadResponse.json();
      if (result.secure_url) {
        await api.users.updateAvatar(result.secure_url);
        Alert.alert('Success', 'Profile photo updated!');
      } else {
        Alert.alert('Error', 'Upload failed');
      }
    } catch (error) {
      console.error('[Avatar Upload] Error:', error);
      Alert.alert('Error', 'Failed to upload photo');
    }
  };

  if (!isAuthenticated) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-4">
        <Icon name="lock-outline" size={64} color="#CBD5E1" className="mb-4" />
        <Text className="text-xl font-bold text-[#112D4E] mb-2">Not Logged In</Text>
        <Text className="text-slate-500 text-center mb-6">You must be logged in to access account settings.</Text>
        <TouchableOpacity 
          className="bg-[#FF7A30] px-8 py-3 rounded-xl"
          onPress={() => navigation.navigate('Auth', { screen: 'Login' })}
        >
          <Text className="text-white font-bold">Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#FDFCFB]">
      {/* Header */}
      <View className="bg-white pt-14 pb-4 px-4 flex-row items-center justify-between shadow-sm z-10">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#112D4E" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-[#112D4E] ml-4">Account Settings</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
        
        {/* Avatar Upload */}
        <View className="items-center mb-8">
          <View className="w-24 h-24 rounded-full items-center justify-center mb-4 overflow-hidden border-4 border-white shadow-sm relative">
            {user?.avatarUrl ? (
              <Image
                source={{ uri: user.avatarUrl }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <Icon name="person" size={64} color="#CBD5E1" />
            )}
          </View>
          <TouchableOpacity 
            className="bg-slate-100 px-4 py-2 rounded-full border border-slate-200 flex-row items-center"
            onPress={pickImage}
          >
            <Icon name="photo-camera" size={16} color="#64748B" />
            <Text className="text-slate-600 font-bold text-xs ml-2 uppercase tracking-widest">Change Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Personal Info */}
        <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm mb-6">
          <Text className="font-bold text-[#112D4E] mb-4 text-lg">Personal Information</Text>
          
          <Text className="text-slate-500 text-xs font-bold uppercase mb-1 ml-1">Full Name</Text>
          <View className="bg-slate-50 rounded-xl border border-slate-200 px-4 h-12 justify-center mb-4">
            <TextInput 
              value={fullName}
              onChangeText={setFullName}
              className="text-slate-800"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <Text className="text-slate-500 text-xs font-bold uppercase mb-1 ml-1">Email Address</Text>
          <View className="bg-slate-50 rounded-xl border border-slate-200 px-4 h-12 justify-center mb-6">
            <TextInput 
              value={email}
              onChangeText={setEmail}
              className="text-slate-800"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity 
            className="bg-[#112D4E] py-4 rounded-xl items-center flex-row justify-center"
            onPress={handleUpdateProfile}
            disabled={updateProfileMutation.isPending}
          >
            {updateProfileMutation.isPending ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text className="text-white font-bold">Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Notification Preferences */}
        <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm mb-6">
          <Text className="font-bold text-[#112D4E] mb-4 text-lg">Notifications</Text>
          
          <View className="flex-row justify-between items-center mb-4">
            <View>
              <Text className="font-bold text-slate-800 text-base">Push Notifications</Text>
              <Text className="text-slate-500 text-sm">Alerts for leads and messages</Text>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={(val) => {
                setPushEnabled(val);
                notificationSettingsMutation.mutate({ pushEnabled: val });
              }}
              trackColor={{ false: '#CBD5E1', true: '#FF7A30' }}
            />
          </View>
          
          <View className="h-[1px] bg-slate-100 mb-4" />
          
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="font-bold text-slate-800 text-base">Email Updates</Text>
              <Text className="text-slate-500 text-sm">Weekly stats and newsletters</Text>
            </View>
            <Switch
              value={emailEnabled}
              onValueChange={(val) => {
                setEmailEnabled(val);
                notificationSettingsMutation.mutate({ emailEnabled: val });
              }}
              trackColor={{ false: '#CBD5E1', true: '#FF7A30' }}
            />
          </View>
        </View>

        {/* Change Password */}
        <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm mb-6">
          <Text className="font-bold text-[#112D4E] mb-4 text-lg">Security</Text>
          
          <Text className="text-slate-500 text-xs font-bold uppercase mb-1 ml-1">Current Password</Text>
          <View className="bg-slate-50 rounded-xl border border-slate-200 px-4 h-12 justify-center mb-4">
            <TextInput 
              value={currentPassword}
              onChangeText={setCurrentPassword}
              className="text-slate-800"
              secureTextEntry
            />
          </View>

          <Text className="text-slate-500 text-xs font-bold uppercase mb-1 ml-1">New Password</Text>
          <View className="bg-slate-50 rounded-xl border border-slate-200 px-4 h-12 justify-center mb-6">
            <TextInput 
              value={newPassword}
              onChangeText={setNewPassword}
              className="text-slate-800"
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            className="bg-slate-900 py-4 rounded-xl items-center"
            onPress={handleChangePassword}
            disabled={changePasswordMutation.isPending}
          >
            {changePasswordMutation.isPending ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text className="text-white font-bold">Update Password</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Help & Legal */}
        <View className="mb-8">
          <Text className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 ml-2">Help & Legal</Text>
          <View className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
            <TouchableOpacity 
              className="flex-row items-center p-4 border-b border-slate-100"
              onPress={() => Linking.openURL('https://naampata.com/contact')}
            >
              <View className="w-10 h-10 bg-blue-50 rounded-xl items-center justify-center mr-4">
                <Icon name="support-agent" size={24} color="#3B82F6" />
              </View>
              <Text className="flex-1 text-base font-bold text-[#112D4E]">Contact Support</Text>
              <Icon name="chevron-right" size={24} color="#CBD5E1" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="flex-row items-center p-4 border-b border-slate-100"
              onPress={() => Linking.openURL('https://naampata.com/legal/privacy')}
            >
              <View className="w-10 h-10 bg-slate-50 rounded-xl items-center justify-center mr-4">
                <Icon name="privacy-tip" size={24} color="#64748B" />
              </View>
              <Text className="flex-1 text-base font-bold text-[#112D4E]">Privacy Policy</Text>
              <Icon name="chevron-right" size={24} color="#CBD5E1" />
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-row items-center p-4"
              onPress={() => Linking.openURL('https://naampata.com/legal/terms')}
            >
              <View className="w-10 h-10 bg-slate-50 rounded-xl items-center justify-center mr-4">
                <Icon name="description" size={24} color="#64748B" />
              </View>
              <Text className="flex-1 text-base font-bold text-[#112D4E]">Terms of Service</Text>
              <Icon name="chevron-right" size={24} color="#CBD5E1" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Danger Zone */}
        <View className="bg-white rounded-3xl p-5 border border-red-100 shadow-sm mb-6">
          <Text className="font-bold text-red-500 mb-4 text-lg">Danger Zone</Text>
          
          <TouchableOpacity 
            className="border border-slate-200 py-4 rounded-xl items-center flex-row justify-center mb-4"
            onPress={handleLogout}
          >
            <Icon name="logout" size={20} color="#64748B" />
            <Text className="text-slate-600 font-bold ml-2">Log Out</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="bg-red-50 py-4 rounded-xl items-center flex-row justify-center border border-red-100"
            onPress={handleDeleteAccount}
          >
            <Icon name="delete-forever" size={20} color="#EF4444" />
            <Text className="text-red-500 font-bold ml-2">Delete Account</Text>
          </TouchableOpacity>
        </View>

        <View className="h-10" />
      </ScrollView>
    </View>
  );
}