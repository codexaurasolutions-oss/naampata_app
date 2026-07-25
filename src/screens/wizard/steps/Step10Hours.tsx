import React from 'react';
import { View, Text, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { useWizardStore } from '../../../stores/wizardStore';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function Step10Hours() {
  const { formData, updateFormData } = useWizardStore();

  const toggleDay = (day: string) => {
    updateFormData({
      businessHours: {
        ...formData.businessHours,
        [day]: {
          ...formData.businessHours[day],
          isOpen: !formData.businessHours[day].isOpen
        }
      }
    });
  };

  return (
    <ScrollView className="flex-1">
      <Text className="text-2xl font-bold text-primary mb-2">Business Hours</Text>
      <Text className="text-textSecondary mb-6">When are you open for business?</Text>

      {DAYS.map((day) => {
        const hours = formData.businessHours?.[day];
        const isOpen = hours?.isOpen;

        return (
          <View key={day} className="bg-white p-4 rounded-xl mb-3 shadow-sm border border-border">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="font-semibold text-textPrimary text-base">{day}</Text>
              <Switch 
                value={isOpen} 
                onValueChange={() => toggleDay(day)}
                trackColor={{ false: '#E2E8F0', true: '#FF7A30' }}
              />
            </View>
            
            {isOpen && (
              <View className="flex-row items-center justify-between">
                <TouchableOpacity className="flex-1 border border-border rounded-lg py-2 items-center bg-background">
                  <Text className="text-textPrimary">{hours?.openTime}</Text>
                </TouchableOpacity>
                <Text className="text-textMuted mx-4">to</Text>
                <TouchableOpacity className="flex-1 border border-border rounded-lg py-2 items-center bg-background">
                  <Text className="text-textPrimary">{hours?.closeTime}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}
