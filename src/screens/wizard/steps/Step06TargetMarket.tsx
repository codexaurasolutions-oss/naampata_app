import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useWizardStore } from '../../../stores/wizardStore';
import Icon from 'react-native-vector-icons/MaterialIcons';

const MARKET_OPTIONS = [
  { id: 'B2C', label: 'Business to Consumer (B2C)', icon: 'person' },
  { id: 'B2B', label: 'Business to Business (B2B)', icon: 'business' },
  { id: 'B2G', label: 'Business to Government (B2G)', icon: 'account-balance' },
  { id: 'D2C', label: 'Direct to Consumer (D2C)', icon: 'storefront' },
  { id: 'Wholesale', label: 'Wholesale', icon: 'local-shipping' },
  { id: 'International', label: 'International / Export', icon: 'public' },
];

export default function Step06TargetMarket() {
  const { formData, updateFormData } = useWizardStore();

  const toggleMarket = (id: string) => {
    const current = formData.targetMarket || [];
    if (current.includes(id)) {
      updateFormData({ targetMarket: current.filter((t) => t !== id) });
    } else {
      updateFormData({ targetMarket: [...current, id] });
    }
  };

  return (
    <ScrollView className="flex-1">
      <Text className="text-2xl font-bold text-primary mb-2">Target Market</Text>
      <Text className="text-textSecondary mb-6">Who are your primary customers?</Text>

      {MARKET_OPTIONS.map((market) => {
        const isSelected = (formData.targetMarket || []).includes(market.id);
        return (
          <TouchableOpacity 
            key={market.id}
            onPress={() => toggleMarket(market.id)}
            className={`flex-row items-center p-4 rounded-xl mb-3 border ${isSelected ? 'border-accent bg-accent/10' : 'border-border bg-white'}`}
          >
            <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${isSelected ? 'bg-accent' : 'bg-background'}`}>
              <Icon name={market.icon} size={20} color={isSelected ? '#FFF' : '#94A3B8'} />
            </View>
            <Text className={`flex-1 font-semibold text-base ${isSelected ? 'text-primary' : 'text-textPrimary'}`}>
              {market.label}
            </Text>
            {isSelected && (
              <Icon name="check-circle" size={24} color="#FF7A30" />
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
