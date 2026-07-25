import React from 'react';
import { View, Text, TextInput, ScrollView } from 'react-native';
import { useWizardStore } from '../../../stores/wizardStore';

export default function Step11Description() {
  const { formData, updateFormData } = useWizardStore();

  const handleDescChange = (key: string, value: string) => {
    updateFormData({
      description: {
        ...formData.description,
        [key]: value
      }
    });
  };

  return (
    <ScrollView className="flex-1">
      <Text className="text-2xl font-bold text-primary mb-2">Description</Text>
      <Text className="text-textSecondary mb-6">Tell customers what makes your business unique.</Text>

      <Text className="text-textPrimary font-semibold mb-2">Short Description / Catchphrase <Text className="text-danger">*</Text></Text>
      <Text className="text-textMuted text-xs mb-2">A quick one-liner that appears on search results.</Text>
      <TextInput 
        className="bg-white border border-border rounded-xl px-4 py-3 mb-6 text-textPrimary"
        placeholder="e.g. Award-winning Italian cuisine in the heart of the city."
        maxLength={120}
        value={formData.description?.short}
        onChangeText={(text) => handleDescChange('short', text)}
      />

      <Text className="text-textPrimary font-semibold mb-2">Full Description <Text className="text-danger">*</Text></Text>
      <Text className="text-textMuted text-xs mb-2">Detailed information about your services, history, and offerings.</Text>
      <TextInput 
        className="bg-white border border-border rounded-xl px-4 py-3 mb-4 text-textPrimary h-40"
        placeholder="e.g. Established in 1999, we provide the best..."
        multiline
        textAlignVertical="top"
        value={formData.description?.full}
        onChangeText={(text) => handleDescChange('full', text)}
      />
    </ScrollView>
  );
}
