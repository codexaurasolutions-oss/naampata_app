import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../../services/api';

export default function SubscriptionScreen({ navigation }: any) {
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);

  const { data: activeSub, isLoading: loadingActive } = useQuery({
    queryKey: ['activeSubscription'],
    queryFn: api.subscriptions.getActive,
  });

  const { data: plansData, isLoading: loadingPlans } = useQuery({
    queryKey: ['pricingPlans'],
    queryFn: () => api.subscriptions.getPricingPlans(),
  });

  const plans = plansData?.data || plansData || [];

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
            </View>
          </View>
        )}

        <View className="mb-4">
          <Text className="text-xl font-bold text-slate-900 mb-4">Available Plans</Text>
          
          {plans.map((plan: any, index: number) => {
            const isCurrentPlan = activeSub?.planId === plan.id;
            const isProcessing = processingPlanId === plan.id;

            return (
              <View key={plan.id || index} className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm mb-6">
                <View className="flex-row justify-between items-start mb-4">
                  <View>
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
                  <Text className="text-slate-500 font-medium mb-1 ml-1">/ {plan.billingCycle}</Text>
                </View>

                <View className="mb-8">
                  {plan.features?.map((feature: string, fIndex: number) => (
                    <View key={fIndex} className="flex-row items-center mb-3">
                      <Icon name="check-circle" size={20} color="#FF7A30" />
                      <Text className="text-slate-700 ml-3 font-medium">{feature}</Text>
                    </View>
                  ))}
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
        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
