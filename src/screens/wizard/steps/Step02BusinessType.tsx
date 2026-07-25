import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useWizardStore } from '../../../stores/wizardStore';

const BUSINESS_TYPES = [
  { id: 'physical', label: 'Physical Location', icon: 'storefront' },
  { id: 'home', label: 'Home-Based', icon: 'home' },
  { id: 'online', label: 'Online Only', icon: 'language' },
  { id: 'onsite', label: 'On-Site Service', icon: 'build' },
  { id: 'mobile', label: 'Mobile Business', icon: 'local-shipping' },
];

export default function Step02BusinessType() {
  const { formData, updateFormData } = useWizardStore();

  const toggleType = (id: string) => {
    const current = formData.businessTypes || [];
    if (current.includes(id)) {
      updateFormData({ businessTypes: current.filter((t) => t !== id) });
    } else {
      updateFormData({ businessTypes: [...current, id] });
    }
  };

  return (
    <View className="flex-1">
      <Text className="text-2xl font-bold text-primary mb-2">Business Type</Text>
      <Text className="text-textSecondary mb-6">Select all that apply to how you operate.</Text>

      {BUSINESS_TYPES.map((type) => {
        const isSelected = (formData.businessTypes || []).includes(type.id);
        
        return (
          <TouchableOpacity 
            key={type.id}
            onPress={() => toggleType(type.id)}
            className={`flex-row items-center p-4 rounded-xl mb-3 border ${isSelected ? 'border-accent bg-accent/10' : 'border-border bg-white'}`}
          >
            <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${isSelected ? 'bg-accent' : 'bg-background'}`}>
              <Icon name={type.icon} size={20} color={isSelected ? '#FFF' : '#94A3B8'} />
            </View>
            <Text className={`flex-1 font-semibold text-base ${isSelected ? 'text-primary' : 'text-textPrimary'}`}>
              {type.label}
            </Text>
            {isSelected && (
              <Icon name="check-circle" size={24} color="#FF7A30" />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
