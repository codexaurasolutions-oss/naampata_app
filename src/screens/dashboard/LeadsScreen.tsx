import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';

export default function LeadsScreen({ navigation }: any) {
  const [filter, setFilter] = useState('all'); // all, new, contacted, converted, lost

  const { data, isLoading } = useQuery({
    queryKey: ['vendorLeads', filter],
    queryFn: () => api.leads.getForVendor({ status: filter === 'all' ? undefined : filter }),
  });

  const leads = data?.data || [];

  return (
    <View className="flex-1 bg-[#FDFCFB]">
      {/* Header */}
      <View className="bg-white pt-14 pb-4 px-4 flex-row items-center justify-between shadow-sm z-10">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#112D4E" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-[#112D4E] ml-4">Leads Inbox</Text>
        </View>
        <TouchableOpacity>
          <Icon name="filter-list" size={24} color="#64748B" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View className="bg-white px-4 py-3 border-b border-slate-100">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['all', 'new', 'contacted', 'converted', 'lost'].map((tab) => (
            <TouchableOpacity 
              key={tab}
              onPress={() => setFilter(tab)}
              className={`px-4 py-2 rounded-full mr-2 ${filter === tab ? 'bg-[#FF7A30]' : 'bg-slate-100'}`}
            >
              <Text className={`font-bold capitalize ${filter === tab ? 'text-white' : 'text-slate-500'}`}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Leads List */}
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <ActivityIndicator color="#FF7A30" className="mt-10" />
        ) : leads.length === 0 ? (
          <View className="items-center justify-center py-20 mt-10">
            <View className="w-24 h-24 bg-slate-50 rounded-full items-center justify-center mb-6 border border-slate-100">
              <Icon name="mail-outline" size={48} color="#CBD5E1" />
            </View>
            <Text className="text-xl font-bold text-slate-900 mb-2">No leads found</Text>
            <Text className="text-slate-500 text-center px-6">
              You don't have any {filter !== 'all' ? filter : ''} leads right now. Enhance your profile to get more visibility.
            </Text>
          </View>
        ) : (
          leads.map((lead: any, index: number) => (
            <TouchableOpacity 
              key={lead.id || index}
              className="bg-white rounded-3xl p-5 mb-4 border border-slate-100 shadow-sm"
            >
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center">
                    <Icon name="person" size={20} color="#3B82F6" />
                  </View>
                  <View className="ml-3">
                    <Text className="font-bold text-[#112D4E] text-base">{lead.name || 'Anonymous User'}</Text>
                    <Text className="text-slate-400 text-xs">{lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'Unknown date'}</Text>
                  </View>
                </View>
                <View className={`px-3 py-1 rounded-full ${lead.status === 'new' ? 'bg-orange-50 border border-orange-100' : 'bg-slate-50 border border-slate-200'}`}>
                  <Text className={`text-xs font-black uppercase ${lead.status === 'new' ? 'text-orange-500' : 'text-slate-500'}`}>
                    {lead.status || 'New'}
                  </Text>
                </View>
              </View>

              <Text className="text-slate-600 font-medium mb-4 leading-relaxed" numberOfLines={2}>
                "{lead.message || 'I am interested in your services and would like a quote.'}"
              </Text>

              <View className="flex-row justify-between items-center pt-3 border-t border-slate-50">
                <View className="flex-row gap-3">
                  <TouchableOpacity className="w-10 h-10 bg-green-50 rounded-full items-center justify-center border border-green-100">
                    <Icon name="phone" size={18} color="#22C55E" />
                  </TouchableOpacity>
                  <TouchableOpacity className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center border border-blue-100">
                    <Icon name="mail" size={18} color="#3B82F6" />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity className="bg-slate-900 px-5 py-2.5 rounded-xl">
                  <Text className="text-white font-bold text-xs uppercase tracking-widest">Reply</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
