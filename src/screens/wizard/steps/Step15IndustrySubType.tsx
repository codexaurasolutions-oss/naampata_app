import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useWizardStore } from '../../../stores/wizardStore';

const INDUSTRY_SUBTYPES = [
  'Manufacturing',
  'Agriculture',
  'Technology',
  'Retail',
  'Healthcare',
  'Finance',
  'Education',
  'Hospitality'
];

export default function Step15IndustrySubType() {
  const { formData, updateFormData } = useWizardStore();

  const toggleSubType = (subType: string) => {
    const current = formData.industrySubType || [];
    if (current.includes(subType)) {
      updateFormData({ industrySubType: current.filter((s) => s !== subType) });
    } else {
      updateFormData({ industrySubType: [...current, subType] });
    }
  };

  return (
    <ScrollView className="flex-1">
      <Text className="text-2xl font-bold text-primary mb-2">Industry Sub-Type</Text>
      <Text className="text-textSecondary mb-6">Select specific industry classifications.</Text>

      <View className="flex-row flex-wrap">
        {INDUSTRY_SUBTYPES.map((subType) => {
          const isSelected = (formData.industrySubType || []).includes(subType);
          return (
            <TouchableOpacity 
              key={subType}
              onPress={() => toggleSubType(subType)}
              className={`py-2 px-4 rounded-full border mr-2 mb-3 ${isSelected ? 'border-accent bg-accent' : 'border-border bg-white'}`}
            >
              <Text className={`font-semibold ${isSelected ? 'text-white' : 'text-textPrimary'}`}>
                {subType}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}
