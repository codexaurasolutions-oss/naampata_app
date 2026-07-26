import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../../services/api';

export default function SubscriptionScreen({ navigation }: any) {
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const [showInvoices, setShowInvoices] = useState(false);
  const [comparePlans, setComparePlans] = useState(false);

  const { data: activeSub, isLoading: loadingActive } = useQuery({
    queryKey: ['activeSubscription'],
    queryFn: api.subscriptions.getActive,
  });

  const { data: plansData, isLoading: loadingPlans } = useQuery({
    queryKey: ['pricingPlans'],
    queryFn: () => api.subscriptions.getPricingPlans(),
  });

  const { data: invoicesData } = useQuery({
    queryKey: ['myInvoices'],
    queryFn: () => api.subscriptions.getMyInvoices(),
  });

  const plans = plansData?.data || plansData || [];
  const invoices = invoicesData?.data || [];

  const checkoutMutation = useMutation({
    mutationFn: (planId: string) => api.subscriptions.createCheckout(planId),
    onMutate: (planId) => setProcessingPlanId(planId),
    onSuccess: (res) => {
      setProcessingPlanId(null);
      if (res?.checkoutUrl) {
        Linking.openURL(res.checkoutUrl);
      } else {
        Alert.alert('Error', 'Could not create payment session. Please try again.');
      }
    },
    onError: (err: any) => {
      setProcessingPlanId(null);
      Alert.alert('Payment Error', err.message || 'Failed to start checkout. Please try again.');
    },
  });

  const handleSubscribe = (planId: string) => {
    checkoutMutation.mutate(planId);
  };

  if (loadingActive || loadingPlans) {
    return (
      <View className="flex-1 items-center justify-center bg-[#FDFCFB]">
        <ActivityIndicator size="large" color="#FF7A30" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#FDFCFB]">
      <View className="bg-[#112D4E] pt-14 pb-8 px-4 shadow-sm">
        <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 bg-white/10 rounded-full items-center justify-center">
            <Icon name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-white ml-4">Upgrade Plan</Text>
        </View>
        <Text className="text-3xl font-black text-white mb-2">Supercharge your business.</Text>
        <Text className="text-slate-300">Get more leads, rank higher, and unlock premium features.</Text>
      </View>

      <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
        {activeSub && (
          <View className="bg-white rounded-3xl p-5 border border-green-100 shadow-sm mb-8 flex-row items-center">
            <View className="w-12 h-12 bg-green-50 rounded-full items-center justify-center">
              <Icon name="check-circle" size={24} color="#22C55E" />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-slate-500 font-medium text-xs uppercase tracking-widest mb-1">Current Plan</Text>
              <Text className="text-lg font-black text-slate-900">{activeSub.plan?.name || 'Free Tier'}</Text>
              {activeSub.expiresAt && (
                <Text className="text-slate-400 text-xs">Renews {new Date(activeSub.expiresAt).toLocaleDateString()}</Text>
              )}
            </View>
          </View>
        )}

        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-bold text-slate-900">Available Plans</Text>
          <TouchableOpacity onPress={() => setComparePlans(!comparePlans)}>
            <Text className="text-[#FF7A30] font-bold text-sm">{comparePlans ? 'Hide Comparison' : 'Compare Plans'}</Text>
          </TouchableOpacity>
        </View>

        {comparePlans && plans.length > 0 && (
          <View className="bg-white rounded-3xl border border-slate-100 p-4 shadow-sm mb-6 overflow-hidden">
            <Text className="font-bold text-[#112D4E] mb-3">Feature Comparison</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View>
                <View className="flex-row border-b border-slate-100 pb-2 mb-2">
                  <Text className="w-32 font-bold text-slate-500 text-xs">Feature</Text>
                  {plans.map((plan: any) => (
                    <Text key={plan.id} className="w-28 font-bold text-[#112D4E] text-xs text-center">{plan.name}</Text>
                  ))}
                </View>
                {['Profile Views', 'Leads', 'Reviews', 'Offers', 'Analytics'].map((feature, idx) => (
                  <View key={idx} className="flex-row border-b border-slate-50 py-2">
                    <Text className="w-32 text-slate-600 text-xs">{feature}</Text>
                    {plans.map((plan: any) => (
                      <View key={plan.id} className="w-28 items-center">
                        <Icon name={plan.features?.[idx] ? 'check-circle' : 'cancel'} size={14} color={plan.features?.[idx] ? '#22C55E' : '#CBD5E1'} />
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        <View className="mb-4">
          {plans.map((plan: any, index: number) => {
            const isCurrentPlan = activeSub?.planId === plan.id;
            const isProcessing = processingPlanId === plan.id;

            return (
              <View key={plan.id || index} className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm mb-6">
                <View className="flex-row justify-between items-start mb-4">
                  <View className="flex-1">
                    <Text className="text-2xl font-black text-[#112D4E] mb-1">{plan.name}</Text>
                    <Text className="text-slate-500">{plan.description}</Text>
                  </View>
                  {plan.isPopular && (
                    <View className="bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                      <Text className="text-orange-500 text-xs font-black uppercase">Popular</Text>
                    </View>
                  )}
                </View>

                <View className="flex-row items-end mb-6">
                  <Text className="text-4xl font-black text-slate-900">${plan.price}</Text>
                  <Text className="text-slate-500 font-medium mb-1 ml-1">/ {plan.billingCycle || 'month'}</Text>
                </View>

                <View className="mb-8">
                  {plan.features?.map((feature: string, fIndex: number) => (
                    <View key={fIndex} className="flex-row items-center mb-3">
                      <Icon name="check-circle" size={20} color="#FF7A30" />
                      <Text className="text-slate-700 ml-3 font-medium">{feature}</Text>
                    </View>
                  ))}
                  {!plan.features && (
                    <View className="flex-row items-center mb-3">
                      <Icon name="check-circle" size={20} color="#FF7A30" />
                      <Text className="text-slate-700 ml-3 font-medium">All basic features included</Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  className={`w-full py-4 rounded-2xl items-center flex-row justify-center ${isCurrentPlan ? 'bg-slate-200' : plan.isPopular ? 'bg-[#FF7A30]' : 'bg-slate-900'}`}
                  onPress={() => !isCurrentPlan && !isProcessing && handleSubscribe(plan.id)}
                  disabled={isCurrentPlan || isProcessing}
                >
                  {isProcessing ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <>
                      <Text className="text-white font-black text-lg mr-2">
                        {isCurrentPlan ? 'Current Plan' : 'Choose Plan'}
                      </Text>
                      {!isCurrentPlan && <Icon name="arrow-forward" size={20} color="#FFF" />}
                    </>
                  )}
                </TouchableOpacity>
              </View>
            );
          })}

          {plans.length === 0 && (
            <View className="bg-white rounded-3xl border border-orange-200 p-6 shadow-lg mb-6 relative overflow-hidden">
              <View className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-[100px] -z-10" />
              <Text className="text-slate-500 text-center font-medium">No plans available at the moment.</Text>
            </View>
          )}
        </View>

        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-bold text-slate-900">Invoice History</Text>
          <TouchableOpacity onPress={() => setShowInvoices(!showInvoices)}>
            <Text className="text-[#FF7A30] font-bold text-sm">{showInvoices ? 'Hide' : 'Show Invoices'}</Text>
          </TouchableOpacity>
        </View>

        {showInvoices && (
          invoices.length > 0 ? (
            invoices.map((invoice: any, index: number) => (
              <View key={index} className="bg-white p-4 rounded-2xl border border-slate-100 mb-3 flex-row justify-between items-center shadow-sm">
                <View>
                  <Text className="font-bold text-slate-800">${invoice.amount || '0.00'}</Text>
                  <Text className="text-slate-400 text-xs mt-1">
                    {invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : ''} - {invoice.planName || 'Subscription'}
                  </Text>
                </View>
                <View className={`px-3 py-1 rounded-full border ${invoice.status === 'paid' ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                  <Text className={`text-xs font-black uppercase ${invoice.status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {invoice.status || 'Pending'}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View className="bg-white p-6 rounded-3xl border border-slate-100 items-center justify-center mb-6">
              <Icon name="receipt" size={48} color="#CBD5E1" />
              <Text className="text-slate-500 font-medium mt-2">No invoices yet.</Text>
            </View>
          )
        )}

        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
