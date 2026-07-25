import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';

export default function DealsScreen({ navigation }: any) {
  const { data, isLoading } = useQuery({
    queryKey: ['vendorDeals'],
    queryFn: () => api.deals.getVendorDeals(),
  });

  const deals = data?.data || [];

  return (
    <View className="flex-1 bg-[#FDFCFB]">
      {/* Header */}
      <View className="bg-white pt-14 pb-4 px-4 flex-row items-center justify-between shadow-sm z-10">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#112D4E" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-[#112D4E] ml-4">My Offers & Deals</Text>
        </View>
        <TouchableOpacity className="bg-[#FF7A30] w-10 h-10 rounded-full items-center justify-center shadow-sm">
          <Icon name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <ActivityIndicator color="#FF7A30" className="mt-10" />
        ) : deals.length === 0 ? (
          <View className="items-center justify-center py-20 mt-10">
            <View className="w-24 h-24 bg-purple-50 rounded-full items-center justify-center mb-6 border border-purple-100">
              <Icon name="local-offer" size={48} color="#A855F7" />
            </View>
            <Text className="text-xl font-bold text-slate-900 mb-2">No Active Deals</Text>
            <Text className="text-slate-500 text-center px-6 mb-8">
              Post an exclusive offer or deal to attract more customers to your business!
            </Text>
            <TouchableOpacity className="bg-slate-900 px-8 py-4 rounded-xl flex-row items-center">
              <Icon name="add" size={20} color="#FFF" />
              <Text className="text-white font-bold ml-2">Create New Deal</Text>
            </TouchableOpacity>
          </View>
        ) : (
          deals.map((deal: any, index: number) => (
            <View key={deal.id || index} className="bg-white rounded-3xl overflow-hidden mb-4 border border-slate-100 shadow-sm">
              <Image 
                source={{ uri: deal.imageUrl || 'https://images.unsplash.com/photo-1555529902-5261145633bf?q=80&w=600&auto=format&fit=crop' }} 
                className="w-full h-40" 
              />
              <View className="p-5">
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1">
                    <Text className="font-black text-[#112D4E] text-lg mb-1">{deal.title || 'Special Summer Discount'}</Text>
                    <Text className="text-slate-500" numberOfLines={2}>
                      {deal.description || 'Get 20% off all our services when you book through Naampata this month.'}
                    </Text>
                  </View>
                  <View className="bg-green-50 px-3 py-1 rounded-full border border-green-200 ml-3">
                    <Text className="text-green-600 font-black text-xs uppercase">Active</Text>
                  </View>
                </View>
                
                <View className="flex-row justify-between items-center mt-4 pt-4 border-t border-slate-50">
                  <View className="flex-row items-center">
                    <Icon name="visibility" size={16} color="#94A3B8" />
                    <Text className="text-slate-500 text-xs font-medium ml-1 mr-4">120 Views</Text>
                    <Icon name="touch-app" size={16} color="#94A3B8" />
                    <Text className="text-slate-500 text-xs font-medium ml-1">45 Clicks</Text>
                  </View>
                  <TouchableOpacity>
                    <Text className="text-[#FF7A30] font-bold text-sm">Edit</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
