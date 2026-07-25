import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';

type TabType = 'businesses' | 'offers';

export default function SavedScreen({ navigation }: any) {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>('businesses');
  const [refreshing, setRefreshing] = useState(false);

  const { data: favoritesData, isLoading: loadingBiz, refetch: refetchBiz } = useQuery({
    queryKey: ['savedBusinesses'],
    queryFn: () => api.users.getFavorites(),
    enabled: isAuthenticated && activeTab === 'businesses',
  });

  const { data: savedOffersData, isLoading: loadingOffers, refetch: refetchOffers } = useQuery({
    queryKey: ['savedOffers'],
    queryFn: () => api.users.getSavedOffers(),
    enabled: isAuthenticated && activeTab === 'offers',
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: (businessId: string) => api.users.removeFavorite(businessId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedBusinesses'] });
    },
    onError: () => Alert.alert('Error', 'Failed to remove from saved.'),
  });

  const removeSavedOfferMutation = useMutation({
    mutationFn: (offerEventId: string) => api.users.removeSavedOffer(offerEventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedOffers'] });
    },
    onError: () => Alert.alert('Error', 'Failed to remove saved offer.'),
  });

  const businesses = favoritesData?.data || [];
  const offers = savedOffersData?.data || [];
  const isLoading = activeTab === 'businesses' ? loadingBiz : loadingOffers;
  const items = activeTab === 'businesses' ? businesses : offers;

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchBiz(), refetchOffers()]);
    setRefreshing(false);
  };

  const handleUnsave = (item: any) => {
    Alert.alert('Remove', 'Remove from saved items?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          if (activeTab === 'businesses') {
            removeFavoriteMutation.mutate(item.businessId || item.id);
          } else {
            removeSavedOfferMutation.mutate(item.offerEventId || item.id);
          }
        },
      },
    ]);
  };

  if (!isAuthenticated) {
    return (
      <View className="flex-1 bg-[#F8FAFC] items-center justify-center px-4">
        <View className="w-24 h-24 bg-[#112D4E]/10 rounded-full items-center justify-center mb-6">
          <Icon name="bookmark-border" size={48} color="#112D4E" />
        </View>
        <Text className="text-2xl font-bold text-[#112D4E] mb-2 text-center">Save Your Favorites</Text>
        <Text className="text-slate-500 text-center mb-8">
          Log in to save businesses, offers, and access them quickly later.
        </Text>
        <TouchableOpacity
          className="bg-[#FF7A30] px-8 py-4 rounded-xl shadow-sm"
          onPress={() => navigation.navigate('Auth', { screen: 'Login' })}
        >
          <Text className="text-white font-bold text-lg">Sign In Now</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F8FAFC] pt-12 px-4">
      <View className="flex-row justify-between items-end mb-4">
        <View>
          <Text className="text-3xl font-bold text-[#112D4E] mb-1">Saved Items</Text>
        </View>
      </View>

      <View className="flex-row bg-slate-100 p-1 rounded-2xl mb-6">
        <TouchableOpacity
          className={`flex-1 py-3 rounded-xl items-center ${activeTab === 'businesses' ? 'bg-white shadow-sm' : ''}`}
          onPress={() => setActiveTab('businesses')}
        >
          <Text className={`font-bold ${activeTab === 'businesses' ? 'text-[#112D4E]' : 'text-slate-500'}`}>Businesses</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-3 rounded-xl items-center ${activeTab === 'offers' ? 'bg-white shadow-sm' : ''}`}
          onPress={() => setActiveTab('offers')}
        >
          <Text className={`font-bold ${activeTab === 'offers' ? 'text-[#112D4E]' : 'text-slate-500'}`}>Offers & Deals</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF7A30" />}
      >
        {isLoading ? (
          <ActivityIndicator color="#FF7A30" className="my-10" />
        ) : items.length > 0 ? (
          items.map((item: any, index: number) => {
            const isOffer = activeTab === 'offers';
            const business = isOffer ? (item.offerEvent?.business || item.business) : item.business;
            const imgUrl = isOffer
              ? (item.offerEvent?.imageUrl || item.offerEvent?.image)
              : (business?.coverImage || item.coverImage);
            const title = isOffer
              ? (item.offerEvent?.title || item.title)
              : (business?.name || item.name || item.businessName);
            const subtitle = isOffer
              ? (item.offerEvent?.type || 'Offer')
              : (business?.category?.name || 'Business');
            const rating = business?.rating || item.rating;
            const itemId = isOffer ? (item.offerEventId || item.offerEvent?.id || item.id) : (item.businessId || business?.id || item.id);

            return (
              <View key={item.id || index} className="bg-white rounded-3xl p-3 mb-4 shadow-sm border border-slate-100 flex-row items-center">
                <TouchableOpacity
                  className="flex-row items-center flex-1"
                  onPress={() => {
                    if (isOffer) return;
                    navigation.navigate('BusinessDetail', { id: itemId });
                  }}
                >
                  <Image
                    source={{ uri: imgUrl || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=200&auto=format&fit=crop' }}
                    className="w-24 h-24 rounded-2xl bg-slate-200"
                  />
                  <View className="flex-1 ml-4 justify-center">
                    <Text className="text-xs font-bold mb-1 text-slate-400">{subtitle}</Text>
                    <Text className="text-lg font-bold text-[#112D4E] mb-1" numberOfLines={2}>{title || 'Saved Item'}</Text>
                    {!isOffer && rating ? (
                      <View className="flex-row items-center">
                        <Icon name="star" size={14} color="#F59E0B" />
                        <Text className="text-slate-900 font-bold text-xs ml-1">{Number(rating).toFixed(1)}</Text>
                      </View>
                    ) : null}
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  className="p-2"
                  onPress={() => handleUnsave(item)}
                >
                  <Icon name="bookmark" size={24} color="#FF7A30" />
                </TouchableOpacity>
              </View>
            );
          })
        ) : (
          <View className="items-center justify-center py-20 mt-10">
            <Icon name={activeTab === 'businesses' ? 'storefront' : 'local-offer'} size={64} color="#E2E8F0" />
            <Text className="text-slate-400 mt-4 text-center px-8">
              {activeTab === 'businesses'
                ? "You haven't saved any businesses yet."
                : "You haven't clipped any offers or deals yet."}
            </Text>
          </View>
        )}
        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
