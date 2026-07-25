import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';

export default function MessagesScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');

  const isVendor = user?.role === 'vendor';

  const { data, isLoading } = useQuery({
    queryKey: ['chatConversations'],
    queryFn: () => isVendor ? api.chat.getVendorConversations() : api.chat.getUserConversations(),
  });

  const conversations = data?.data || [];

  const filteredConvos = conversations.filter((c: any) => {
    const otherParty = isVendor ? c.user : c.vendor;
    return otherParty?.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <View className="flex-1 bg-[#FDFCFB]">
      {/* Header */}
      <View className="bg-white pt-14 pb-4 px-4 shadow-sm z-10 border-b border-slate-100">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" size={24} color="#112D4E" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-[#112D4E] ml-4">Messages</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View className="bg-slate-50 flex-row items-center rounded-xl px-4 py-1 border border-slate-200">
          <Icon name="search" size={20} color="#94A3B8" />
          <TextInput 
            placeholder="Search conversations..." 
            className="flex-1 ml-3 h-10 text-slate-900"
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <ActivityIndicator color="#FF7A30" className="mt-10" />
        ) : filteredConvos.length === 0 ? (
          <View className="items-center justify-center py-20 mt-10">
            <View className="w-24 h-24 bg-slate-50 rounded-full items-center justify-center mb-6 border border-slate-100">
              <Icon name="chat-bubble-outline" size={48} color="#CBD5E1" />
            </View>
            <Text className="text-xl font-bold text-slate-900 mb-2">No messages yet</Text>
            <Text className="text-slate-500 text-center">
              {isVendor 
                ? "When customers contact you, their messages will appear here." 
                : "When you contact businesses, your chats will appear here."}
            </Text>
          </View>
        ) : (
          filteredConvos.map((convo: any, index: number) => {
            const otherParty = isVendor ? convo.user : convo.vendor;
            const hasUnread = convo.unreadCount > 0;

            return (
              <TouchableOpacity 
                key={convo.id || index}
                className="bg-white rounded-3xl p-4 mb-3 border border-slate-100 shadow-sm flex-row items-center"
                onPress={() => navigation.navigate('Chat', { conversationId: convo.id, title: otherParty?.name })}
              >
                <View className="relative">
                  <Image 
                    source={{ uri: otherParty?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop' }}
                    className="w-14 h-14 rounded-full bg-slate-200"
                  />
                  {otherParty?.isOnline && (
                    <View className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </View>

                <View className="ml-4 flex-1">
                  <View className="flex-row justify-between items-start mb-1">
                    <Text className={`text-base flex-1 ${hasUnread ? 'font-black text-[#112D4E]' : 'font-bold text-slate-700'}`} numberOfLines={1}>
                      {otherParty?.name || 'User'}
                    </Text>
                    <Text className={`text-xs ml-2 ${hasUnread ? 'text-[#FF7A30] font-bold' : 'text-slate-400'}`}>
                      {convo.lastMessageTime || 'Just now'}
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className={`text-sm flex-1 ${hasUnread ? 'font-bold text-slate-800' : 'text-slate-500'}`} numberOfLines={1}>
                      {convo.lastMessage || 'Sent an attachment'}
                    </Text>
                    {hasUnread && (
                      <View className="bg-[#FF7A30] w-5 h-5 rounded-full items-center justify-center ml-2">
                        <Text className="text-white text-[10px] font-black">{convo.unreadCount}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            )
          })
        )}
        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
