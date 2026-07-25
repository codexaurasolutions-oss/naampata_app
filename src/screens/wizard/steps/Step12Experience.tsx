import React from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { useWizardStore } from '../../../stores/wizardStore';

export default function Step12Experience() {
  const { formData, updateFormData } = useWizardStore();

  const handleExpChange = (key: string, value: string) => {
    updateFormData({
      experience: {
        ...formData.experience,
        [key]: value
      }
    });
  };

  const PRICE_RANGES = ['$', '$$', '$$$', '$$$$'];

  return (
    <ScrollView className="flex-1">
      <Text className="text-2xl font-bold text-primary mb-2">Experience & Team</Text>
      <Text className="text-textSecondary mb-6">Provide some background details.</Text>

      <View className="flex-row justify-between mb-4">
        <View className="w-[48%]">
          <Text className="text-textPrimary font-semibold mb-2">Year Established</Text>
          <TextInput 
            className="bg-white border border-border rounded-xl px-4 py-3 text-textPrimary"
            placeholder="e.g. 2015"
            keyboardType="numeric"
            maxLength={4}
            value={formData.experience?.yearEstablished}
            onChangeText={(text) => handleExpChange('yearEstablished', text)}
          />
        </View>
        <View className="w-[48%]">
          <Text className="text-textPrimary font-semibold mb-2">Employee Count</Text>
          <TextInput 
            className="bg-white border border-border rounded-xl px-4 py-3 text-textPrimary"
            placeholder="e.g. 10-50"
            value={formData.experience?.employeeCount}
            onChangeText={(text) => handleExpChange('employeeCount', text)}
          />
        </View>
      </View>

      <Text className="text-textPrimary font-semibold mb-2 mt-2">Price Range</Text>
      <View className="flex-row justify-between mb-6">
        {PRICE_RANGES.map((price) => {
          const isSelected = formData.experience?.priceRange === price;
          return (
            <TouchableOpacity 
              key={price}
              onPress={() => handleExpChange('priceRange', price)}
              className={`flex-1 py-3 items-center border-y border-r first:border-l first:rounded-l-xl last:rounded-r-xl ${isSelected ? 'bg-accent border-accent' : 'bg-white border-border'}`}
            >
              <Text className={`font-semibold ${isSelected ? 'text-white' : 'text-textPrimary'}`}>{price}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text className="text-textPrimary font-semibold mb-2">Languages Spoken</Text>
      <TextInput 
        className="bg-white border border-border rounded-xl px-4 py-3 mb-4 text-textPrimary"
        placeholder="e.g. English, Spanish (comma separated)"
        value={formData.experience?.languages?.join(', ')}
        onChangeText={(text) => {
          const langs = text.split(',').map(l => l.trim()).filter(Boolean);
          updateFormData({ experience: { ...formData.experience, languages: langs } });
        }}
      />
    </ScrollView>
  );
}
