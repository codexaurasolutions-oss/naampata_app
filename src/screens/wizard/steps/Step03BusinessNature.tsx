import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useWizardStore } from '../../../stores/wizardStore';

const NATURE_OPTIONS = [
  { id: 'sell_physical', label: 'Sell Physical Products', icon: 'inventory' },
  { id: 'sell_digital', label: 'Sell Digital Products', icon: 'cloud-download' },
  { id: 'services', label: 'Provide Services', icon: 'handyman' },
  { id: 'rent', label: 'Rental Business', icon: 'car-rental' },
  { id: 'bookings', label: 'Bookings & Appointments', icon: 'event' },
  { id: 'events', label: 'Events & Ticketing', icon: 'local-activity' },
];

export default function Step03BusinessNature() {
  const { formData, updateFormData } = useWizardStore();

  return (
    <ScrollView className="flex-1">
      <Text className="text-2xl font-bold text-primary mb-2">Nature of Business</Text>
      <Text className="text-textSecondary mb-6">What is your primary way of doing business?</Text>

      {NATURE_OPTIONS.map((nature) => {
        const isSelected = formData.natureOfBusiness === nature.id;
        
        return (
          <TouchableOpacity 
            key={nature.id}
            onPress={() => updateFormData({ natureOfBusiness: nature.id })}
            className={`flex-row items-center p-4 rounded-xl mb-3 border ${isSelected ? 'border-accent bg-accent/10' : 'border-border bg-white'}`}
          >
            <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${isSelected ? 'bg-accent' : 'bg-background'}`}>
              <Icon name={nature.icon} size={20} color={isSelected ? '#FFF' : '#94A3B8'} />
            </View>
            <Text className={`flex-1 font-semibold text-base ${isSelected ? 'text-primary' : 'text-textPrimary'}`}>
              {nature.label}
            </Text>
            {isSelected && (
              <Icon name="radio-button-checked" size={24} color="#FF7A30" />
            )}
            {!isSelected && (
              <Icon name="radio-button-unchecked" size={24} color="#E2E8F0" />
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
