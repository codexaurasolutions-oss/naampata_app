import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';

export default function NotificationsScreen({ navigation }: any) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: api.notifications.getAll,
  });

  const markAllRead = useMutation({
    mutationFn: api.notifications.markAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const notifications = data?.data || [];

  return (
    <View className="flex-1 bg-[#FDFCFB]">
      <View className="bg-white pt-14 pb-4 px-4 flex-row items-center justify-between shadow-sm z-10">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#112D4E" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-[#112D4E] ml-4">Notifications</Text>
        </View>
        <TouchableOpacity onPress={() => markAllRead.mutate()}>
          <Text className="text-[#FF7A30] font-bold">Mark all read</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <ActivityIndicator color="#FF7A30" className="mt-10" />
        ) : notifications.length === 0 ? (
          <View className="items-center justify-center py-20 mt-10">
            <View className="w-24 h-24 bg-slate-50 rounded-full items-center justify-center mb-6">
              <Icon name="notifications-none" size={48} color="#CBD5E1" />
            </View>
            <Text className="text-xl font-bold text-slate-900 mb-2">All caught up!</Text>
            <Text className="text-slate-500 text-center">You don't have any new notifications right now.</Text>
          </View>
        ) : (
          notifications.map((note: any, index: number) => (
            <TouchableOpacity 
              key={note.id || index} 
              className={`bg-white rounded-3xl p-5 mb-4 border ${note.isRead ? 'border-slate-100 opacity-70' : 'border-[#FF7A30]/30 shadow-sm'} flex-row`}
            >
              <View className={`w-12 h-12 rounded-full items-center justify-center ${note.isRead ? 'bg-slate-50' : 'bg-orange-50'}`}>
                <Icon name="notifications" size={24} color={note.isRead ? "#94A3B8" : "#FF7A30"} />
              </View>
              <View className="ml-4 flex-1">
                <View className="flex-row justify-between items-start mb-1">
                  <Text className="text-sm font-bold text-slate-900 flex-1">{note.title}</Text>
                  <Text className="text-xs text-slate-400 ml-2">2h ago</Text>
                </View>
                <Text className="text-slate-600 text-sm leading-relaxed">{note.message}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}
