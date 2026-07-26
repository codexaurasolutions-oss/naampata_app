import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';

const PERIODS = [
  { key: '7d', label: '7 Days' },
  { key: '30d', label: '30 Days' },
  { key: '90d', label: '90 Days' },
  { key: '1y', label: '1 Year' },
];

export default function AnalyticsScreen({ navigation }: any) {
  const [period, setPeriod] = useState('30d');
  const [refreshing, setRefreshing] = useState(false);
  const [showPeriodPicker, setShowPeriodPicker] = useState(false);

  const { data: statsData, isLoading, refetch } = useQuery({
    queryKey: ['vendorDashboardStats'],
    queryFn: () => api.vendors.getDashboardStats(),
  });

  const { data: demandData } = useQuery({
    queryKey: ['vendorDemand'],
    queryFn: () => api.demand.getNearby(0, 0),
  });

  const { data: leadStatsData } = useQuery({
    queryKey: ['vendorLeadStats'],
    queryFn: () => api.leads.getStats(),
  });

  const stats = statsData?.data || {};
  const demand = demandData?.data || [];
  const leadStats = leadStatsData?.data || {};

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const metricCards = [
    { label: 'Profile Views', value: stats.views || stats.profileViews || 0, icon: 'visibility', color: '#3B82F6', bgColor: '#EFF6FF', trend: stats.viewsTrend || null },
    { label: 'Total Leads', value: stats.leads || leadStats.total || 0, icon: 'mail', color: '#FF7A30', bgColor: '#FFF7ED', trend: stats.leadsTrend || null },
    { label: 'Call Clicks', value: stats.callClicks || 0, icon: 'phone', color: '#10B981', bgColor: '#ECFDF5', trend: null },
    { label: 'Avg Rating', value: stats.rating || stats.avgRating || '0.0', icon: 'star', color: '#F59E0B', bgColor: '#FFFBEB', trend: null },
    { label: 'New Reviews', value: stats.reviews || stats.reviewCount || 0, icon: 'reviews', color: '#8B5CF6', bgColor: '#F5F3FF', trend: null },
    { label: 'Listings', value: stats.listingsCount || stats.totalListings || 0, icon: 'storefront', color: '#06B6D4', bgColor: '#ECFEFF', trend: null },
  ];

  const performanceBreakdown = [
    { label: 'Search Appearances', value: stats.searchAppearances || 0, icon: 'search', color: '#3B82F6' },
    { label: 'Website Clicks', value: stats.websiteClicks || 0, icon: 'language', color: '#FF7A30' },
    { label: 'Direction Clicks', value: stats.directionClicks || 0, icon: 'directions', color: '#10B981' },
    { label: 'Photo Views', value: stats.photoViews || 0, icon: 'photo', color: '#8B5CF6' },
  ];

  return (
    <View className="flex-1 bg-[#FDFCFB]">
      <View className="bg-white pt-14 pb-4 px-4 shadow-sm z-10 border-b border-slate-100 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Icon name="arrow-back" size={24} color="#112D4E" />
        </TouchableOpacity>
        <Text className="text-xl font-black text-[#112D4E]">Analytics</Text>
      </View>

      <ScrollView
        className="flex-1 px-4 pt-6"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF7A30" />}
      >
        <View className="flex-row justify-between items-end mb-8">
          <View>
            <Text className="text-3xl font-black text-[#0F2747]">Performance</Text>
            <Text className="text-slate-500 font-medium mt-1">
              {PERIODS.find(p => p.key === period)?.label} overview.
            </Text>
          </View>
          <TouchableOpacity
            className="bg-white px-3 py-2 border border-slate-200 rounded-lg flex-row items-center"
            onPress={() => setShowPeriodPicker(!showPeriodPicker)}
          >
            <Text className="text-slate-700 font-bold mr-1">{PERIODS.find(p => p.key === period)?.label}</Text>
            <Icon name="expand-more" size={16} color="#64748B" />
          </TouchableOpacity>
        </View>

        {showPeriodPicker && (
          <View className="flex-row mb-6">
            {PERIODS.map((p) => (
              <TouchableOpacity
                key={p.key}
                className={`flex-1 py-2 rounded-lg items-center mr-2 border ${period === p.key ? 'bg-[#112D4E] border-[#112D4E]' : 'bg-white border-slate-200'}`}
                onPress={() => { setPeriod(p.key); setShowPeriodPicker(false); }}
              >
                <Text className={`font-bold text-xs ${period === p.key ? 'text-white' : 'text-slate-600'}`}>{p.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {isLoading ? (
          <ActivityIndicator color="#FF7A30" className="my-10" />
        ) : (
          <>
            <View className="flex-row flex-wrap justify-between mb-8">
              {metricCards.map((card, idx) => (
                <View key={idx} className="w-[48%] bg-white p-5 rounded-3xl border border-slate-100 shadow-sm mb-4">
                  <View className="w-10 h-10 rounded-xl items-center justify-center mb-3" style={{ backgroundColor: card.bgColor }}>
                    <Icon name={card.icon} size={20} color={card.color} />
                  </View>
                  <Text className="text-2xl font-black text-slate-900">{card.value}</Text>
                  <Text className="text-sm font-medium text-slate-500 mt-1">{card.label}</Text>
                  {card.trend !== null && card.trend !== undefined && (
                    <View className="flex-row items-center mt-1">
                      <Icon name={Number(card.trend) >= 0 ? 'trending-up' : 'trending-down'} size={14} color={Number(card.trend) >= 0 ? '#22C55E' : '#EF4444'} />
                      <Text className={`text-xs font-bold ml-1 ${Number(card.trend) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {Number(card.trend) >= 0 ? '+' : ''}{card.trend}%
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>

            <Text className="text-xl font-bold text-[#112D4E] mb-4">Performance Breakdown</Text>
            <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm mb-8">
              {performanceBreakdown.map((item, idx) => (
                <View key={idx} className="flex-row items-center mb-4 pb-4 border-b border-slate-50 last:border-b-0 last:mb-0 last:pb-0">
                  <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: `${item.color}15` }}>
                    <Icon name={item.icon} size={20} color={item.color} />
                  </View>
                  <Text className="flex-1 text-slate-700 font-medium">{item.label}</Text>
                  <Text className="font-black text-slate-900 text-lg">{item.value}</Text>
                </View>
              ))}
            </View>

            {leadStats && (leadStats.new || leadStats.contacteds || leadStats.converted) ? (
              <View className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mb-8">
                <Text className="font-bold text-[#112D4E] text-lg mb-4">Lead Pipeline</Text>
                {[
                  { label: 'New Leads', value: leadStats.new || 0, color: '#3B82F6' },
                  { label: 'Contacted', value: leadStats.contacted || 0, color: '#F59E0B' },
                  { label: 'Converted', value: leadStats.converted || 0, color: '#10B981' },
                  { label: 'Lost', value: leadStats.lost || 0, color: '#EF4444' },
                ].map((item, idx) => (
                  <View key={idx} className="flex-row items-center mb-3">
                    <View className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: item.color }} />
                    <Text className="flex-1 text-slate-600 font-medium">{item.label}</Text>
                    <Text className="font-black text-slate-900">{item.value}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            {demand.length > 0 && (
              <View className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mb-8">
                <Text className="font-bold text-[#112D4E] text-lg mb-4">Trending in Your Area</Text>
                {demand.slice(0, 5).map((item: any, idx: number) => (
                  <View key={idx} className="flex-row items-center mb-3 pb-3 border-b border-slate-50">
                    <Icon name="trending-up" size={18} color="#FF7A30" />
                    <Text className="flex-1 text-slate-700 font-medium ml-3">{item.keyword || item.query}</Text>
                    <Text className="text-slate-400 text-xs font-bold">{item.count || item.searchCount || 0} searches</Text>
                  </View>
                ))}
              </View>
            )}

            <View className="bg-[#112D4E] rounded-3xl p-6 shadow-md mb-8">
              <Text className="text-white font-bold text-lg mb-2">Want deeper insights?</Text>
              <Text className="text-blue-100 mb-4 leading-relaxed">Upgrade to a premium plan to see exactly who is viewing your profile and where they are coming from.</Text>
              <TouchableOpacity
                className="bg-[#FF7A30] py-3 rounded-xl items-center"
                onPress={() => navigation.navigate('Subscription')}
              >
                <Text className="text-white font-bold">Upgrade Plan</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
