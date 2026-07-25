import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { useWizardStore } from '../../../stores/wizardStore';

export default function Step01NameTagline() {
  const { formData, updateFormData } = useWizardStore();

  return (
    <View className="flex-1">
      <Text className="text-2xl font-bold text-primary mb-2">Basic Details</Text>
      <Text className="text-textSecondary mb-6">Let's start with the name of your business.</Text>

      <Text className="text-textPrimary font-semibold mb-2">Business Name <Text className="text-danger">*</Text></Text>
      <TextInput 
        className="bg-white border border-border rounded-xl px-4 py-3 mb-4 text-textPrimary"
        placeholder="e.g. John's Plumbing Services"
        value={formData.name}
        onChangeText={(text) => updateFormData({ name: text })}
      />

      <Text className="text-textPrimary font-semibold mb-2">Tagline (Optional)</Text>
      <TextInput 
        className="bg-white border border-border rounded-xl px-4 py-3 mb-4 text-textPrimary"
        placeholder="e.g. The best pipes in town"
        value={formData.tagline}
        onChangeText={(text) => updateFormData({ tagline: text })}
      />
    </View>
  );
}
