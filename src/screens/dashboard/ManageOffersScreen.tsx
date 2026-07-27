import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, TextInput, Modal, RefreshControl } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';

type TabType = 'deals' | 'events';

export default function ManageOffersScreen({ navigation }: any) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>('deals');
  const [showCreate, setShowCreate] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [badge, setBadge] = useState('');
  const [terms, setTerms] = useState('');

  const { data: dealsData, isLoading: loadingDeals, refetch: refetchDeals } = useQuery({
    queryKey: ['vendorDeals'],
    queryFn: () => api.deals.getVendorDeals(),
    enabled: activeTab === 'deals',
  });

  const { data: eventsData, isLoading: loadingEvents, refetch: refetchEvents } = useQuery({
    queryKey: ['vendorEvents'],
    queryFn: () => api.events.getVendorEvents(),
    enabled: activeTab === 'events',
  });

  const items = activeTab === 'deals' ? (dealsData || []) : (eventsData || []);
  const isLoading = activeTab === 'deals' ? loadingDeals : loadingEvents;

  const createDealMutation = useMutation({
    mutationFn: (data: any) => api.deals.create(data),
    onSuccess: () => {
      Alert.alert('Success', 'Deal created successfully!');
      setShowCreate(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['vendorDeals'] });
    },
    onError: (error: any) => Alert.alert('Error', error.response?.data?.message || 'Failed to create deal.'),
  });

  const createEventMutation = useMutation({
    mutationFn: (data: any) => api.events.create(data),
    onSuccess: () => {
      Alert.alert('Success', 'Event created successfully!');
      setShowCreate(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['vendorEvents'] });
    },
    onError: (error: any) => Alert.alert('Error', error.response?.data?.message || 'Failed to create event.'),
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id, type }: { id: string; type: string }) =>
      type === 'deal' ? api.deals.delete(id) : api.events.delete(id),
    onSuccess: () => {
      Alert.alert('Deleted', 'Item deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['vendorDeals'] });
      queryClient.invalidateQueries({ queryKey: ['vendorEvents'] });
    },
    onError: (error: any) => Alert.alert('Error', error.response?.data?.message || 'Failed to delete.'),
  });

  const publishMutation = useMutation({
    mutationFn: ({ id, type }: { id: string; type: string }) =>
      type === 'deal' ? api.deals.publish(id) : api.events.publish(id),
    onSuccess: () => {
      Alert.alert('Published', 'Item is now live!');
      queryClient.invalidateQueries({ queryKey: ['vendorDeals'] });
      queryClient.invalidateQueries({ queryKey: ['vendorEvents'] });
    },
    onError: (error: any) => Alert.alert('Error', error.response?.data?.message || 'Failed to publish.'),
  });

  const resetForm = () => {
    setTitle(''); setDescription(''); setStartDate(''); setEndDate(''); setBadge(''); setTerms('');
  };

  const handleCreate = () => {
    if (!title.trim()) return Alert.alert('Error', 'Title is required.');
    if (!description.trim()) return Alert.alert('Error', 'Description is required.');

    const data: any = { title, description, terms };
    if (startDate) data.startDate = startDate;
    if (endDate) data.endDate = endDate;
    if (badge) data.badge = badge;

    if (activeTab === 'deals') createDealMutation.mutate(data);
    else createEventMutation.mutate(data);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate({ id, type: activeTab === 'deals' ? 'deal' : 'event' }) },
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchDeals(), refetchEvents()]);
    setRefreshing(false);
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-700';
      case 'draft': return 'bg-yellow-100 text-yellow-700';
      case 'expired': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <View className="flex-1 bg-[#FDFCFB]">
      <View className="bg-white pt-14 pb-4 px-4 shadow-sm z-10 border-b border-slate-100 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Icon name="arrow-back" size={24} color="#112D4E" />
        </TouchableOpacity>
        <Text className="text-xl font-black text-[#112D4E]">Manage Offers</Text>
      </View>

      <View className="flex-row px-4 pt-4">
        <TouchableOpacity
          className={`flex-1 py-3 rounded-xl items-center mr-2 border ${activeTab === 'deals' ? 'bg-[#112D4E] border-[#112D4E]' : 'bg-white border-slate-200'}`}
          onPress={() => setActiveTab('deals')}
        >
          <Text className={`font-bold ${activeTab === 'deals' ? 'text-white' : 'text-slate-600'}`}>Offers</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-3 rounded-xl items-center border ${activeTab === 'events' ? 'bg-[#112D4E] border-[#112D4E]' : 'bg-white border-slate-200'}`}
          onPress={() => setActiveTab('events')}
        >
          <Text className={`font-bold ${activeTab === 'events' ? 'text-white' : 'text-slate-600'}`}>Events</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 px-4 pt-4"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF7A30" />}
      >
        <TouchableOpacity
          className="bg-[#FF7A30] py-4 rounded-xl items-center flex-row justify-center mb-6"
          onPress={() => setShowCreate(true)}
        >
          <Icon name="add" size={22} color="#FFF" />
          <Text className="text-white font-bold ml-2">Create {activeTab === 'deals' ? 'Offer' : 'Event'}</Text>
        </TouchableOpacity>

        {isLoading ? (
          <ActivityIndicator color="#FF7A30" className="my-10" />
        ) : items.length > 0 ? (
          items.map((item: any) => (
            <View key={item.id} className="bg-white rounded-2xl p-4 mb-4 border border-slate-100 shadow-sm">
              <View className="flex-row justify-between items-start mb-2">
                <Text className="text-lg font-bold text-[#112D4E] flex-1 mr-2" numberOfLines={2}>{item.title}</Text>
                <View className={`px-2 py-1 rounded-full ${statusColor(item.status)}`}>
                  <Text className={`text-xs font-bold capitalize ${statusColor(item.status).split(' ')[1]}`}>{item.status || 'draft'}</Text>
                </View>
              </View>
              <Text className="text-slate-500 text-sm mb-3" numberOfLines={2}>{item.description}</Text>
              <View className="flex-row items-center mb-3">
                <Icon name="schedule" size={14} color="#94A3B8" />
                <Text className="text-slate-400 text-xs ml-1">
                  {item.startDate ? new Date(item.startDate).toLocaleDateString() : 'No date'} - {item.endDate ? new Date(item.endDate).toLocaleDateString() : 'No end'}
                </Text>
              </View>
              <View className="flex-row justify-end">
                {item.status === 'draft' && (
                  <TouchableOpacity
                    className="bg-green-500 px-4 py-2 rounded-lg mr-2"
                    onPress={() => publishMutation.mutate({ id: item.id, type: activeTab === 'deals' ? 'deal' : 'event' })}
                  >
                    <Text className="text-white font-bold text-xs">Publish</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  className="bg-red-50 px-4 py-2 rounded-lg border border-red-100"
                  onPress={() => handleDelete(item.id)}
                >
                  <Text className="text-red-500 font-bold text-xs">Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View className="items-center justify-center py-20">
            <Icon name="local-offer" size={64} color="#CBD5E1" />
            <Text className="text-xl font-bold text-slate-800 mt-4 mb-2">No {activeTab} yet</Text>
            <Text className="text-slate-500 text-center px-8">Create your first {activeTab === 'deals' ? 'offer' : 'event'} to attract more customers.</Text>
          </View>
        )}
        <View className="h-20" />
      </ScrollView>

      <Modal visible={showCreate} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-[#FDFCFB]">
          <View className="bg-white pt-14 pb-4 px-4 shadow-sm flex-row items-center justify-between">
            <TouchableOpacity onPress={() => { setShowCreate(false); resetForm(); }}>
              <Icon name="close" size={24} color="#112D4E" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-[#112D4E]">New {activeTab === 'deals' ? 'Offer' : 'Event'}</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView className="flex-1 px-4 py-6" keyboardShouldPersistTaps="handled">
            <Text className="font-bold text-slate-700 mb-2">Title *</Text>
            <TextInput
              className="bg-white border border-slate-200 rounded-xl p-4 text-slate-900 mb-4"
              placeholder="e.g. 50% Off Summer Sale"
              placeholderTextColor="#94A3B8"
              value={title}
              onChangeText={setTitle}
            />

            <Text className="font-bold text-slate-700 mb-2">Description *</Text>
            <TextInput
              className="bg-white border border-slate-200 rounded-2xl p-4 h-32 text-slate-900 mb-4"
              placeholder="Describe your offer..."
              placeholderTextColor="#94A3B8"
              multiline
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />

            <Text className="font-bold text-slate-700 mb-2">Start Date</Text>
            <TextInput
              className="bg-white border border-slate-200 rounded-xl p-4 text-slate-900 mb-4"
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#94A3B8"
              value={startDate}
              onChangeText={setStartDate}
            />

            <Text className="font-bold text-slate-700 mb-2">End Date</Text>
            <TextInput
              className="bg-white border border-slate-200 rounded-xl p-4 text-slate-900 mb-4"
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#94A3B8"
              value={endDate}
              onChangeText={setEndDate}
            />

            <Text className="font-bold text-slate-700 mb-2">Badge</Text>
            <TextInput
              className="bg-white border border-slate-200 rounded-xl p-4 text-slate-900 mb-4"
              placeholder="e.g. Limited Time, New, Popular"
              placeholderTextColor="#94A3B8"
              value={badge}
              onChangeText={setBadge}
            />

            <Text className="font-bold text-slate-700 mb-2">Terms & Conditions</Text>
            <TextInput
              className="bg-white border border-slate-200 rounded-2xl p-4 h-24 text-slate-900 mb-6"
              placeholder="Any terms or conditions..."
              placeholderTextColor="#94A3B8"
              multiline
              textAlignVertical="top"
              value={terms}
              onChangeText={setTerms}
            />

            <TouchableOpacity
              className="bg-[#FF7A30] py-4 rounded-xl items-center mb-8"
              onPress={handleCreate}
              disabled={createDealMutation.isPending || createEventMutation.isPending}
            >
              {(createDealMutation.isPending || createEventMutation.isPending) ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text className="text-white font-bold text-lg">Create {activeTab === 'deals' ? 'Offer' : 'Event'}</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
