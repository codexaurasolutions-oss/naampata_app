import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Image, RefreshControl } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';

export default function MyListingsScreen({ navigation }: any) {
  const [refreshing, setRefreshing] = React.useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['myListings'],
    queryFn: () => api.listings.getMyListings(),
  });

  const listings = data?.data || [];

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <View className="flex-1 bg-[#FDFCFB]">
      <View className="bg-white pt-14 pb-4 px-4 shadow-sm z-10 border-b border-slate-100 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Icon name="arrow-back" size={24} color="#112D4E" />
        </TouchableOpacity>
        <Text className="text-xl font-black text-[#112D4E]">My Listings</Text>
      </View>

      <ScrollView
        className="flex-1 px-4 pt-6"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF7A30" />}
      >
        <View className="flex-row justify-between items-end mb-6">
          <View>
            <Text className="text-3xl font-black text-[#0F2747]">Manage Listings</Text>
            <Text className="text-slate-500 font-medium mt-1">Update your business profiles.</Text>
          </View>
          <TouchableOpacity
            className="bg-[#112D4E] w-12 h-12 rounded-xl items-center justify-center shadow-sm"
            onPress={() => navigation.navigate('AddListing')}
          >
            <Icon name="add" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <ActivityIndicator color="#FF7A30" className="my-10" />
        ) : listings.length === 0 ? (
          <View className="items-center justify-center py-20 bg-white rounded-3xl border border-slate-100">
            <Icon name="storefront" size={64} color="#CBD5E1" />
            <Text className="text-xl font-bold text-slate-800 mt-4 mb-2">No active listings</Text>
            <TouchableOpacity
              className="bg-[#FF7A30] px-6 py-3 rounded-xl mt-4"
              onPress={() => navigation.navigate('AddListing')}
            >
              <Text className="text-white font-bold">Add Business Now</Text>
            </TouchableOpacity>
          </View>
        ) : (
          listings.map((biz: any, index: number) => (
            <View key={biz.id || index} className="bg-white rounded-3xl p-4 mb-4 shadow-sm border border-slate-100">
              <View className="flex-row mb-4">
                <Image
                  source={{ uri: biz.coverImage || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=200&auto=format&fit=crop' }}
                  className="w-20 h-20 rounded-2xl bg-slate-200"
                />
                <View className="flex-1 ml-4 justify-center">
                  <Text className="text-lg font-bold text-slate-900 mb-1">{biz.name}</Text>
                  <Text className="text-slate-500 text-xs mb-2">{biz.category?.name || 'Category'}</Text>
                  <View className={`self-start px-2 py-1 rounded-md ${biz.status === 'approved' || biz.status === 'APPROVED' ? 'bg-green-100' : 'bg-orange-100'}`}>
                    <Text className={`text-[10px] font-black uppercase ${biz.status === 'approved' || biz.status === 'APPROVED' ? 'text-green-700' : 'text-orange-700'}`}>
                      {biz.status || 'Pending'}
                    </Text>
                  </View>
                </View>
              </View>
              <View className="flex-row border-t border-slate-50 pt-3">
                <TouchableOpacity
                  className="flex-1 py-2 items-center flex-row justify-center border-r border-slate-100"
                  onPress={() => navigation.navigate('EditListing', { listingId: biz.id })}
                >
                  <Icon name="edit" size={18} color="#64748B" />
                  <Text className="font-bold text-slate-600 ml-2">Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 py-2 items-center flex-row justify-center"
                  onPress={() => navigation.navigate('BusinessDetail', { id: biz.id, slug: biz.slug })}
                >
                  <Icon name="visibility" size={18} color="#3B82F6" />
                  <Text className="font-bold text-blue-500 ml-2">View</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
