import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Share, Alert, TextInput, Modal, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';

export default function AffiliateScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [payoutModalVisible, setPayoutModalVisible] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('EasyPaisa');
  const [payoutDetails, setPayoutDetails] = useState('');

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
    onError: (err: any) => Alert.alert('Error', err.response?.data?.message || 'Failed to join affiliate program.'),
  });

  const requestPayoutMutation = useMutation({
    mutationFn: (data: { amount: number; method: string; details: string }) => api.affiliate.requestPayout(data),
    onSuccess: () => {
      Alert.alert('Payout Requested', 'Your payout request has been sent to the admin.');
      setPayoutModalVisible(false);
      setPayoutAmount('');
      setPayoutDetails('');
      queryClient.invalidateQueries({ queryKey: ['affiliateStats'] });
      queryClient.invalidateQueries({ queryKey: ['affiliatePayouts'] });
    },
    onError: (err: any) => Alert.alert('Error', err.response?.data?.message || 'Failed to request payout.'),
  });

  const stats = statsData || {
    referralCode: 'LOADING...',
    isAffiliate: false,
    totalReferrals: 0,
    convertedReferrals: 0,
    totalEarnings: 0,
    balance: 0,
    totalWithdrawals: 0,
  };
  const referrals = Array.isArray(referralsData) ? referralsData : (referralsData?.data || []);
  const payouts = Array.isArray(payoutsData) ? payoutsData : (payoutsData?.data || []);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join Naampata Directory using my referral code: ${stats.referralCode} and get a free verified listing! https://naampata.com/register?ref=${stats.referralCode}`,
      });
    } catch (error) {
      console.warn('Share failed:', error);
    }
  };

  const handleSubmitPayout = () => {
    const amount = parseFloat(payoutAmount);
    if (isNaN(amount) || amount < 500) {
      Alert.alert('Invalid Amount', 'Minimum withdrawal is PKR 500');
      return;
    }
    if (amount > (stats.balance || 0)) {
      Alert.alert('Insufficient Balance', 'You do not have enough balance for this withdrawal');
      return;
    }
    if (!payoutDetails.trim()) {
      Alert.alert('Missing Details', 'Please provide your account details');
      return;
    }
    requestPayoutMutation.mutate({ amount, method: payoutMethod, details: payoutDetails.trim() });
  };

  const isAffiliate = stats.isAffiliate === true;

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
          <Text className="text-white/80 font-medium uppercase tracking-widest text-xs mb-1">Available Balance</Text>
          <Text className="text-5xl font-black text-white mb-2">PKR {(stats.balance || 0).toLocaleString()}</Text>
          <Text className="text-white/60 text-xs font-medium mb-4">
            Total Earned: PKR {(stats.totalEarnings || 0).toLocaleString()}
          </Text>

          {isAffiliate ? (
            <TouchableOpacity
              className="w-full bg-white py-3 rounded-xl items-center"
              onPress={() => setPayoutModalVisible(true)}
              disabled={!stats.balance || stats.balance <= 0}
            >
              <Text className={`font-black ${(stats.balance || 0) > 0 ? 'text-[#FF7A30]' : 'text-slate-300'}`}>
                Request Payout
              </Text>
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
        {isAffiliate && (
          <>
            <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm mb-6">
              <Text className="font-bold text-[#112D4E] mb-2 text-lg">Your Referral Code</Text>
              <Text className="text-slate-500 mb-4 text-sm">Share this code with other businesses. You get 10 days free plan extension per referral + 10% commission on paid subscriptions.</Text>

              <View className="bg-slate-50 flex-row items-center justify-between p-3 rounded-xl border border-slate-200">
                <Text className="font-black text-slate-800 text-lg tracking-widest ml-2">{stats.referralCode}</Text>
                <View className="flex-row">
                  <TouchableOpacity
                    className="bg-[#112D4E] w-10 h-10 rounded-lg items-center justify-center shadow-sm mr-2"
                    onPress={handleShare}
                  >
                    <Icon name="share" size={20} color="#FFF" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <Text className="text-xl font-bold text-[#112D4E] mb-4">Performance</Text>

            {loadingStats ? (
              <ActivityIndicator color="#FF7A30" className="my-10" />
            ) : (
              <View className="flex-row flex-wrap justify-between mb-8">
                <View className="w-[48%] bg-white rounded-3xl p-5 border border-slate-100 shadow-sm mb-3">
                  <View className="w-10 h-10 bg-orange-50 rounded-full items-center justify-center mb-3">
                    <Icon name="timer" size={20} color="#FF7A30" />
                  </View>
                  <Text className="text-3xl font-black text-slate-900 mb-1">{(stats.convertedReferrals || 0) * 10} Days</Text>
                  <Text className="text-slate-400 font-medium text-xs uppercase tracking-widest">Plan Extensions</Text>
                </View>

                <View className="w-[48%] bg-white rounded-3xl p-5 border border-slate-100 shadow-sm mb-3">
                  <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center mb-3">
                    <Icon name="group" size={20} color="#3B82F6" />
                  </View>
                  <Text className="text-3xl font-black text-slate-900 mb-1">{stats.totalReferrals || 0}</Text>
                  <Text className="text-slate-400 font-medium text-xs uppercase tracking-widest">Total Referrals</Text>
                </View>

                <View className="w-[48%] bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
                  <View className="w-10 h-10 bg-green-50 rounded-full items-center justify-center mb-3">
                    <Icon name="check-circle" size={20} color="#22C55E" />
                  </View>
                  <Text className="text-3xl font-black text-slate-900 mb-1">{stats.convertedReferrals || 0}</Text>
                  <Text className="text-slate-400 font-medium text-xs uppercase tracking-widest">Conversions</Text>
                </View>

                <View className="w-[48%] bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
                  <View className="w-10 h-10 bg-purple-50 rounded-full items-center justify-center mb-3">
                    <Icon name="account-balance-wallet" size={20} color="#A855F7" />
                  </View>
                  <Text className="text-3xl font-black text-slate-900 mb-1">PKR {(stats.totalWithdrawals || 0).toLocaleString()}</Text>
                  <Text className="text-slate-400 font-medium text-xs uppercase tracking-widest">Withdrawn</Text>
                </View>
              </View>
            )}

            <Text className="text-xl font-bold text-[#112D4E] mb-4">Recent Referrals</Text>

            {loadingReferrals ? (
              <ActivityIndicator color="#FF7A30" />
            ) : referrals.length === 0 ? (
              <View className="bg-white p-6 rounded-3xl border border-slate-100 items-center justify-center mb-6">
                <Icon name="group-add" size={48} color="#CBD5E1" />
                <Text className="text-slate-500 font-medium text-center mt-3">No referrals yet. Start sharing your code!</Text>
              </View>
            ) : (
              referrals.slice(0, 20).map((ref: any, index: number) => (
                <View key={ref.id || index} className="bg-white p-4 rounded-2xl border border-slate-100 mb-3 flex-row justify-between items-center shadow-sm">
                  <View className="flex-1">
                    <Text className="font-bold text-slate-800 text-base">{ref.referredUser?.fullName || 'New Business'}</Text>
                    <Text className="text-slate-400 text-xs mt-1">
                      {ref.createdAt ? new Date(ref.createdAt).toLocaleDateString() : ''}
                    </Text>
                  </View>
                  <View className={`px-3 py-1 rounded-full ${ref.status === 'converted' ? 'bg-green-50' : 'bg-orange-50'}`}>
                    <Text className={`text-xs font-black uppercase ${ref.status === 'converted' ? 'text-green-600' : 'text-orange-500'}`}>
                      {ref.status === 'converted' ? '+10 Days' : 'Pending'}
                    </Text>
                  </View>
                </View>
              ))
            )}

            <Text className="text-xl font-bold text-[#112D4E] mb-4 mt-4">Payout History</Text>
            {loadingPayouts ? (
              <ActivityIndicator color="#FF7A30" />
            ) : payouts.length === 0 ? (
              <View className="bg-white p-6 rounded-3xl border border-slate-100 items-center justify-center">
                <Icon name="account-balance-wallet" size={48} color="#CBD5E1" />
                <Text className="text-slate-500 font-medium text-center mt-3">No payouts yet.</Text>
              </View>
            ) : (
              payouts.map((payout: any, index: number) => (
                <View key={payout.id || index} className="bg-white p-4 rounded-2xl border border-slate-100 mb-3 flex-row justify-between items-center shadow-sm">
                  <View>
                    <Text className="font-bold text-slate-800 text-base">PKR {(payout.amount || 0).toLocaleString()}</Text>
                    <Text className="text-slate-400 text-xs mt-1">{payout.method} - {payout.createdAt ? new Date(payout.createdAt).toLocaleDateString() : ''}</Text>
                  </View>
                  <View className={`px-3 py-1 rounded-full ${payout.status === 'paid' || payout.status === 'approved' ? 'bg-green-50' : payout.status === 'pending' ? 'bg-yellow-50' : 'bg-slate-50'}`}>
                    <Text className={`text-xs font-black uppercase ${payout.status === 'paid' || payout.status === 'approved' ? 'text-green-600' : payout.status === 'pending' ? 'text-yellow-600' : 'text-slate-600'}`}>
                      {payout.status || 'Pending'}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </>
        )}

        {!isAffiliate && !loadingStats && (
          <View className="items-center justify-center py-20">
            <View className="w-24 h-24 bg-orange-50 rounded-full items-center justify-center mb-6">
              <Icon name="share" size={48} color="#FF7A30" />
            </View>
            <Text className="text-xl font-bold text-slate-800 mb-2">Join Our Affiliate Program</Text>
            <Text className="text-slate-500 text-center px-8 mb-6">Earn 10 days free plan extension for every business you refer that subscribes.</Text>
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

      {/* Payout Modal */}
      <Modal visible={payoutModalVisible} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-[#FDFCFB]">
          <View className="bg-white pt-14 pb-4 px-4 shadow-sm flex-row items-center justify-between">
            <TouchableOpacity onPress={() => { setPayoutModalVisible(false); setPayoutAmount(''); setPayoutDetails(''); }}>
              <Icon name="close" size={24} color="#112D4E" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-[#112D4E]">Request Payout</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView className="flex-1 px-4 py-6" keyboardShouldPersistTaps="handled">
            <Text className="text-slate-500 font-medium mb-6">Available balance: <Text className="font-black text-slate-900">PKR {(stats.balance || 0).toLocaleString()}</Text></Text>

            <Text className="text-sm font-bold text-slate-700 mb-2">Amount (Min PKR 500)</Text>
            <TextInput
              className="bg-white border border-slate-200 rounded-2xl p-4 text-slate-900 text-base mb-4"
              placeholder="e.g. 1000"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={payoutAmount}
              onChangeText={setPayoutAmount}
            />

            <Text className="text-sm font-bold text-slate-700 mb-2">Payment Method</Text>
            <View className="flex-row flex-wrap mb-4">
              {['EasyPaisa', 'JazzCash', 'Bank Transfer'].map(method => (
                <TouchableOpacity
                  key={method}
                  className={`px-4 py-3 rounded-xl border mr-2 mb-2 ${payoutMethod === method ? 'bg-[#FF7A30] border-[#FF7A30]' : 'bg-white border-slate-200'}`}
                  onPress={() => setPayoutMethod(method)}
                >
                  <Text className={`font-bold text-sm ${payoutMethod === method ? 'text-white' : 'text-slate-600'}`}>{method}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text className="text-sm font-bold text-slate-700 mb-2">Account Details</Text>
            <TextInput
              className="bg-white border border-slate-200 rounded-2xl p-4 text-slate-900 text-base mb-6 h-24"
              placeholder="Account number, account name..."
              placeholderTextColor="#94A3B8"
              multiline
              textAlignVertical="top"
              value={payoutDetails}
              onChangeText={setPayoutDetails}
            />

            <TouchableOpacity
              className={`py-4 rounded-xl items-center ${(payoutAmount && parseFloat(payoutAmount) >= 500 && payoutDetails.trim()) ? 'bg-[#112D4E]' : 'bg-slate-200'}`}
              onPress={handleSubmitPayout}
              disabled={!payoutAmount || parseFloat(payoutAmount) < 500 || !payoutDetails.trim() || requestPayoutMutation.isPending}
            >
              {requestPayoutMutation.isPending ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text className={`font-bold text-lg ${(payoutAmount && parseFloat(payoutAmount) >= 500 && payoutDetails.trim()) ? 'text-white' : 'text-slate-400'}`}>
                  Submit Request
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
