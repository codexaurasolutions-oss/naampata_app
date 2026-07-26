import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Image, RefreshControl, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';

export default function MyListingsScreen({ navigation }: any) {
  const [refreshing, setRefreshing] = React.useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['myListings'],
    queryFn: () => api.listings.getMyListings(),
  });

  const listings = data?.data || [];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.listings.delete(id),
    onSuccess: () => {
      Alert.alert('Deleted', 'Listing deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['myListings'] });
    },
    onError: () => Alert.alert('Error', 'Failed to delete listing.'),
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Listing', 'Are you sure you want to delete this listing? This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(id) },
    ]);
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return { bg: 'bg-green-100', text: 'text-green-700', label: 'Approved' };
      case 'pending':
        return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' };
      case 'rejected':
        return { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected' };
      default:
        return { bg: 'bg-slate-100', text: 'text-slate-600', label: status || 'Unknown' };
    }
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
          listings.map((biz: any, index: number) => {
            const badge = getStatusBadge(biz.status);
            return (
              <View key={biz.id || index} className="bg-white rounded-3xl p-4 mb-4 shadow-sm border border-slate-100">
                <View className="flex-row mb-4">
                  <Image
                    source={{ uri: biz.coverImageUrl || biz.coverImage || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=200&auto=format&fit=crop' }}
                    className="w-20 h-20 rounded-2xl bg-slate-200"
                  />
                  <View className="flex-1 ml-4 justify-center">
                    <Text className="text-lg font-bold text-slate-900 mb-1">{biz.title || biz.name}</Text>
                    <Text className="text-slate-500 text-xs mb-2">{biz.category?.name || 'Category'}</Text>
                    <View className={`self-start px-3 py-1 rounded-full ${badge.bg}`}>
                      <Text className={`text-[10px] font-black uppercase ${badge.text}`}>
                        {badge.label}
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
                    className="flex-1 py-2 items-center flex-row justify-center border-r border-slate-100"
                    onPress={() => navigation.navigate('BusinessDetail', { id: biz.id, slug: biz.slug })}
                  >
                    <Icon name="visibility" size={18} color="#3B82F6" />
                    <Text className="font-bold text-blue-500 ml-2">View</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 py-2 items-center flex-row justify-center"
                    onPress={() => handleDelete(biz.id)}
                  >
                    <Icon name="delete-outline" size={18} color="#EF4444" />
                    <Text className="font-bold text-red-500 ml-2">Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
