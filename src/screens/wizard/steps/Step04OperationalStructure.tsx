import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useWizardStore } from '../../../stores/wizardStore';

const STRUCTURE_OPTIONS = [
  { id: 'producer', label: 'Producer / Manufacturer' },
  { id: 'retailer', label: 'Retailer' },
  { id: 'wholesaler', label: 'Wholesaler / Distributor' },
  { id: 'service_provider', label: 'Service Provider' },
  { id: 'freelancer', label: 'Freelancer / Independent' },
  { id: 'agency', label: 'Agency / Firm' },
  { id: 'ngo', label: 'Non-Profit / NGO' },
];

export default function Step04OperationalStructure() {
  const { formData, updateFormData } = useWizardStore();

  const toggleStructure = (id: string) => {
    const current = formData.operationalStructure || [];
    if (current.includes(id)) {
      updateFormData({ operationalStructure: current.filter((t) => t !== id) });
    } else {
      updateFormData({ operationalStructure: [...current, id] });
    }
  };

  return (
    <ScrollView className="flex-1">
      <Text className="text-2xl font-bold text-primary mb-2">Operational Structure</Text>
      <Text className="text-textSecondary mb-6">Select the structures that best describe your organization.</Text>

      <View className="flex-row flex-wrap justify-between">
        {STRUCTURE_OPTIONS.map((structure) => {
          const isSelected = (formData.operationalStructure || []).includes(structure.id);
          return (
            <TouchableOpacity 
              key={structure.id}
              onPress={() => toggleStructure(structure.id)}
              className={`py-3 px-4 rounded-full border mb-3 ${isSelected ? 'border-accent bg-accent' : 'border-border bg-white'}`}
            >
              <Text className={`font-semibold ${isSelected ? 'text-white' : 'text-textPrimary'}`}>
                {structure.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}
