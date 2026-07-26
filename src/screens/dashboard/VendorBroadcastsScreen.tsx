import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl, Alert, TextInput, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';

export default function VendorBroadcastsScreen({ navigation }: any) {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = React.useState(false);
  const [respondModalVisible, setRespondModalVisible] = useState(false);
  const [selectedBroadcastId, setSelectedBroadcastId] = useState<string | null>(null);
  const [responseMessage, setResponseMessage] = useState('');

  const { data: inboxData, isLoading, refetch } = useQuery({
    queryKey: ['vendorBroadcastInbox'],
    queryFn: () => api.broadcasts.getVendorInbox(),
  });

  const { data: statsData } = useQuery({
    queryKey: ['vendorBroadcastStats'],
    queryFn: () => api.broadcasts.getVendorStats(),
  });

  const respondMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.broadcasts.respond(id, data),
    onSuccess: () => {
      Alert.alert('Sent', 'Your response has been sent!');
      setRespondModalVisible(false);
      setResponseMessage('');
      setSelectedBroadcastId(null);
      queryClient.invalidateQueries({ queryKey: ['vendorBroadcastInbox'] });
    },
    onError: (error: any) => Alert.alert('Error', error.response?.data?.message || 'Failed to respond.'),
  });

  const broadcasts = inboxData || [];
  const stats = statsData || {};

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleRespond = (broadcastId: string) => {
    setSelectedBroadcastId(broadcastId);
    setResponseMessage('');
    setRespondModalVisible(true);
  };

  const submitResponse = () => {
    if (!selectedBroadcastId || !responseMessage.trim()) return;
    respondMutation.mutate({ id: selectedBroadcastId, data: { message: responseMessage.trim() } });
  };

  return (
    <View className="flex-1 bg-[#FDFCFB]">
      <View className="bg-white pt-14 pb-4 px-4 shadow-sm z-10 border-b border-slate-100 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Icon name="arrow-back" size={24} color="#112D4E" />
        </TouchableOpacity>
        <Text className="text-xl font-black text-[#112D4E]">Broadcast Inbox</Text>
      </View>

      <ScrollView
        className="flex-1 px-4 pt-6"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF7A30" />}
      >
        <View className="flex-row items-center mb-2">
          <View className="w-10 h-10 bg-orange-50 rounded-xl items-center justify-center mr-3">
            <Icon name="rss-feed" size={24} color="#FF7A30" />
          </View>
          <Text className="text-3xl font-black text-[#0F2747]">Live Requests</Text>
        </View>
        <Text className="text-slate-500 font-medium mb-4 leading-relaxed">
          Real-time requirements broadcasted by users in your category.
        </Text>

        {stats.totalReceived || stats.newCount ? (
          <View className="flex-row mb-6">
            <View className="bg-white rounded-2xl p-4 flex-1 mr-2 border border-slate-100 shadow-sm items-center">
              <Text className="text-2xl font-black text-[#112D4E]">{stats.totalReceived || 0}</Text>
              <Text className="text-slate-500 text-xs font-medium">Total</Text>
            </View>
            <View className="bg-white rounded-2xl p-4 flex-1 mr-2 border border-slate-100 shadow-sm items-center">
              <Text className="text-2xl font-black text-[#FF7A30]">{stats.newCount || 0}</Text>
              <Text className="text-slate-500 text-xs font-medium">New</Text>
            </View>
            <View className="bg-white rounded-2xl p-4 flex-1 border border-slate-100 shadow-sm items-center">
              <Text className="text-2xl font-black text-green-500">{stats.respondedCount || 0}</Text>
              <Text className="text-slate-500 text-xs font-medium">Responded</Text>
            </View>
          </View>
        ) : null}

        {isLoading ? (
          <ActivityIndicator color="#FF7A30" className="my-10" />
        ) : broadcasts.length > 0 ? (
          broadcasts.map((item: any) => (
            <TouchableOpacity
              key={item.id}
              className="bg-white rounded-2xl p-4 mb-4 border border-slate-100 shadow-sm"
              onPress={() => {
                if (item.status === 'new') handleRespond(item.id);
              }}
            >
              <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1 mr-2">
                  <Text className="text-lg font-bold text-[#112D4E]" numberOfLines={2}>{item.title || item.requirement || 'Broadcast Request'}</Text>
                  <Text className="text-slate-400 text-xs mt-1">
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                  </Text>
                </View>
                {item.status && (
                  <View className={`px-2 py-1 rounded-full ${item.status === 'new' ? 'bg-blue-100' : item.status === 'responded' ? 'bg-green-100' : 'bg-slate-100'}`}>
                    <Text className={`text-xs font-bold capitalize ${item.status === 'new' ? 'text-blue-600' : item.status === 'responded' ? 'text-green-600' : 'text-slate-600'}`}>{item.status}</Text>
                  </View>
                )}
              </View>

              {item.description ? (
                <Text className="text-slate-500 text-sm mb-3" numberOfLines={3}>{item.description}</Text>
              ) : null}

              <View className="flex-row items-center mb-3">
                {item.category?.name ? (
                  <View className="bg-slate-50 px-3 py-1 rounded-full mr-2">
                    <Text className="text-slate-600 text-xs font-medium">{item.category.name}</Text>
                  </View>
                ) : null}
                {item.city ? (
                  <View className="bg-slate-50 px-3 py-1 rounded-full flex-row items-center">
                    <Icon name="location-on" size={12} color="#94A3B8" />
                    <Text className="text-slate-600 text-xs font-medium ml-1">{item.city}</Text>
                  </View>
                ) : null}
              </View>

              {item.status === 'new' && (
                <TouchableOpacity
                  className="bg-[#FF7A30] py-3 rounded-xl items-center flex-row justify-center"
                  onPress={() => handleRespond(item.id)}
                >
                  <Icon name="reply" size={18} color="#FFF" />
                  <Text className="text-white font-bold ml-2">Respond Now</Text>
                </TouchableOpacity>
              )}

              {item.status === 'responded' && item.response && (
                <View className="bg-green-50 p-3 rounded-xl border border-green-100 mt-2">
                  <Text className="text-green-700 font-bold text-xs mb-1">Your Response:</Text>
                  <Text className="text-green-600 text-sm">{item.response.message || item.response}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))
        ) : (
          <View className="items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <View className="w-20 h-20 bg-slate-50 rounded-full items-center justify-center mb-6">
              <Icon name="radar" size={40} color="#CBD5E1" />
            </View>
            <Text className="text-xl font-bold text-slate-800 mb-2">Listening for leads...</Text>
            <Text className="text-slate-500 text-center px-8">When a customer broadcasts a need in your category, it will appear here instantly.</Text>
          </View>
        )}
        <View className="h-20" />
      </ScrollView>

      <Modal visible={respondModalVisible} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-[#FDFCFB]">
          <View className="bg-white pt-14 pb-4 px-4 shadow-sm flex-row items-center justify-between">
            <TouchableOpacity onPress={() => { setRespondModalVisible(false); setResponseMessage(''); }}>
              <Icon name="close" size={24} color="#112D4E" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-[#112D4E]">Respond to Broadcast</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView className="flex-1 px-4 py-6" keyboardShouldPersistTaps="handled">
            <Text className="font-bold text-slate-700 mb-2">Your Message</Text>
            <TextInput
              className="bg-white border border-slate-200 rounded-2xl p-4 h-40 text-slate-900 mb-4"
              placeholder="Describe how you can help..."
              placeholderTextColor="#94A3B8"
              multiline
              textAlignVertical="top"
              value={responseMessage}
              onChangeText={setResponseMessage}
              autoFocus
            />

            <TouchableOpacity
              className={`py-4 rounded-xl items-center ${responseMessage.trim() ? 'bg-[#FF7A30]' : 'bg-slate-200'}`}
              onPress={submitResponse}
              disabled={!responseMessage.trim() || respondMutation.isPending}
            >
              {respondMutation.isPending ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text className="text-white font-bold text-lg">Send Response</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
