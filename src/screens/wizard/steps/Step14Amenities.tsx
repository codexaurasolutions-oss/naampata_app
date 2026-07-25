import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useWizardStore } from '../../../stores/wizardStore';

const AMENITIES_LIST = [
  'Wheelchair Accessible',
  'Free Wi-Fi',
  'Parking Available',
  'Restrooms',
  'Air Conditioning',
  'Accepts Credit Cards',
  'Pet Friendly',
  'Delivery Available',
];

export default function Step14Amenities() {
  const { formData, updateFormData } = useWizardStore();

  const toggleAmenity = (amenity: string) => {
    const current = formData.amenities || [];
    if (current.includes(amenity)) {
      updateFormData({ amenities: current.filter((a) => a !== amenity) });
    } else {
      updateFormData({ amenities: [...current, amenity] });
    }
  };

  return (
    <ScrollView className="flex-1">
      <Text className="text-2xl font-bold text-primary mb-2">Amenities</Text>
      <Text className="text-textSecondary mb-6">Select the facilities and features your business offers.</Text>

      <View className="flex-row flex-wrap justify-between">
        {AMENITIES_LIST.map((amenity) => {
          const isSelected = (formData.amenities || []).includes(amenity);
          return (
            <TouchableOpacity 
              key={amenity}
              onPress={() => toggleAmenity(amenity)}
              className={`py-3 px-4 rounded-full border mb-3 w-[48%] items-center ${isSelected ? 'border-accent bg-accent/10' : 'border-border bg-white'}`}
            >
              <Text className={`text-center font-medium ${isSelected ? 'text-accent' : 'text-textPrimary'}`}>
                {amenity}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}
