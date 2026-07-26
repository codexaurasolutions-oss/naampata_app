import React from 'react';
import { View, Text, TouchableOpacity, Image, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuthStore } from '../../stores/authStore';
import FadeInView from '../../components/FadeInView';

export default function ProfileScreen({ navigation }: any) {
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
  };

  const menuItems = [
    ...(isAuthenticated && user?.role === 'vendor' ? [
      { icon: 'storefront', label: 'Vendor Dashboard', color: '#112D4E', onPress: () => navigation.navigate('Dashboard') },
    ] : []),
    ...(isAuthenticated ? [
      { icon: 'favorite-border', label: 'Saved Items', color: '#FF7A30', onPress: () => navigation.navigate('Saved') },
      { icon: 'group', label: 'Following', color: '#10B981', onPress: () => navigation.navigate('Dashboard', { screen: 'Following' }) },
      { icon: 'chat', label: 'Messages', color: '#8B5CF6', onPress: () => navigation.navigate('Dashboard', { screen: 'Messages' }) },
      { icon: 'notifications-none', label: 'Notifications', color: '#F59E0B', onPress: () => navigation.navigate('Dashboard', { screen: 'Notifications' }) },
    ] : []),
    { icon: 'settings', label: 'Settings', color: '#64748B', onPress: () => navigation.navigate('Settings') },
    { icon: 'help-outline', label: 'Help & Support', color: '#3B82F6', onPress: () => Linking.openURL('https://naampata.com/contact') },
    { icon: 'description', label: 'Terms of Service', color: '#64748B', onPress: () => Linking.openURL('https://naampata.com/legal/terms') },
    { icon: 'privacy-tip', label: 'Privacy Policy', color: '#64748B', onPress: () => Linking.openURL('https://naampata.com/legal/privacy') },
  ];

  return (
    <View className="flex-1 bg-[#F8FAFC] pt-12 px-4">
      <FadeInView delay={0} direction="up">
        <View className="items-center mb-8">
          <View className="w-24 h-24 rounded-full items-center justify-center mb-4 overflow-hidden border-4 border-white shadow-md bg-slate-200">
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} className="w-full h-full" />
            ) : (
              <Icon name="person" size={48} color="#94A3B8" />
            )}
          </View>
          <Text className="text-2xl font-bold text-[#112D4E]">
            {isAuthenticated && user ? (user.fullName || 'User') : 'Guest User'}
          </Text>
          <Text className="text-slate-500">
            {isAuthenticated && user ? user.email : 'Sign in to manage your account'}
          </Text>
          {isAuthenticated && user?.role === 'vendor' && (
            <View className="bg-[#112D4E]/10 px-3 py-1 rounded-full mt-2">
              <Text className="text-[#112D4E] text-xs font-bold">Business Owner</Text>
            </View>
          )}
        </View>
      </FadeInView>

      {!isAuthenticated ? (
        <FadeInView delay={100} direction="up">
          <TouchableOpacity
            className="bg-[#FF7A30] py-4 rounded-2xl items-center mb-6 shadow-sm flex-row justify-center"
            onPress={() => navigation.navigate('Auth', { screen: 'Register' })}
          >
            <Icon name="person-add" size={22} color="#FFF" />
            <Text className="text-white font-semibold text-lg ml-2">Log In / Sign Up</Text>
          </TouchableOpacity>
        </FadeInView>
      ) : (
        <FadeInView delay={100} direction="up">
          <TouchableOpacity
            className="bg-[#112D4E] py-4 rounded-2xl items-center mb-6 shadow-sm flex-row justify-center"
            onPress={() => user?.role === 'vendor' ? navigation.navigate('Dashboard') : navigation.navigate('Dashboard', { screen: 'AddListing' })}
          >
            <Icon name={user?.role === 'vendor' ? 'storefront' : 'add-business'} size={22} color="#FFF" />
            <Text className="text-white font-semibold text-lg ml-2">
              {user?.role === 'vendor' ? 'Vendor Dashboard' : 'Register Business'}
            </Text>
          </TouchableOpacity>
        </FadeInView>
      )}

      <FadeInView delay={250} direction="up">
        <View className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
          {menuItems.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              className={`flex-row items-center p-4 ${idx < menuItems.length - 1 ? 'border-b border-slate-50' : ''}`}
              onPress={item.onPress}
            >
              <View className="w-10 h-10 rounded-xl items-center justify-center mr-4" style={{ backgroundColor: `${item.color}15` }}>
                <Icon name={item.icon} size={22} color={item.color} />
              </View>
              <Text className="flex-1 text-base font-bold text-slate-800">{item.label}</Text>
              <Icon name="chevron-right" size={24} color="#CBD5E1" />
            </TouchableOpacity>
          ))}
        </View>
      </FadeInView>

      {isAuthenticated && (
        <FadeInView delay={350} direction="up">
          <TouchableOpacity
            className="mt-4 bg-white border border-red-100 py-4 rounded-2xl items-center flex-row justify-center shadow-sm"
            onPress={handleLogout}
          >
            <Icon name="logout" size={22} color="#EF4444" />
            <Text className="text-red-500 font-semibold text-lg ml-2">Log Out</Text>
          </TouchableOpacity>
        </FadeInView>
      )}

      <View className="h-20" />
    </View>
  );
}
