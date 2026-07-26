import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';

type TabType = 'businesses' | 'offers' | 'events';

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
    enabled: isAuthenticated && (activeTab === 'offers' || activeTab === 'events'),
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
  const savedOffersRaw = savedOffersData?.data || [];
  const offers = savedOffersRaw.filter((item: any) => item._type === 'deal' || item.type === 'deal' || (!item.startDate && !item.eventDate));
  const events = savedOffersRaw.filter((item: any) => item._type === 'event' || item.type === 'event' || item.startDate || item.eventDate);

  const isLoading = activeTab === 'businesses' ? loadingBiz : loadingOffers;
  const items = activeTab === 'businesses' ? businesses : activeTab === 'offers' ? offers : events;

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

  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: 'businesses', label: 'Businesses', icon: 'storefront' },
    { key: 'offers', label: 'Offers', icon: 'local-offer' },
    { key: 'events', label: 'Events', icon: 'event' },
  ];

  return (
    <View className="flex-1 bg-[#F8FAFC] pt-12 px-4">
      <View className="flex-row justify-between items-end mb-4">
        <View>
          <Text className="text-3xl font-bold text-[#112D4E] mb-1">Saved Items</Text>
        </View>
      </View>

      <View className="flex-row bg-slate-100 p-1 rounded-2xl mb-6">
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.key}
            className={`flex-1 py-3 rounded-xl items-center ${activeTab === tab.key ? 'bg-white shadow-sm' : ''}`}
            onPress={() => setActiveTab(tab.key)}
          >
            <Icon name={tab.icon} size={16} color={activeTab === tab.key ? '#112D4E' : '#94A3B8'} />
            <Text className={`font-bold text-xs mt-1 ${activeTab === tab.key ? 'text-[#112D4E]' : 'text-slate-500'}`}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
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
            let imgUrl = '';
            let title = '';
            let subtitle = '';
            let rating = null;
            let itemId = '';
            let onPressFn: (() => void) | undefined;

            if (activeTab === 'businesses') {
              const biz = item.business || item;
              imgUrl = biz.coverImageUrl || biz.coverImage || '';
              title = biz.title || biz.name || biz.businessName || 'Business';
              subtitle = biz.category?.name || 'Business';
              rating = biz.averageRating || biz.rating;
              itemId = biz.id || item.businessId || item.id;
              onPressFn = () => navigation.navigate('BusinessDetail', { id: itemId });
            } else if (activeTab === 'offers') {
              const offer = item.offerEvent || item;
              imgUrl = offer.imageUrl || offer.bannerUrl || offer.image || '';
              title = offer.title || 'Offer';
              subtitle = offer.business?.businessName || offer.business?.name || 'Deal';
              itemId = item.offerEventId || offer.id || item.id;
              onPressFn = () => navigation.navigate('BusinessDetail', { id: offer.businessId || offer.business?.id });
            } else {
              const event = item.offerEvent || item;
              imgUrl = event.imageUrl || event.bannerUrl || '';
              title = event.title || 'Event';
              subtitle = event.business?.businessName || event.business?.name || 'Event';
              itemId = item.offerEventId || event.id || item.id;
              onPressFn = () => navigation.navigate('BusinessDetail', { id: event.businessId || event.business?.id });
            }

            return (
              <View key={item.id || index} className="bg-white rounded-3xl p-3 mb-4 shadow-sm border border-slate-100 flex-row items-center">
                <TouchableOpacity className="flex-row items-center flex-1" onPress={onPressFn}>
                  <Image
                    source={{ uri: imgUrl || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=200&auto=format&fit=crop' }}
                    className="w-24 h-24 rounded-2xl bg-slate-200"
                  />
                  <View className="flex-1 ml-4 justify-center">
                    <Text className="text-xs font-bold mb-1 text-slate-400">{subtitle}</Text>
                    <Text className="text-lg font-bold text-[#112D4E] mb-1" numberOfLines={2}>{title || 'Saved Item'}</Text>
                    {activeTab === 'businesses' && rating ? (
                      <View className="flex-row items-center">
                        <Icon name="star" size={14} color="#F59E0B" />
                        <Text className="text-slate-900 font-bold text-xs ml-1">{Number(rating).toFixed(1)}</Text>
                      </View>
                    ) : null}
                  </View>
                </TouchableOpacity>
                <TouchableOpacity className="p-2" onPress={() => handleUnsave(item)}>
                  <Icon name="bookmark" size={24} color="#FF7A30" />
                </TouchableOpacity>
              </View>
            );
          })
        ) : (
          <View className="items-center justify-center py-20 mt-10">
            <Icon
              name={activeTab === 'businesses' ? 'storefront' : activeTab === 'offers' ? 'local-offer' : 'event'}
              size={64}
              color="#E2E8F0"
            />
            <Text className="text-slate-400 mt-4 text-center px-8">
              {activeTab === 'businesses'
                ? "You haven't saved any businesses yet."
                : activeTab === 'offers'
                  ? "You haven't clipped any offers or deals yet."
                  : "You haven't saved any events yet."}
            </Text>
          </View>
        )}
        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
