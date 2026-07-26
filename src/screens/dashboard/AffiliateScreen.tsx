import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Share, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';

export default function AffiliateScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: statsData, isLoading: loadingStats } = useQuery({
    queryKey: ['affiliateStats'],
    queryFn: () => api.affiliate.getStats(),
  });

  const { data: referralsData, isLoading: loadingReferrals } = useQuery({
    queryKey: ['affiliateReferrals'],
    queryFn: () => api.affiliate.getReferrals(),
  });

  const { data: payoutsData, isLoading: loadingPayouts } = useQuery({
    queryKey: ['affiliatePayouts'],
    queryFn: () => api.affiliate.getPayouts(),
  });

  const joinMutation = useMutation({
    mutationFn: () => api.affiliate.join(),
    onSuccess: () => {
      Alert.alert('Joined', 'You have joined the affiliate program!');
      queryClient.invalidateQueries({ queryKey: ['affiliateStats'] });
    },
    onError: () => Alert.alert('Error', 'Failed to join affiliate program.'),
  });

  const requestPayoutMutation = useMutation({
    mutationFn: () => api.affiliate.requestPayout({}),
    onSuccess: () => {
      Alert.alert('Payout Requested', 'Your payout request has been sent to the admin.');
      queryClient.invalidateQueries({ queryKey: ['affiliateStats'] });
    },
    onError: () => Alert.alert('Error', 'Failed to request payout.'),
  });

  const stats = statsData?.data || { clicks: 0, signups: 0, earnings: 0, pendingPayout: 0, referralCode: 'NM-XXX', isJoined: false };
  const referrals = referralsData?.data || [];
  const payouts = payoutsData?.data || [];

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join the Naampata Directory using my referral code: ${stats.referralCode} and get exclusive discounts! https://naampata.com/register?ref=${stats.referralCode}`,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  return (
    <View className="flex-1 bg-[#FDFCFB]">
      <View className="bg-[#112D4E] pt-14 pb-8 px-4 rounded-b-[32px] shadow-sm">
        <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 bg-white/10 rounded-full items-center justify-center mr-4">
            <Icon name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-white">Affiliate Dashboard</Text>
        </View>

        <View className="bg-gradient-to-r from-orange-500 to-orange-400 p-6 rounded-3xl items-center shadow-lg">
          <Text className="text-white/80 font-medium uppercase tracking-widest text-xs mb-1">Total Earnings</Text>
          <Text className="text-5xl font-black text-white mb-4">${stats.earnings || '0.00'}</Text>

          <View className="flex-row items-center bg-white/20 px-4 py-2 rounded-xl mb-4">
            <Text className="text-white font-bold mr-2">Pending Payout: ${stats.pendingPayout || '0.00'}</Text>
          </View>

          {stats.isJoined ? (
            <TouchableOpacity
              className="w-full bg-white py-3 rounded-xl items-center"
              onPress={() => requestPayoutMutation.mutate()}
              disabled={!stats.pendingPayout || requestPayoutMutation.isPending}
            >
              {requestPayoutMutation.isPending ? (
                <ActivityIndicator size="small" color="#FF7A30" />
              ) : (
                <Text className={`font-black ${stats.pendingPayout > 0 ? 'text-[#FF7A30]' : 'text-slate-300'}`}>
                  Request Payout
                </Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              className="w-full bg-white py-3 rounded-xl items-center"
              onPress={() => joinMutation.mutate()}
              disabled={joinMutation.isPending}
            >
              {joinMutation.isPending ? (
                <ActivityIndicator size="small" color="#FF7A30" />
              ) : (
                <Text className="font-black text-[#FF7A30]">Join Affiliate Program</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
        {stats.isJoined && (
          <>
            <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm mb-6">
              <Text className="font-bold text-[#112D4E] mb-2 text-lg">Your Referral Code</Text>
              <Text className="text-slate-500 mb-4 text-sm">Share this code with other businesses to earn a 20% commission when they upgrade to premium.</Text>

              <View className="bg-slate-50 flex-row items-center justify-between p-3 rounded-xl border border-slate-200">
                <Text className="font-black text-slate-800 text-lg tracking-widest ml-2">{stats.referralCode}</Text>
                <TouchableOpacity
                  className="bg-[#112D4E] w-10 h-10 rounded-lg items-center justify-center shadow-sm"
                  onPress={handleShare}
                >
                  <Icon name="share" size={20} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>

            <Text className="text-xl font-bold text-[#112D4E] mb-4">Performance Metrics</Text>

            {loadingStats ? (
              <ActivityIndicator color="#FF7A30" className="my-10" />
            ) : (
              <View className="flex-row flex-wrap justify-between mb-8">
                <View className="w-[48%] bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
                  <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center mb-3">
                    <Icon name="touch-app" size={20} color="#3B82F6" />
                  </View>
                  <Text className="text-3xl font-black text-slate-900 mb-1">{stats.clicks || 0}</Text>
                  <Text className="text-slate-400 font-medium text-xs uppercase tracking-widest">Link Clicks</Text>
                </View>

                <View className="w-[48%] bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
                  <View className="w-10 h-10 bg-green-50 rounded-full items-center justify-center mb-3">
                    <Icon name="person-add" size={20} color="#22C55E" />
                  </View>
                  <Text className="text-3xl font-black text-slate-900 mb-1">{stats.signups || 0}</Text>
                  <Text className="text-slate-400 font-medium text-xs uppercase tracking-widest">Successful Signups</Text>
                </View>
              </View>
            )}

            <Text className="text-xl font-bold text-[#112D4E] mb-4">Recent Referrals</Text>

            {loadingReferrals ? (
              <ActivityIndicator color="#FF7A30" />
            ) : referrals.length === 0 ? (
              <View className="bg-white p-6 rounded-3xl border border-slate-100 items-center justify-center mb-6">
                <Icon name="group-add" size={48} color="#CBD5E1" className="mb-2" />
                <Text className="text-slate-500 font-medium text-center">No successful referrals yet. Start sharing your link to earn!</Text>
              </View>
            ) : (
              referrals.map((ref: any, index: number) => (
                <View key={index} className="bg-white p-4 rounded-2xl border border-slate-100 mb-3 flex-row justify-between items-center shadow-sm">
                  <View>
                    <Text className="font-bold text-slate-800 text-base">{ref.businessName || ref.referredName || 'Anonymous Business'}</Text>
                    <Text className="text-slate-400 text-xs mt-1">{ref.date || ref.createdAt ? new Date(ref.createdAt || ref.date).toLocaleDateString() : 'Today'}</Text>
                  </View>
                  <View className={`px-3 py-1 rounded-full border ${ref.status === 'paid' ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
                    <Text className={`text-xs font-black uppercase ${ref.status === 'paid' ? 'text-green-600' : 'text-orange-500'}`}>
                      {ref.status || 'Pending'}
                    </Text>
                  </View>
                </View>
              ))
            )}

            <Text className="text-xl font-bold text-[#112D4E] mb-4 mt-2">Payout History</Text>
            {loadingPayouts ? (
              <ActivityIndicator color="#FF7A30" />
            ) : payouts.length === 0 ? (
              <View className="bg-white p-6 rounded-3xl border border-slate-100 items-center justify-center">
                <Icon name="account-balance-wallet" size={48} color="#CBD5E1" className="mb-2" />
                <Text className="text-slate-500 font-medium text-center">No payouts yet.</Text>
              </View>
            ) : (
              payouts.map((payout: any, index: number) => (
                <View key={index} className="bg-white p-4 rounded-2xl border border-slate-100 mb-3 flex-row justify-between items-center shadow-sm">
                  <View>
                    <Text className="font-bold text-slate-800 text-base">${payout.amount || '0.00'}</Text>
                    <Text className="text-slate-400 text-xs mt-1">{payout.date || payout.createdAt ? new Date(payout.createdAt || payout.date).toLocaleDateString() : ''}</Text>
                  </View>
                  <View className={`px-3 py-1 rounded-full border ${payout.status === 'completed' ? 'bg-green-50 border-green-200' : payout.status === 'pending' ? 'bg-yellow-50 border-yellow-200' : 'bg-slate-50 border-slate-200'}`}>
                    <Text className={`text-xs font-black uppercase ${payout.status === 'completed' ? 'text-green-600' : payout.status === 'pending' ? 'text-yellow-600' : 'text-slate-600'}`}>
                      {payout.status || 'Pending'}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </>
        )}

        {!stats.isJoined && !loadingStats && (
          <View className="items-center justify-center py-20">
            <View className="w-24 h-24 bg-orange-50 rounded-full items-center justify-center mb-6">
              <Icon name="share" size={48} color="#FF7A30" />
            </View>
            <Text className="text-xl font-bold text-slate-800 mb-2">Join Our Affiliate Program</Text>
            <Text className="text-slate-500 text-center px-8 mb-6">Earn 20% commission for every business you refer that upgrades to premium.</Text>
            <TouchableOpacity
              className="bg-[#FF7A30] px-8 py-4 rounded-xl"
              onPress={() => joinMutation.mutate()}
              disabled={joinMutation.isPending}
            >
              {joinMutation.isPending ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text className="text-white font-bold">Join Now</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
