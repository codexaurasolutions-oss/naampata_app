import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useWizardStore } from '../../../stores/wizardStore';

// Mock categories for UI demonstration
const MOCK_CATEGORIES = [
  { id: 'cat1', name: 'Restaurants & Dining' },
  { id: 'cat2', name: 'Home Services' },
  { id: 'cat3', name: 'Automotive' },
  { id: 'cat4', name: 'Health & Medical' },
  { id: 'cat5', name: 'Beauty & Spa' },
  { id: 'cat6', name: 'Professional Services' },
];

export default function Step05Category() {
  const { formData, updateFormData } = useWizardStore();
  const [search, setSearch] = useState('');

  const filtered = MOCK_CATEGORIES.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <View className="flex-1">
      <Text className="text-2xl font-bold text-primary mb-2">Category Selection</Text>
      <Text className="text-textSecondary mb-6">Choose the category that best fits your business.</Text>

      <View className="bg-white flex-row items-center rounded-xl px-4 py-3 mb-6 shadow-sm border border-border">
        <Icon name="search" size={24} color="#94A3B8" />
        <TextInput 
          placeholder="Search categories..." 
          className="flex-1 ml-3 text-textPrimary text-base"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView className="flex-1 bg-white rounded-xl shadow-sm border border-border">
        {filtered.map((cat, index) => {
          const isSelected = formData.categoryId === cat.id;
          return (
            <TouchableOpacity 
              key={cat.id}
              onPress={() => updateFormData({ categoryId: cat.id })}
              className={`flex-row justify-between items-center p-4 border-border ${index < filtered.length - 1 ? 'border-b' : ''} ${isSelected ? 'bg-accent/10' : ''}`}
            >
              <Text className={`text-base ${isSelected ? 'text-accent font-bold' : 'text-textPrimary'}`}>
                {cat.name}
              </Text>
              {isSelected && <Icon name="check" size={20} color="#FF7A30" />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
