import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';

type TabType = 'all' | 'deals' | 'events';

export default function OffersScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [showCityFilter, setShowCityFilter] = useState(false);

  const { data: dealsData, isLoading: loadingDeals, refetch: refetchDeals } = useQuery({
    queryKey: ['deals', 'public'],
    queryFn: () => api.deals.searchPublic({ limit: 20 }),
    enabled: activeTab === 'all' || activeTab === 'deals',
  });

  const { data: eventsData, isLoading: loadingEvents, refetch: refetchEvents } = useQuery({
    queryKey: ['events', 'public'],
    queryFn: () => api.events.searchPublic({ limit: 20 }),
    enabled: activeTab === 'all' || activeTab === 'events',
  });

  const { data: citiesData } = useQuery({ queryKey: ['cities'], queryFn: () => api.cities.getAll() });
  const cities = citiesData?.data || [];

  const isLoading = loadingDeals || loadingEvents;

  let items: any[] = [];
  if (activeTab === 'all') {
    const deals = (dealsData?.data || []).map((d: any) => ({ ...d, _type: 'deal' }));
    const events = (eventsData?.data || []).map((e: any) => ({ ...e, _type: 'event' }));
    items = [...deals, ...events].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  } else if (activeTab === 'deals') {
    items = (dealsData?.data || []).map((d: any) => ({ ...d, _type: 'deal' }));
  } else {
    items = (eventsData?.data || []).map((e: any) => ({ ...e, _type: 'event' }));
  }

  if (selectedCity) {
    items = items.filter((item: any) => {
      const itemCity = item.city || item.business?.city || '';
      return itemCity.toLowerCase() === selectedCity.toLowerCase();
    });
  }

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchDeals(), refetchEvents()]);
    setRefreshing(false);
  };

  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: 'all', label: 'All', icon: 'apps' },
    { key: 'deals', label: 'Deals', icon: 'local-offer' },
    { key: 'events', label: 'Events', icon: 'event' },
  ];

  return (
    <View className="flex-1 bg-[#FDFCFB] pt-12 px-4">
      <View className="mb-4">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-3xl font-bold text-[#112D4E] mb-2">Offers & Events</Text>
            <Text className="text-slate-500 text-base">Discover the latest deals and happenings near you.</Text>
          </View>
          <TouchableOpacity
            className={`w-10 h-10 rounded-full items-center justify-center border ${selectedCity ? 'bg-[#FF7A30] border-[#FF7A30]' : 'bg-white border-slate-200'}`}
            onPress={() => setShowCityFilter(!showCityFilter)}
          >
            <Icon name="location-on" size={20} color={selectedCity ? '#FFF' : '#64748B'} />
          </TouchableOpacity>
        </View>
      </View>

      {showCityFilter && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          <TouchableOpacity
            className={`px-4 py-2 rounded-full mr-2 border ${!selectedCity ? 'bg-[#FF7A30] border-[#FF7A30]' : 'bg-white border-slate-200'}`}
            onPress={() => setSelectedCity('')}
          >
            <Text className={`font-bold text-sm ${!selectedCity ? 'text-white' : 'text-slate-600'}`}>All Cities</Text>
          </TouchableOpacity>
          {cities.map((city: any) => (
            <TouchableOpacity
              key={city.id}
              className={`px-4 py-2 rounded-full mr-2 border ${selectedCity === city.name ? 'bg-[#FF7A30] border-[#FF7A30]' : 'bg-white border-slate-200'}`}
              onPress={() => setSelectedCity(selectedCity === city.name ? '' : city.name)}
            >
              <Text className={`font-bold text-sm ${selectedCity === city.name ? 'text-white' : 'text-slate-600'}`}>{city.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <View className="flex-row bg-slate-100 p-1 rounded-2xl mb-6">
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            className={`flex-1 py-3 rounded-xl items-center flex-row justify-center ${activeTab === tab.key ? 'bg-white shadow-sm' : ''}`}
            onPress={() => setActiveTab(tab.key)}
          >
            <Icon name={tab.icon} size={16} color={activeTab === tab.key ? '#112D4E' : '#94A3B8'} />
            <Text className={`font-bold text-sm ml-1 ${activeTab === tab.key ? 'text-[#112D4E]' : 'text-slate-500'}`}>{tab.label}</Text>
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
            const isEvent = item._type === 'event';
            const title = item.title || item.name || 'Untitled';
            const businessName = item.business?.businessName || item.business?.name || item.businessName || '';
            const imageUrl = item.imageUrl || item.bannerUrl || item.image || item.coverImage;
            const endDate = item.endDate || item.startDate || '';
            const badge = isEvent ? 'Event' : 'Deal';
            const badgeColor = isEvent ? 'bg-purple-500' : 'bg-[#FF7A30]';

            return (
              <TouchableOpacity
                key={item.id || index}
                className="bg-white rounded-3xl mb-5 shadow-sm border border-slate-100 overflow-hidden"
                onPress={() => {
                  if (isEvent) {
                    navigation.navigate('BusinessDetail', { id: item.businessId || item.business?.id });
                  } else {
                    navigation.navigate('BusinessDetail', { id: item.businessId || item.business?.id });
                  }
                }}
              >
                {imageUrl ? (
                  <Image source={{ uri: imageUrl }} className="w-full h-40 bg-slate-200" />
                ) : (
                  <View className="w-full h-40 bg-slate-100 items-center justify-center">
                    <Icon name={isEvent ? 'event' : 'local-offer'} size={48} color="#CBD5E1" />
                  </View>
                )}
                <View className={`absolute top-3 left-3 ${badgeColor} px-3 py-1 rounded-full`}>
                  <Text className="text-white text-xs font-bold uppercase">{badge}</Text>
                </View>

                <View className="p-4">
                  <Text className="text-lg font-bold text-[#112D4E] mb-1" numberOfLines={2}>{title}</Text>
                  {businessName ? (
                    <View className="flex-row items-center mb-3">
                      <Icon name="storefront" size={16} color="#94A3B8" />
                      <Text className="text-slate-500 font-medium text-sm ml-1">{businessName}</Text>
                    </View>
                  ) : null}

                  <View className="flex-row justify-between items-center border-t border-slate-100 pt-3 mt-1">
                    {endDate ? (
                      <View className="flex-row items-center">
                        <Icon name="schedule" size={16} color="#FF7A30" />
                        <Text className="text-[#FF7A30] text-xs font-bold ml-1">
                          {new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </Text>
                      </View>
                    ) : <View />}
                    <TouchableOpacity className="bg-[#112D4E]/10 px-4 py-2 rounded-lg">
                      <Text className="text-[#112D4E] font-bold text-xs">View Details</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View className="items-center justify-center py-20">
            <Icon name="local-offer" size={64} color="#E2E8F0" />
            <Text className="text-slate-400 mt-4 text-center px-8">
              {activeTab === 'deals' ? 'No deals available right now.' : activeTab === 'events' ? 'No events happening right now.' : 'No offers or events yet.'}
            </Text>
          </View>
        )}
        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
