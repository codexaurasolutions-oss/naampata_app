import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';

export default function FollowingScreen({ navigation }: any) {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['myFollows'],
    queryFn: () => api.follows.getMyFollows(),
    enabled: isAuthenticated,
  });

  const unfollowMutation = useMutation({
    mutationFn: (businessId: string) => api.follows.unfollow(businessId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myFollows'] });
    },
    onError: () => Alert.alert('Error', 'Failed to unfollow.'),
  });

  const follows = data || [];

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleUnfollow = (businessId: string, name: string) => {
    Alert.alert('Unfollow', `Stop following ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Unfollow', style: 'destructive', onPress: () => unfollowMutation.mutate(businessId) },
    ]);
  };

  if (!isAuthenticated) {
    return (
      <View className="flex-1 bg-[#F8FAFC] items-center justify-center px-4">
        <Icon name="person-add" size={64} color="#CBD5E1" />
        <Text className="text-xl font-bold text-[#112D4E] mt-4 mb-2">Sign in to follow</Text>
        <Text className="text-slate-500 text-center mb-6">Follow your favorite businesses to stay updated.</Text>
        <TouchableOpacity
          className="bg-[#FF7A30] px-8 py-3 rounded-xl"
          onPress={() => navigation.navigate('Auth', { screen: 'Login' })}
        >
          <Text className="text-white font-bold">Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#FDFCFB]">
      <View className="bg-white pt-14 pb-4 px-4 shadow-sm z-10 border-b border-slate-100 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Icon name="arrow-back" size={24} color="#112D4E" />
        </TouchableOpacity>
        <Text className="text-xl font-black text-[#112D4E]">Following</Text>
      </View>

      <ScrollView
        className="flex-1 px-4 pt-6"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF7A30" />}
      >
        {isLoading ? (
          <ActivityIndicator color="#FF7A30" className="my-10" />
        ) : follows.length > 0 ? (
          follows.map((item: any) => {
            const business = item.business || item;
            return (
              <TouchableOpacity
                key={item.id || business.id}
                className="bg-white rounded-3xl p-3 mb-4 shadow-sm border border-slate-100 flex-row items-center"
                onPress={() => navigation.navigate('BusinessDetail', { id: business.id })}
              >
                <Image
                  source={{ uri: business.coverImageUrl || business.logoUrl || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=200&auto=format&fit=crop' }}
                  className="w-20 h-20 rounded-2xl bg-slate-200"
                />
                <View className="flex-1 ml-4 justify-center">
                  <Text className="text-lg font-bold text-[#112D4E]" numberOfLines={1}>{business.title}</Text>
                  <Text className="text-slate-400 text-xs font-medium">{business.category?.name || 'Business'}</Text>
                  <View className="flex-row items-center mt-1">
                    <Icon name="star" size={14} color="#F59E0B" />
                    <Text className="text-slate-700 font-bold text-xs ml-1">{Number(business.averageRating || 0).toFixed(1)}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  className="bg-red-50 px-4 py-2 rounded-xl border border-red-100"
                  onPress={() => handleUnfollow(business.id, business.title)}
                >
                  <Text className="text-red-500 font-bold text-xs">Unfollow</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })
        ) : (
          <View className="items-center justify-center py-20">
            <Icon name="person-add" size={64} color="#E2E8F0" />
            <Text className="text-xl font-bold text-slate-800 mt-4 mb-2">Not following anyone yet</Text>
            <Text className="text-slate-500 text-center px-8">Follow businesses to see their updates here.</Text>
          </View>
        )}
        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
