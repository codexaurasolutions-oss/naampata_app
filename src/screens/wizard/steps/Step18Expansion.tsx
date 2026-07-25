import React from 'react';
import { View, Text, Switch, ScrollView } from 'react-native';
import { useWizardStore } from '../../../stores/wizardStore';

export default function Step18Expansion() {
  const { formData, updateFormData } = useWizardStore();

  const toggleExpansion = (key: 'franchiseAvailable' | 'dealerInquiries' | 'importerExporter') => {
    updateFormData({
      expansion: {
        ...formData.expansion,
        [key]: !formData.expansion[key]
      }
    });
  };

  return (
    <ScrollView className="flex-1">
      <Text className="text-2xl font-bold text-primary mb-2">Expansion & Trade</Text>
      <Text className="text-textSecondary mb-6">Are you looking to expand your business horizons?</Text>

      <View className="bg-white p-4 rounded-xl border border-border mb-3 shadow-sm flex-row justify-between items-center">
        <View className="flex-1 pr-4">
          <Text className="text-textPrimary font-bold mb-1">Franchise Available</Text>
          <Text className="text-textSecondary text-xs">Allow others to open a franchise of your business.</Text>
        </View>
        <Switch 
          value={formData.expansion?.franchiseAvailable}
          onValueChange={() => toggleExpansion('franchiseAvailable')}
          trackColor={{ false: '#E2E8F0', true: '#FF7A30' }}
        />
      </View>

      <View className="bg-white p-4 rounded-xl border border-border mb-3 shadow-sm flex-row justify-between items-center">
        <View className="flex-1 pr-4">
          <Text className="text-textPrimary font-bold mb-1">Dealer Inquiries Welcome</Text>
          <Text className="text-textSecondary text-xs">You are open to new dealerships or distributors.</Text>
        </View>
        <Switch 
          value={formData.expansion?.dealerInquiries}
          onValueChange={() => toggleExpansion('dealerInquiries')}
          trackColor={{ false: '#E2E8F0', true: '#FF7A30' }}
        />
      </View>

      <View className="bg-white p-4 rounded-xl border border-border mb-3 shadow-sm flex-row justify-between items-center">
        <View className="flex-1 pr-4">
          <Text className="text-textPrimary font-bold mb-1">Importer / Exporter</Text>
          <Text className="text-textSecondary text-xs">Your business engages in international trade.</Text>
        </View>
        <Switch 
          value={formData.expansion?.importerExporter}
          onValueChange={() => toggleExpansion('importerExporter')}
          trackColor={{ false: '#E2E8F0', true: '#FF7A30' }}
        />
      </View>
    </ScrollView>
  );
}
