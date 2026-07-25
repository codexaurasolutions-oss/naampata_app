import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';

export default function EventsScreen({ navigation }: any) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { data: eventsData, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => api.events.searchPublic({ limit: 20 }),
  });

  const events = eventsData?.data || eventsData || [];

  return (
    <View className="flex-1 bg-[#FDFCFB]">
      {/* Header */}
      <View className="bg-white pt-14 pb-4 px-4 shadow-sm z-10 border-b border-slate-100 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
            <Icon name="arrow-back" size={24} color="#112D4E" />
          </TouchableOpacity>
          <Text className="text-2xl font-black text-[#112D4E]">Local Events</Text>
        </View>
        <TouchableOpacity className="w-10 h-10 bg-slate-50 rounded-full items-center justify-center border border-slate-100">
          <Icon name="search" size={20} color="#64748B" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Featured Banner */}
        <View className="p-4 pt-6">
          <View className="bg-[#112D4E] rounded-3xl p-6 shadow-sm overflow-hidden relative">
            <View className="absolute top-0 right-0 opacity-10">
              <Icon name="event" size={150} color="#FFF" />
            </View>
            <View className="flex-row items-center gap-2 mb-2">
              <Icon name="celebration" size={16} color="#FF7A30" />
              <Text className="text-[#FF7A30] font-black text-[10px] uppercase tracking-widest">Happening Now</Text>
            </View>
            <Text className="text-white text-2xl font-black leading-tight mb-2 max-w-[80%]">
              Discover Local Events Near You
            </Text>
            <Text className="text-blue-200 text-sm font-medium mb-6 max-w-[70%]">
              Don't miss out on what's happening in your city today.
            </Text>
          </View>
        </View>

        {/* Categories / Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 mb-6">
          {['All Events', 'Music', 'Food', 'Business', 'Sports', 'Arts'].map((cat, idx) => {
            const isSelected = selectedCategory === (idx === 0 ? 'all' : cat.toLowerCase());
            return (
              <TouchableOpacity 
                key={idx}
                className={`px-5 py-2.5 rounded-full mr-2 border ${isSelected ? 'bg-[#FF7A30] border-[#FF7A30]' : 'bg-white border-slate-200'}`}
                onPress={() => setSelectedCategory(idx === 0 ? 'all' : cat.toLowerCase())}
              >
                <Text className={`font-bold ${isSelected ? 'text-white' : 'text-slate-600'}`}>{cat}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Events Feed */}
        <View className="px-4 pb-10">
          {isLoading ? (
            <ActivityIndicator color="#FF7A30" className="my-10" />
          ) : events.length > 0 ? (
            events.map((item: any, index: number) => (
              <TouchableOpacity 
                key={item.id || index}
                className="bg-white rounded-3xl mb-5 shadow-sm border border-slate-100 overflow-hidden"
                onPress={() => navigation.navigate('BusinessDetail', { id: item.businessId })}
              >
                <View className="h-40 bg-slate-200 w-full" />
                <View className="absolute top-3 left-3 bg-[#A855F7] px-3 py-1 rounded-full">
                  <Text className="text-white text-xs font-bold uppercase">Event</Text>
                </View>
                <View className="p-4">
                  <Text className="text-lg font-bold text-[#112D4E] mb-1">{item.title || 'Local Event'}</Text>
                  <View className="flex-row items-center mb-3">
                    <Icon name="storefront" size={16} color="#94A3B8" />
                    <Text className="text-slate-500 font-medium text-sm ml-1">{item.businessName || item.business?.name}</Text>
                  </View>
                  <View className="flex-row justify-between items-center border-t border-slate-100 pt-3 mt-1">
                    <View className="flex-row items-center">
                      <Icon name="event" size={16} color="#FF7A30" />
                      <Text className="text-[#FF7A30] text-xs font-bold ml-1">{item.endDate || 'Upcoming'}</Text>
                    </View>
                    <View className="bg-blue-50 px-4 py-2 rounded-lg">
                      <Text className="text-blue-600 font-bold text-xs">View Details</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View className="items-center mt-10">
              <View className="w-20 h-20 bg-slate-100 rounded-full items-center justify-center mb-4">
                <Icon name="event-busy" size={40} color="#94A3B8" />
              </View>
              <Text className="text-xl font-bold text-slate-800 mb-2">No Events Found</Text>
              <Text className="text-slate-500 text-center font-medium">Check back later for exciting new local events.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
